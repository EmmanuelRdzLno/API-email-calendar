import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { imageToPdfBase64 } from "./pdfHelper.js";

dotenv.config();

// Configuración de OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/google/callback"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Controlador para enviar correo
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body;

    // Solo procesamos attachments si existe y tiene elementos
    let processedAttachments;
    if (attachments && attachments.length > 0) {
      processedAttachments = [];
      for (const att of attachments) {
        if (att.filename.match(/\.(png|jpg|jpeg)$/i)) {
          const pdfBase64 = await imageToPdfBase64(att.content, att.filename);
          processedAttachments.push({
            filename: att.filename.replace(/\.(png|jpg|jpeg)$/i, ".pdf"),
            content: Buffer.from(pdfBase64, "base64"),
          });
        } else {
          processedAttachments.push(att);
        }
      }
    }

    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `"Assistent AI Bot" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      // Solo agregamos attachments si existen
      ...(processedAttachments ? { attachments: processedAttachments } : {}),
    };

    const result = await transporter.sendMail(mailOptions);
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
