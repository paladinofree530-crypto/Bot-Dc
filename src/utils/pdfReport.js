const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function generatePDF(text, filename, corregedorNome = "Corregedor") {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 50;

  const logoPath = path.join(process.cwd(), "assets/logo.png");
  if (fs.existsSync(logoPath)) {
    const imageBytes = fs.readFileSync(logoPath);
    const image = await pdfDoc.embedPng(imageBytes);
    page.drawImage(image, { x: 50, y: height - 100, width: 60, height: 60 });
  }

  page.drawText("COMANDO DE OPERAÇÕES TÁTICAS", { x: 120, y: height - 60, size: 14, font });
  page.drawText("RELATÓRIO DE CORREGEDORIA", { x: 120, y: height - 80, size: 12, font: normalFont });

  y = height - 130;
  const lines = text.split("\n");

  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 10, font: normalFont, color: rgb(0, 0, 0) });
    y -= 15;
    if (y < 100) break;
  }

  page.drawText("━━━━━━━━━━━━━━━━━━━━━━", { x: 50, y: 80, size: 10, font: normalFont });
  page.drawText(corregedorNome, { x: 50, y: 65, size: 10, font });
  page.drawText("Corregedoria - COT", { x: 50, y: 50, size: 10, font: normalFont });

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}

module.exports = { generatePDF };
