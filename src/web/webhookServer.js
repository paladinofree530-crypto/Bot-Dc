const express = require("express");
const db = require("../database/db");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/webhook/log", (req, res) => {
  const data = req.body || {};
  db.prepare(`
    INSERT INTO ticket_events (ticket_id, event_type, actor_id, actor_tag, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.ticketId || null,
    data.type || "external_log",
    data.actorId || "system",
    data.actor || "system",
    JSON.stringify(data),
    new Date().toISOString()
  );

  res.json({ ok: true });
});

app.get("/logs", (_req, res) => {
  const logs = db.prepare(`SELECT * FROM ticket_events ORDER BY created_at DESC LIMIT 100`).all();
  res.json(logs);
});

app.listen(3001, () => {
  console.log("Webhook API online na porta 3001");
});
