const db = require("../database/db");

function analyzeUserHistory(userId) {
  const rows = db.prepare(`SELECT * FROM tickets WHERE author_id = ?`).all(userId);
  let risk = 0;
  for (const t of rows) {
    if (t.priority === "critica") risk += 3;
    if (t.category === "denuncia") risk += 2;
  }
  return risk;
}

function predictSeverity(ticket) {
  const risk = analyzeUserHistory(ticket.author_id);
  if (risk >= 10) return "critica";
  if (risk >= 5) return "alta";
  return ticket.priority;
}

module.exports = { predictSeverity };
