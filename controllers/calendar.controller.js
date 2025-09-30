import { google } from "googleapis";
import dotenv from "dotenv";
import { imageToPdfBase64 } from "./pdfHelper.js"; // función compartida

dotenv.config();

// Configuración OAuth2 para Google Calendar
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/google/callback"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Crear evento en Google Calendar
export const createEvent = async (req, res) => {
  try {
    let { summary, description, start, end, attendees, attachments } = req.body;

    // Filtra al organizador de los asistentes para evitar problemas de envío
    const organizerEmail = process.env.EMAIL_USER;
    attendees = (attendees || []).filter(a => a.email !== organizerEmail);

    // Convierte imágenes base64 a PDFs
    const processedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.filename.match(/\.(png|jpg|jpeg)$/i)) {
          const pdfBase64 = await imageToPdfBase64(att.content, att.filename);
          processedAttachments.push({
            filename: att.filename.replace(/\.(png|jpg|jpeg)$/i, ".pdf"),
            content: pdfBase64,
            encoding: "base64",
          });
        } else {
          processedAttachments.push(att);
        }
      }

      // Opcional: agregar los nombres de archivos a la descripción del evento
      const attachmentList = processedAttachments.map(a => `Archivo: ${a.filename}`).join("\n");
      description = description ? description + "\n\n" + attachmentList : attachmentList;
    }

    // Crear cliente de Calendar API
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees,
    };

    // Insertar evento y enviar invitaciones
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "all", // ⚡ envía invitaciones a todos los asistentes
      conferenceDataVersion: 1, // opcional si quieres Google Meet
    });

    res.json({ success: true, event: response.data, attachments: processedAttachments });
  } catch (error) {
    console.error("❌ Error creando evento:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
