const db = require("../database/db");

function analyzeReporter(userId) {
  const tickets = db.prepare(`
    SELECT * FROM tickets
    WHERE author_id = ?
      AND category = 'denuncia'
  `).all(userId);

  const total = tickets.length;
  let semProva = 0;
  const repeticao = {};
  let criticos = 0;

  for (const t of tickets) {
    if (!t.ai_summary || t.ai_summary.length < 10) semProva++;
    if (t.priority === "critica") criticos++;
    if (t.accused_id) repeticao[t.accused_id] = (repeticao[t.accused_id] || 0) + 1;
  }

  const alvosRepetidos = Object.values(repeticao).filter(v => v >= 3).length;

  let score = 0;
  if (total >= 5) score += 3;
  if (semProva >= 3) score += 3;
  if (alvosRepetidos > 0) score += 4;
  if (criticos === 0 && total >= 5) score += 2;

  let level = "baixo";
  if (score >= 8) level = "alto";
  else if (score >= 5) level = "medio";

  return { userId, total, semProva, alvosRepetidos, score, level };
}

module.exports = { analyzeReporter };
