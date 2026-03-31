const db = require("../database/db");

function analyzeCorruptionRisk(userId) {
  const tickets = db.prepare(`SELECT * FROM tickets WHERE accused_id = ?`).all(userId);

  let score = 0;
  for (const t of tickets) {
    if (t.category === "denuncia") score += 2;
    if (t.priority === "alta") score += 3;
    if (t.priority === "critica") score += 5;
  }

  const total = tickets.length;
  const flags = [];
  if (total >= 5) flags.push("muitas denúncias");
  if (total >= 10) flags.push("reincidência grave");
  if (score >= 20) flags.push("alto risco");

  let level = "baixo";
  if (score >= 20) level = "critico";
  else if (score >= 10) level = "medio";

  return { userId, total, score, level, flags };
}

module.exports = { analyzeCorruptionRisk };
