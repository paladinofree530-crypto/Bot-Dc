const OpenAI = require("openai");
const config = require("../config");

const client = config.useOpenAI && config.openAIApiKey
  ? new OpenAI({ apiKey: config.openAIApiKey })
  : null;

function mockAnalyze(text) {
  const lower = String(text || "").toLowerCase();

  const result = {
    tipo: "duvida",
    prioridade: "media",
    setor: "administrativo",
    conflito: false,
    envolveCorregedoria: false,
    envolveComando: false,
    envolveAltoEscalao: false,
    isSimple: true,
    summary: "Caso classificado automaticamente.",
    shouldReply: true,
    reply: "Entendi. Envie mais detalhes objetivos para eu direcionar corretamente.",
    askForEvidence: false,
    needsEscalation: false
  };

  if (lower.includes("denuncia") || lower.includes("abuso") || lower.includes("corrup") || lower.includes("xing")) {
    result.tipo = "denuncia";
    result.prioridade = "alta";
    result.setor = "corregedoria";
    result.isSimple = false;
    result.summary = "Denúncia identificada automaticamente.";
    result.reply = "Entendi seu relato. Envie nome/ID do envolvido e, se possível, provas ou testemunhas para encaminhamento correto.";
    result.askForEvidence = true;
    result.needsEscalation = true;
  }

  if (lower.includes("corregedoria")) {
    result.envolveCorregedoria = true;
    result.conflito = true;
  }

  if (lower.includes("comando geral") || lower.includes("comandante geral")) {
    result.envolveComando = true;
    result.prioridade = "critica";
    result.isSimple = false;
  }

  if (lower.includes("coronel") || lower.includes("major") || lower.includes("alto escal")) {
    result.envolveAltoEscalao = true;
    result.prioridade = "critica";
    result.isSimple = false;
  }

  if (lower.includes("erro") || lower.includes("bug") || lower.includes("script") || lower.includes("f8")) {
    result.tipo = "suporte_tecnico";
    result.setor = "suporte";
    result.reply = "A análise inicial indica um caso técnico. Envie print do erro, log do F8 e diga qual recurso está afetado.";
  }

  return result;
}

async function analyzeTicket(text) {
  if (!client) return mockAnalyze(text);

  try {
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `Analise o texto e devolva JSON válido com: tipo, prioridade, setor, conflito, envolveCorregedoria, envolveComando, envolveAltoEscalao, isSimple, summary, shouldReply, reply, askForEvidence, needsEscalation.\n\nTexto:\n${text}`
    });

    return JSON.parse(response.output_text || "{}");
  } catch {
    return mockAnalyze(text);
  }
}

module.exports = { analyzeTicket };
