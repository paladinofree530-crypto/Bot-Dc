const db = require("../database/db");

function startStatusScheduler(client, intervalMs = 60000) {
  setInterval(async () => {
    try {
      const rows = db.prepare(`SELECT channel_id FROM tickets WHERE status = 'open'`).all();
      const { getTicketByChannel } = require("../ticket/ticketService");

      for (const row of rows) {
        const channel = await client.channels.fetch(row.channel_id).catch(() => null);
        if (!channel) continue;
        const ticket = getTicketByChannel(row.channel_id);
        if (!ticket) continue;
      }
    } catch (err) {
      console.error("[STATUS SCHEDULER ERROR]", err);
    }
  }, intervalMs);
}

module.exports = { startStatusScheduler };
