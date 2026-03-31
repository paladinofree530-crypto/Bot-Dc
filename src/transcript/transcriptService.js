const fs = require("fs");
const path = require("path");
const db = require("../database/db");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTicketByChannel(channelId) {
  return db.prepare("SELECT * FROM tickets WHERE channel_id = ?").get(channelId);
}

function getMessages(ticketId) {
  return db.prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC").all(ticketId);
}

function renderHtml(ticket, messages, mode) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escapeHtml(ticket.ticket_code)}</title><style>body{font-family:Arial;background:#111;color:#eee;padding:24px}.card{background:#1b1b1b;padding:16px;border-radius:12px;margin-bottom:16px}.msg{background:#191919;border:1px solid #2a2a2a;padding:12px;border-radius:10px;margin:10px 0}</style></head><body><div class="card"><h1>Transcript ${escapeHtml(ticket.ticket_code)}</h1><p><strong>Modo:</strong> ${escapeHtml(mode)}</p><p><strong>Autor:</strong> ${escapeHtml(ticket.author_tag || ticket.author_id)}</p><p><strong>Categoria:</strong> ${escapeHtml(ticket.category || "")}</p></div><div class="card"><h2>Mensagens</h2>${messages.map(m => `<div class="msg"><strong>${escapeHtml(m.author_tag || m.author_id || "Unknown")}</strong><div>${escapeHtml(m.content || "")}</div></div>`).join("")}</div></body></html>`;
}

function writeTranscript(ticket, html, suffix) {
  const dir = path.resolve("transcripts");
  ensureDir(dir);
  const file = path.join(dir, `${ticket.ticket_code}_${suffix}.html`);
  fs.writeFileSync(file, html, "utf8");
  return file;
}

async function generateNormalTranscript(_client, channelId) {
  const ticket = getTicketByChannel(channelId);
  if (!ticket) return null;
  const messages = getMessages(ticket.id);
  const html = renderHtml(ticket, messages, "normal");
  return writeTranscript(ticket, html, "normal");
}

async function generateAuditTranscript(_client, channelId) {
  const ticket = getTicketByChannel(channelId);
  if (!ticket) return null;
  const messages = getMessages(ticket.id);
  const html = renderHtml(ticket, messages, "audit");
  return writeTranscript(ticket, html, "audit");
}

module.exports = { generateNormalTranscript, generateAuditTranscript };
