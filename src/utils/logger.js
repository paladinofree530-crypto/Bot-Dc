const fs = require("fs");
const path = require("path");
const axios = require("axios");
const config = require("../config");

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

async function sendToWebhook(data) {
  if (!config.backupWebhookUrl) return;
  try {
    await axios.post(config.backupWebhookUrl, data);
  } catch (err) {
    console.error("Webhook log error:", err.message);
  }
}

function writeJsonLine(file, data) {
  const filePath = path.join(logDir, file);
  const entry = { timestamp: new Date().toISOString(), ...data };
  fs.appendFileSync(filePath, JSON.stringify(entry) + "\n", "utf8");
  sendToWebhook(entry);
}

function logTicketEvent(event) {
  writeJsonLine("ticket_events.log", event);
}

function logMessage(event) {
  writeJsonLine("messages.log", event);
}

function logDeletion(event) {
  writeJsonLine("deletions.log", event);
}

module.exports = { logTicketEvent, logMessage, logDeletion };
