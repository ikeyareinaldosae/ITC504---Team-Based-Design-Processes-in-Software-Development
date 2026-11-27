// Starts the API. Owner: Chandani Gupta.
// Port 5000 matches the frontend proxy in frontend/vite.config.ts. Set PORT in .env to change it.
import { API_BASE_PATH, app } from "./app.js";
import { prisma } from "./rose/prismaClient.js";

const PORT = Number(process.env.PORT ?? 5000);

const server = app.listen(PORT, () => {
  console.log(`[api] Movie Performance API running at http://localhost:${PORT}${API_BASE_PATH}`);
});

// Close the server and the database connection cleanly on Ctrl+C or when stopped.
async function shutdown(signal: string) {
  console.log(`[api] ${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
