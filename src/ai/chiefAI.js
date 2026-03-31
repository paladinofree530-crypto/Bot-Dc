const { analyzeCorruptionRisk } = require("./antiCorruption");
const { analyzeReporter } = require("./fakeReportDetector");

function evaluateTicket(ticket) {
  let score = 0;
  const reasons = [];

  if (ticket.accused_id) {
    const risk = analyzeCorruptionRisk(ticket.accused_id);
    if (risk.level === "critico") {
      score += 5;
      reasons.push("acusado com alto risco");
    }
  }

  if (ticket.author_id) {
    const reporter = analyzeReporter(ticket.author_id);
    if (reporter.level === "alto") {
      score -= 3;
      reasons.push("denunciante com histórico suspeito");
    }
  }

  if (ticket.priority === "critica") score += 5;
  if (ticket.priority === "alta") score += 3;

  if (ticket.opened_at) {
    const hours = (Date.now() - new Date(ticket.opened_at).getTime()) / 3600000;
    if (hours >= 1) {
      score += 2;
      reasons.push("tempo elevado");
    }
  }

  let level = "baixa";
  if (score >= 8) level = "critica";
  else if (score >= 5) level = "alta";
  else if (score >= 2) level = "media";

  return { score, level, reasons };
}

function suggestAction(result) {
  if (result.level === "critica") return "Encaminhar imediatamente para a corregedoria";
  if (result.level === "alta") return "Priorizar análise nas próximas ações";
  if (result.level === "media") return "Monitorar e coletar mais informações";
  return "Sem urgência";
}

module.exports = { evaluateTicket, suggestAction };
