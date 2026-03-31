function calculateRisk(tickets) {
  let score = 0;
  let denunciaCount = 0;

  for (const t of tickets) {
    if (t.category === "denuncia") {
      score += 2;
      denunciaCount++;
    }
    if (t.priority === "alta") score += 3;
    if (t.priority === "critica") score += 5;
  }

  let pattern = "normal";
  if (denunciaCount >= 5) pattern = "reincidente ⚠️";
  if (denunciaCount >= 10) pattern = "comportamento crítico 🚨";

  return {
    score,
    level: score >= 20 ? "ALTO RISCO 🔴" : score >= 10 ? "MÉDIO RISCO 🟡" : "BAIXO RISCO 🟢",
    pattern
  };
}

module.exports = { calculateRisk };
