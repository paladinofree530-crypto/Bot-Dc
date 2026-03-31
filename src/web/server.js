const express = require("express");
const path = require("path");
const config = require("../config");
const db = require("../database/db");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic realm=Dashboard");
    return res.status(401).send("Autenticação necessária");
  }

  const encoded = header.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [user, pass] = decoded.split(":");

  if (user !== config.webUsername && config.web?.user && user !== config.web.user) return res.status(403).send("Credenciais inválidas");
  if (pass !== config.webPassword && config.web?.pass && pass !== config.web.pass) return res.status(403).send("Credenciais inválidas");

  next();
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tickets", auth, (_req, res) => {
  const rows = db.prepare(`SELECT * FROM tickets ORDER BY id DESC LIMIT 100`).all();
  res.json(rows);
});

app.get("/ticket/:code", auth, (req, res) => {
  const ticket = db.prepare(`SELECT * FROM tickets WHERE ticket_code = ?`).get(req.params.code);
  if (!ticket) return res.status(404).json({ error: "Ticket não encontrado" });

  const messages = db.prepare(`SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC`).all(ticket.id);
  const events = db.prepare(`SELECT * FROM ticket_events WHERE ticket_id = ? ORDER BY id ASC`).all(ticket.id);

  res.json({ ticket, messages, events });
});

app.listen(config.webPort || 3000, () => {
  console.log(`Painel web online na porta ${config.webPort || 3000}`);
});
