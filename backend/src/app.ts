//backend/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import path from "path";

import usuarioRoutes from "./routes/usuario.routes"
import certificadosRoutes from './routes/certificados.routes' 
import dorsalRoutes from './routes/dorsal.routes'
import entregaKitRoutes from './routes/entregaKit.routes'
import inscripcionRoutes from './routes/inscripcionGestion.routes'
import carreraRoutes from "./routes/carrera.routes";
import carreraEstadoRoutes from "./routes/carreraEstado.routes"; 
import clasificacionRoutes from './routes/clasificacion.routes'
import claveRespaldoRoutes from "./routes/claveRespaldo.routes"
import categoriaRoutes from "./routes/categoria.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import resultadoCategoriaRoutes from './routes/resultadoCategoria.routes'
import usuarioGestionRoutes from "./routes/usuarioGestion.routes"
import { registrarListenerResultadosCategoria } from "./listeners/resultadoCategoria.listener";


const isProduction = process.env.NODE_ENV === "production" || process.env.IS_PACKAGED === "true";

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
app.use('/api', entregaKitRoutes)
app.use('/api', inscripcionRoutes)
app.use("/api/carreras", carreraRoutes);
app.use('/api', carreraEstadoRoutes)
app.use('/api', clasificacionRoutes)
app.use('/api', resultadoCategoriaRoutes)
app.use("/api/categorias", categoriaRoutes);
app.use("/api/claves-respaldo", claveRespaldoRoutes);
app.use("/api/usuarios", usuarioGestionRoutes);

//EN PRODUCCIÓN: El backend sirve el frontend (enviando html estático) además de responder por los endpoints de la API.
if (isProduction) {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));
  
  //Servir el frontend cuando la app ingresa a una URL que no comienza con "/api"
  app.get("*", (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(frontendPath, "index.html"));
    else res.status(404).json({ error: "Ruta API no encontrada" });
  });
}
//EN DEVELOPMENT: Simplemente se encarga de responder los endpoints de la API
else {
  app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
}


app.use(errorHandler);

registrarListenerResultadosCategoria();

export default app