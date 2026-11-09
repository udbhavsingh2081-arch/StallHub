import "dotenv/config";
import app from "./app.js";
import { prisma, pool } from "./db.js";

const port = Number(process.env.PORT) || 5000;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  process.env.SESSION_SECRET = "foodstallhub-development-super-secret-key-32-characters-min";
}

const server = app.listen(port, () => {
  console.log(`FoodStallHub API listening on port ${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
