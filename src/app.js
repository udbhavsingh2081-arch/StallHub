import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import stallRoutes from "./routes/stall.js";
import categoryRoutes from "./routes/categories.js";
import foodItemRoutes from "./routes/foodItems.js";
import superAdminRoutes from "./routes/superAdmin.js";
import publicMenuRoutes from "./routes/publicMenu.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "degraded",
    service: "StallHub MERN Stack API",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/stall", stallRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/food-items", foodItemRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/public/menu", publicMenuRoutes);

// Static Client Serving (Production / Unified Single-Port Hosting)
const clientDistPath = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "not_found", message: "API endpoint not found." });
  }
  res.sendFile(path.join(clientDistPath, "index.html"), err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>StallHub API</title></head>
        <body style="font-family:sans-serif;padding:40px;background:#f8fafc;color:#0f172a;">
          <h2>StallHub MERN API Server is Running</h2>
          <p>Database: <strong>Connected</strong></p>
          <p>Client build: Run <code>npm run build</code> to compile the React frontend.</p>
          <p><a href="/api/health">Check Health</a></p>
        </body>
        </html>
      `);
    }
  });
});

export default app;
