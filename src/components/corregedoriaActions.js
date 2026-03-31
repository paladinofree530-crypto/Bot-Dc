const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function buildCorregedoriaActions() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("corregedoria_assumir")
      .setLabel("Assumir caso")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("corregedoria_analise")
      .setLabel("Em análise")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("corregedoria_provas")
      .setLabel("Solicitar provas")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("corregedoria_relatorio")
      .setLabel("Gerar relatório")
      .setStyle(ButtonStyle.Primary)
  );
}

module.exports = { buildCorregedoriaActions };
