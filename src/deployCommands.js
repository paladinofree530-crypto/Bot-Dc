const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("./config");

const commands = [
  new SlashCommandBuilder()
    .setName("ticket-assumir")
    .setDescription("Assume o ticket atual")
    .addStringOption((opt) =>
      opt.setName("observacao")
        .setDescription("Observação opcional ao assumir")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("ticket-escalar")
    .setDescription("Escala o ticket atual para outro setor")
    .addStringOption((opt) =>
      opt.setName("destino")
        .setDescription("Destino do escalonamento")
        .setRequired(true)
        .addChoices(
          { name: "Corregedoria", value: "corregedoria" },
          { name: "Comando Geral", value: "comando_geral" },
          { name: "Subcomando", value: "subcomando" },
          { name: "Outros Comandos Gerais", value: "outros_comandos" }
        )
    )
    .addStringOption((opt) =>
      opt.setName("motivo")
        .setDescription("Motivo do escalonamento")
        .setRequired(true)
    )
].map((c) => c.toJSON());

async function main() {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
  console.log("Comandos slash registrados.");
}

main().catch(console.error);
