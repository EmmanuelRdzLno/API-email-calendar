import { PDFDocument } from "pdf-lib";

/**
 * Convierte cualquier imagen en base64 a PDF en base64
 * @param {string} imageBase64 - Imagen en base64 (puede tener prefijo data:image)
 * @param {string} filename - Nombre original del archivo
 * @returns {Promise<string>} PDF en base64
 */
export async function imageToPdfBase64(imageBase64, filename) {
  let imageType = null;

  // Detectar tipo por prefijo
  if (imageBase64.startsWith("data:")) {
    const match = imageBase64.match(/^data:image\/(png|jpe?g);base64,/i);
    if (!match) throw new Error("Tipo de imagen no soportado o prefijo incorrecto");
    imageType = match[1].toLowerCase() === "jpg" ? "jpeg" : match[1].toLowerCase();
    imageBase64 = imageBase64.split(",")[1];
  } else {
    // Detectar tipo por extensión
    if (filename.match(/\.png$/i)) imageType = "png";
    else if (filename.match(/\.(jpg|jpeg)$/i)) imageType = "jpeg";
    else throw new Error("Formato de imagen no soportado: " + filename);
  }

  // Limpiar base64
  imageBase64 = imageBase64.replace(/\s/g, "");

  const pdfDoc = await PDFDocument.create();
  const imageBytes = Buffer.from(imageBase64, "base64");

  let image;
  if (imageType === "png") image = await pdfDoc.embedPng(imageBytes);
  else if (imageType === "jpeg") image = await pdfDoc.embedJpg(imageBytes);

  const { width, height } = image.size();
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
