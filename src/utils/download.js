const fs = require("fs");
const path = require("path");
const https = require("https");

function ensureAttachmentsDir() {
  const dir = path.resolve("attachments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeFilename(name = "file") {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function downloadFile(url, filename) {
  const dir = ensureAttachmentsDir();
  const filePath = path.join(dir, sanitizeFilename(filename));

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filePath, () => reject(new Error(`Falha ao baixar: ${response.statusCode}`)));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(filePath));
      });
    }).on("error", (err) => {
      file.close();
      fs.unlink(filePath, () => reject(err));
    });
  });
}

module.exports = { downloadFile };
