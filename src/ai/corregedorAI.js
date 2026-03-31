const { analyzeCorruptionRisk } = require("./antiCorruption");
const { analyzeReporter } = require("./fakeReportDetector");

function analyzeCase(ticket) {
  let confidence = 0;
  const reasons = [];

  if (ticket.accused_id) {
    const risk = analyzeCorruptionRisk(ticket.accused_id);
    if (risk.level === "critico") {
      confidence += 3;
      reasons.push("histórico negativo do acusado");
    }
  }

  if (ticket.author_id) {
    const reporter = analyzeReporter(ticket.author_id);
    if (reporter.level === "alto") {
      confidence -= 2;
      reasons.push("denunciante com baixa confiabilidade");
    }
  }

  if (ticket.priority === "critica") {
    confidence += 3;
    reasons.push("gravidade elevada");
  }

  let decision = "indefinido";
  if (confidence >= 4) decision = "procedente";
  else if (confidence <= 0) decision = "improcedente";

  let punishment = "avaliar manualmente";
  if (decision === "procedente") {
    punishment = confidence >= 6 ? "suspensão severa" : "advertência ou suspensão leve";
  }

  return { decision, confidence, reasons, punishment };
}

module.exports = { analyzeCase };
