const { ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const db = require("../database/db");
const config = require("../config");

function nextTicketCode() {
  const row = db.prepare("SELECT id FROM tickets ORDER BY id DESC LIMIT 1").get();
  const nextId = (row?.id || 0) + 1;
  return `T-${String(nextId).padStart(5, "0")}`;
}

function getTicketByChannel(channelId) {
  return db.prepare("SELECT * FROM tickets WHERE channel_id = ?").get(channelId);
}

function getTicketById(id) {
  return db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
}

function saveTicketEvent(ticketId, eventType, actor, payload = {}) {
  db.prepare(`
    INSERT INTO ticket_events (ticket_id, event_type, actor_id, actor_tag, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(ticketId, eventType, actor?.id || null, actor?.tag || null, JSON.stringify(payload), new Date().toISOString());
}

function saveMessage(ticketId, message) {
  db.prepare(`
    INSERT OR IGNORE INTO ticket_messages (
      ticket_id, message_id, author_id, author_tag, content, timestamp,
      attachments_json, links_json, embeds_json, message_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ticketId,
    message.messageId,
    message.authorId,
    message.authorTag,
    message.content,
    message.timestamp,
    JSON.stringify(message.attachments || []),
    JSON.stringify(message.links || []),
    JSON.stringify(message.embeds || []),
    message.messageType || "text"
  );
}

function updateWorkflowStatus(channelId, workflowStatus) {
  db.prepare(`UPDATE tickets SET workflow_status = ? WHERE channel_id = ?`).run(workflowStatus, channelId);
}

async function createPanel(channel) {
  const embed = new EmbedBuilder()
    .setTitle("Central de Tickets")
    .setDescription("Selecione a categoria para abrir seu ticket.")
    .setColor(0x2b2d31);

  const select = new StringSelectMenuBuilder()
    .setCustomId("ticket_category_select")
    .setPlaceholder("Escolha uma categoria")
    .addOptions(
      { label: "Suporte Técnico", value: "suporte_tecnico" },
      { label: "Denúncia", value: "denuncia" },
      { label: "Corregedoria", value: "corregedoria" },
      { label: "Problema Hierárquico", value: "problema_hierarquico" },
      { label: "Subdivisões", value: "subdivisoes" },
      { label: "Recrutamento", value: "recrutamento" },
      { label: "Outros", value: "outros" }
    );

  const row = new ActionRowBuilder().addComponents(select);
  await channel.send({ embeds: [embed], components: [row] });
}

async function openTicket(interaction, category) {
  const guild = interaction.guild;
  const code = nextTicketCode();

  const channel = await guild.channels.create({
    name: `ticket-${code.toLowerCase()}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId || null,
    topic: `Ticket ${code} | Autor: ${interaction.user.id} | Categoria: ${category}`
  });

  const closeBtn = new ButtonBuilder()
    .setCustomId("ticket_close")
    .setLabel("Fechar Ticket")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeBtn);

  db.prepare(`
    INSERT INTO tickets (
      ticket_code, channel_id, guild_id, author_id, author_tag, category,
      status, workflow_status, priority, open_reason, opened_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'open', 'aberto', 'media', ?, ?)
  `).run(code, channel.id, guild.id, interaction.user.id, interaction.user.tag, category, "", new Date().toISOString());

  await channel.send({
    content: `${interaction.user}, ticket criado com sucesso. Descreva o caso com detalhes.`,
    components: [row]
  });

  await interaction.reply({ content: `Seu ticket foi criado: ${channel}`, ephemeral: true });
  return channel;
}

module.exports = {
  createPanel,
  openTicket,
  getTicketByChannel,
  getTicketById,
  saveTicketEvent,
  saveMessage,
  updateWorkflowStatus
};
