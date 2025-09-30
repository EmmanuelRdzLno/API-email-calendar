import { gmail } from "./google.service.js";

export async function sendEmail(to, subject, body) {
  const rawMessage = [
    `To: ${to}`,
    "Subject: " + subject,
    "Content-Type: text/html; charset=utf-8",
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return { success: true, message: "Email enviado con Gmail API 🚀" };
}
