const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");
const { openTicket, getTicketByChannel, saveTicketEvent, updateWorkflowStatus } = require("../ticket/ticketService");
const { generateNormalTranscript } = require("../transcript/transcriptService");

module.exports = async (client, interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_category_select") {
    const category = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`ticket_reason_modal:${category}`)
      .setTitle("Abrir ticket");

    const reason = new TextInputBuilder()
      .setCustomId("ticket_reason")
      .setLabel("Descreva o problema")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(reason));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("ticket_reason_modal:")) {
    const category = interaction.customId.split(":")[1];
    const reason = interaction.fields.getTextInputValue("ticket_reason");

    const channel = await openTicket(interaction, category);
    const ticket = getTicketByChannel(channel.id);
    if (ticket) {
      saveTicketEvent(ticket.id, "ticket_opened", interaction.user, { category, reason });
      await channel.send(`📌 Motivo inicial: ${reason}`);
    }
    return;
  }

  if (interaction.isButton() && interaction.customId === "ticket_close") {
    const ticket = getTicketByChannel(interaction.channel.id);
    if (!ticket) return;

    await interaction.reply({ content: "Fechando ticket...", ephemeral: true });
    updateWorkflowStatus(interaction.channel.id, "resolvido");
    saveTicketEvent(ticket.id, "ticket_closed", interaction.user, { reason: "Fechamento manual via botão" });
    await generateNormalTranscript(client, interaction.channel.id);
    await interaction.channel.send("Ticket encerrado. Transcript registrada.").catch(() => null);
    await interaction.channel.delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => null);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const ticket = getTicketByChannel(interaction.channelId);
  if (!ticket) {
    return interaction.reply({ content: "Esse comando só pode ser usado dentro de um ticket.", ephemeral: true });
  }

  const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
  if (!isStaff) {
    return interaction.reply({ content: "Você não tem permissão para usar esse comando.", ephemeral: true });
  }

  if (interaction.commandName === "ticket-assumir") {
    saveTicketEvent(ticket.id, "ticket_assumed", interaction.user, {});
    updateWorkflowStatus(interaction.channel.id, "em_analise");
    return interaction.reply({ content: `✅ ${interaction.user} assumiu este ticket.`, ephemeral: false });
  }

  if (interaction.commandName === "ticket-escalar") {
    const destino = interaction.options.getString("destino", true);
    const motivo = interaction.options.getString("motivo", true);
    saveTicketEvent(ticket.id, "ticket_escalated", interaction.user, { destino, motivo });
    return interaction.reply({ content: `📌 Ticket escalado para ${destino}.`, ephemeral: false });
  }
};
