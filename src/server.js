import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`✓ StallHub MERN Server running on port ${PORT}`);
    console.log(`  Local URL: http://localhost:${PORT}`);
  });

  async function shutdown() {
    console.log("Shutting down StallHub server...");
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
