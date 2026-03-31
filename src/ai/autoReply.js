const config = require("../config");
const { analyzeTicket } = require("./analyzer");

async function buildAutoReply(content) {
  const analysis = await analyzeTicket(content);

  if (!config.aiAutoReply) return null;
  if (!analysis.isSimple) return null;

  if (analysis.tipo === "suporte_tecnico") {
    return "A análise inicial indica um caso técnico simples. Envie print do erro, log do F8, nome do recurso afetado e diga se aconteceu após restart do servidor.";
  }

  if (analysis.tipo === "duvida") {
    return "A análise inicial indica uma dúvida simples. Envie mais contexto, prints e o setor envolvido para orientar melhor o atendimento.";
  }

  return "A análise inicial indica um caso simples. Envie mais detalhes objetivos para acelerar a resolução.";
}

module.exports = { buildAutoReply };
