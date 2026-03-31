const { logDeletion } = require("../utils/logger");

module.exports = async (message) => {
  if (!message?.guild) return;

  logDeletion({
    author: message.author?.tag || "unknown",
    content: message.content || "",
    channel: message.channel?.name || "unknown"
  });
};
