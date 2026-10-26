import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";

import usuarioRoutes from "./routes/usuario.routes"
import certificadosRoutes from './routes/certificados.routes' 
import dorsalRoutes from './routes/dorsal.routes'

import { errorHandler } from "./middlewares/errorHandler.middleware";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  frontendUrl
  //Van el url del sistema de chips y el del sistema web (url de producción)
];

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors( { origin: allowedOrigins, credentials: true } ));
z.config(z.locales.es())

app.get("/", (req, res) => {
  res.json({ message: "Backend Sistema de clasificaciones CAP funcionando" });
});

//ENDPOINTS
app.use("/api/auth", usuarioRoutes);
app.use('/api', certificadosRoutes)
app.use('/api', dorsalRoutes)

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

export default app