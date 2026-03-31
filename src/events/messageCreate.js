const { getTicketByChannel, saveMessage, saveTicketEvent } = require("../ticket/ticketService");
const { extractUrls, classifyUrl, classifyAttachment } = require("../utils/links");
const { downloadFile } = require("../utils/download");
const { analyzeTicket } = require("../ai/analyzer");
const { resolveRouting } = require("../ticket/routing");
const { allowRole, allowUser, denyUser } = require("../utils/permissions");
const { notifyRoleMembers } = require("../utils/notifyRoleMembers");
const { logMessage } = require("../utils/logger");
const config = require("../config");
const db = require("../database/db");

function getRecentMessages(ticketId, limit = 10) {
  return db.prepare(`
    SELECT author_tag, content, timestamp
    FROM ticket_messages
    WHERE ticket_id = ?
      AND content IS NOT NULL
      AND TRIM(content) != ''
    ORDER BY id DESC
    LIMIT ?
  `).all(ticketId, limit).reverse();
}

function buildContext(ticket, recentMessages, newMessage) {
  const history = recentMessages.map((m) => `[${m.timestamp}] ${m.author_tag}: ${m.content}`).join("\n");
  return `Você é um atendente inteligente de tickets internos. Analise o contexto e devolva JSON válido com tipo, prioridade, setor, conflito, envolveCorregedoria, envolveComando, envolveAltoEscalao, isSimple, summary, shouldReply, reply, askForEvidence, needsEscalation.\n\nTicket: ${ticket.ticket_code}\nCategoria: ${ticket.category}\nHistórico:\n${history || 'Sem histórico'}\n\nNova mensagem:\n${newMessage.content}`;
}

async function contextualAnalyze(ticket, recentMessages, message) {
  try {
    return await analyzeTicket(buildContext(ticket, recentMessages, message));
  } catch {
    return {
      tipo: "administrativo",
      prioridade: "media",
      setor: "administrativo",
      conflito: false,
      envolveCorregedoria: false,
      envolveComando: false,
      envolveAltoEscalao: false,
      isSimple: true,
      summary: "Caso reanalisado localmente.",
      shouldReply: true,
      reply: "Entendi. Envie mais detalhes objetivos para direcionamento correto.",
      askForEvidence: true,
      needsEscalation: false
    };
  }
}

async function notifyEscalation(message, ticket, routing) {
  if (routing.roleIds?.includes(config.roles.corregedoria)) {
    const text = `🚨 Novo ticket para a Corregedoria\n\nTicket: ${ticket.ticket_code}\nCategoria: ${ticket.category}\nPrioridade: ${ticket.priority}\nAutor: ${ticket.author_tag || ticket.author_id}\nCanal: #${message.channel.name}`;
    await notifyRoleMembers(message.guild, config.roles.corregedoria, text);
  }
}

module.exports = async (message) => {
  if (!message.guild || message.author.bot) return;

  const ticket = getTicketByChannel(message.channel.id);
  if (!ticket) return;

  const urls = extractUrls(message.content).map(classifyUrl);
  const attachments = [];
  for (const a of message.attachments.values()) {
    const filename = `${Date.now()}_${a.name}`;
    try {
      const localPath = await downloadFile(a.url, filename);
      attachments.push({ name: a.name, url: a.url, local: localPath, contentType: a.contentType, size: a.size, kind: classifyAttachment(a) });
    } catch {
      attachments.push({ name: a.name, url: a.url, contentType: a.contentType, size: a.size, kind: classifyAttachment(a) });
    }
  }

  const embeds = message.embeds.map((e) => ({ title: e.title || null, description: e.description || null, url: e.url || null, type: e.data?.type || null }));
  let messageType = "text";
  if (attachments.some((a) => a.kind === "video_attachment")) messageType = "video_attachment";
  else if (attachments.some((a) => a.kind === "image_attachment")) messageType = "image_attachment";
  else if (urls.some((u) => u.type === "external_video_or_media")) messageType = "external_video_link";

  saveMessage(ticket.id, {
    messageId: message.id,
    authorId: message.author.id,
    authorTag: message.author.tag,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
    attachments,
    links: urls,
    embeds,
    messageType
  });

  logMessage({ ticketId: ticket.id, author: message.author.tag, content: message.content });

  if (!message.content || message.content.trim().length < 4) return;
  const recentMessages = getRecentMessages(ticket.id, 10);
  const analysis = await contextualAnalyze(ticket, recentMessages, message);
  const routing = resolveRouting(analysis, ticket.accused_id || null);

  let escalated = false;
  if (analysis.needsEscalation || analysis.tipo === "denuncia" || analysis.envolveAltoEscalao || analysis.envolveComando || analysis.envolveCorregedoria) {
    for (const roleId of routing.roleIds || []) await allowRole(message.channel, roleId);
    for (const userId of routing.userIds || []) await allowUser(message.channel, userId);
    if (ticket.accused_id) await denyUser(message.channel, ticket.accused_id);
    escalated = true;
    await notifyEscalation(message, ticket, routing);
  }

  saveTicketEvent(ticket.id, "message_reanalyzed_contextual", message.author, { content: message.content, analysis, routing, escalated });

  let response = analysis.reply || "Entendi seu caso. Continue enviando detalhes para análise correta.";
  if (analysis.askForEvidence) response += "\n\nEnvie provas, prints, vídeos ou o ID/nome do envolvido para encaminhamento correto.";
  if (escalated && routing.note) response += `\n\n**Encaminhamento atual:** ${routing.note}`;
  if (escalated && routing.mentionText) response += `\n\n${routing.mentionText}`;

  await message.channel.send(`🤖 **Atendimento automático**\n${response}`).catch(() => null);
};
