const db = require("../database/db");
const { analyzeCase } = require("./corregedorAI");

function generateReport(ticket) {
  const messages = db.prepare(`
    SELECT content
    FROM ticket_messages
    WHERE ticket_id = ?
    ORDER BY id ASC
  `).all(ticket.id);

  const summary = messages.slice(0, 8).map(m => m.content).join("\n");
  const analysis = analyzeCase(ticket);

  return `📄 RELATÓRIO DE CORREGEDORIA\n\nTicket: ${ticket.ticket_code}\nData: ${new Date().toLocaleString("pt-BR")}\n\n━━━━━━━━━━━━━━━━━━━\n\n📝 RESUMO DO CASO:\n${summary || "Sem informações suficientes"}\n\n━━━━━━━━━━━━━━━━━━━\n\n👤 ANÁLISE DO ACUSADO:\n${ticket.accused_name || ticket.accused_id || "Não identificado"}\n\n━━━━━━━━━━━━━━━━━━━\n\n👮 ANÁLISE DO DENUNCIANTE:\n${ticket.author_tag || ticket.author_id}\n\n━━━━━━━━━━━━━━━━━━━\n\n🧠 CONCLUSÃO SUGERIDA:\n${analysis.decision}\n\n📊 Nível de confiança:\n${analysis.confidence}\n\n━━━━━━━━━━━━━━━━━━━\n\n⚖️ SUGESTÃO DE PUNIÇÃO:\n${analysis.punishment}\n\n━━━━━━━━━━━━━━━━━━━\n\n📌 OBSERVAÇÕES:\n${analysis.reasons.join("\n") || "Sem observações"}\n\n━━━━━━━━━━━━━━━━━━━\n\n⚠️ USO INTERNO DA CORREGEDORIA`;
}

module.exports = { generateReport };
