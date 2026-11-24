//backend/src/index.ts
import app from "./app";
import { prisma } from "./config/prisma";
import { cerrarClientes } from "./services/clasificacionEnVivo.service";

const PORT = Number(process.env.PORT) || 3000;

// 127.0.0.1: solo esta notebook.
// si resulta que el lector RDID es Ethernet/LAN habría que poner 0.0.0.0
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Servidor escuchando en http://127.0.0.1:${PORT}`);
});

export async function apagar(): Promise<void> {
  cerrarClientes(); // las conexiones SSE abiertas impedirían que el servidor cierre
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await prisma.$disconnect();
}