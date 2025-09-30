import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

import emailRoutes from "./routes/email.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";

dotenv.config();

const app = express();

// ✅ Aumentar límite de payload a 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cargar swagger.json
const swaggerPath = path.resolve("./docs/swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use("/api/email", emailRoutes);
app.use("/api/calendar", calendarRoutes);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📑 Swagger UI: http://localhost:${PORT}/api-docs`);
});
