import express from "express";
import { createEvent } from "../controllers/calendar.controller.js";

const router = express.Router();

// Ruta para crear evento
router.post("/create", createEvent);

export default router;
