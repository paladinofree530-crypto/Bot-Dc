const config = require("../config");

function getOtherCommandIds(accusedId) {
  return config.comandosGerais.filter((cmd) => cmd.id !== accusedId).map((cmd) => cmd.id);
}

function resolveRouting(analysis, accusedId = null) {
  const route = {
    roleIds: [],
    userIds: [],
    secret: false,
    note: "",
    mentionText: ""
  };

  if (analysis.tipo === "denuncia") {
    route.secret = true;

    if (analysis.envolveComando && accusedId) {
      route.userIds = getOtherCommandIds(accusedId);
      route.note = "Denúncia contra Comando Geral: encaminhada aos outros Comandos Gerais.";
      route.mentionText = route.userIds.map((id) => `<@${id}>`).join(" ");
      return route;
    }

    if (analysis.envolveCorregedoria && !analysis.envolveComando) {
      route.roleIds.push(config.roles.comandoGeral);
      route.note = "Denúncia contra Corregedoria: encaminhada ao Comando Geral.";
      route.mentionText = config.roles.comandoGeral ? `<@&${config.roles.comandoGeral}>` : "";
      return route;
    }

    if (analysis.envolveAltoEscalao) {
      if (config.roles.corregedoria) route.roleIds.push(config.roles.corregedoria);
      if (config.roles.comandoGeral) route.roleIds.push(config.roles.comandoGeral);
      route.note = "Denúncia de alto escalão: Corregedoria e Comando Geral acionados.";
      route.mentionText = [
        config.roles.corregedoria ? `<@&${config.roles.corregedoria}>` : "",
        config.roles.comandoGeral ? `<@&${config.roles.comandoGeral}>` : ""
      ].filter(Boolean).join(" ");
      return route;
    }

    if (config.roles.corregedoria) route.roleIds.push(config.roles.corregedoria);
    route.note = "Denúncia comum: encaminhada à Corregedoria.";
    route.mentionText = config.roles.corregedoria ? `<@&${config.roles.corregedoria}>` : "";
    return route;
  }

  const defaultRole = config.roles.subcomando || config.roles.comandoGeral;
  if (defaultRole) route.roleIds.push(defaultRole);
  route.note = "Caso administrativo/dúvida encaminhado ao setor padrão.";
  route.mentionText = defaultRole ? `<@&${defaultRole}>` : "";
  return route;
}

module.exports = { resolveRouting };
