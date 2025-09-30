import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/calendar"
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("Autoriza esta URL:", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Pega el código de autorización aquí: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Tus tokens:", tokens);
    console.log("Guarda este refresh_token en tu .env:", tokens.refresh_token);
    rl.close();
  } catch (error) {
    console.error("❌ Error al obtener tokens:", error);
    rl.close();
  }
});
