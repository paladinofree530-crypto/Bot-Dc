require("dotenv").config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  useOpenAI: String(process.env.USE_OPENAI).toLowerCase() !== "false",
  openAIApiKey: process.env.OPENAI_API_KEY,

  logChannelId: process.env.LOG_CHANNEL_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  secretTicketCategoryId: process.env.SECRET_TICKET_CATEGORY_ID,
  panelChannelId: process.env.PANEL_CHANNEL_ID,
  transcriptOutputDir: "./transcripts",

  webPort: Number(process.env.WEB_PORT || 3000),
  cooldownSeconds: Number(process.env.TICKET_COOLDOWN_SECONDS || 120),
  maxOpenTicketsPerUser: Number(process.env.MAX_OPEN_TICKETS_PER_USER || 2),
  aiAutoReply: String(process.env.AI_AUTO_REPLY).toLowerCase() !== "false",

  roles: {
    corregedoria: process.env.CORREGEDORIA_ROLE_ID,
    comandoGeral: process.env.COMANDO_GERAL_ROLE_ID,
    subcomando: process.env.SUBCOMANDO_ROLE_ID
  },

  comandosGerais: [
    { id: process.env.COMANDO_1_ID, name: process.env.COMANDO_1_NAME || "comando 1" },
    { id: process.env.COMANDO_2_ID, name: process.env.COMANDO_2_NAME || "comando 2" },
    { id: process.env.COMANDO_3_ID, name: process.env.COMANDO_3_NAME || "comando 3" }
  ].filter((x) => x.id),

  backupWebhookUrl: process.env.BACKUP_WEBHOOK_URL || "",

  slaMinutes: {
    baixa: Number(process.env.SLA_MINUTES_LOW || 240),
    media: Number(process.env.SLA_MINUTES_MEDIUM || 120),
    alta: Number(process.env.SLA_MINUTES_HIGH || 60),
    critica: Number(process.env.SLA_MINUTES_CRITICAL || 15)
  }
};
