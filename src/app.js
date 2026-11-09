import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool, prisma } from "./db.js";
import { UserModel } from "./models/UserModel.js";
import { requireAuth } from "./middleware/auth.js";
import { notFound, errorHandler } from "./middleware/errors.js";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import stallRoutes from "./routes/stall.js";
import publicMenuRoutes from "./routes/publicMenu.js";
import webRoutes from "./routes/web.js";

const app = express();
const PgStore = connectPgSimple(session);

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Tailwind CDN & Google Fonts on web views
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(null, true); // Allow all during development & demo testing
    },
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// PostgreSQL-backed Session Store
app.use(
  session({
    store: new PgStore({ pool, tableName: "user_sessions", createTableIfMissing: true }),
    name: "foodstallhub.sid",
    secret: process.env.SESSION_SECRET || "foodstallhub-super-secret-key-32-chars-long",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// Passport Local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user || !user.isActive) {
        return done(null, false, { message: "Email or password is incorrect." });
      }
      const valid = await UserModel.verifyPassword(password, user.passwordHash);
      if (!valid) {
        return done(null, false, { message: "Email or password is incorrect." });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "FoodStallHub API (MVC)",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("HEALTH_CHECK_ERROR", error.message);
    res.status(503).json({
      status: "degraded",
      service: "FoodStallHub API",
      database: "unavailable"
    });
  }
});

// Authentication Status Check
app.get("/api/session-check", requireAuth, (req, res) => {
  res.json({ authenticated: true, user: UserModel.sanitize(req.user) });
});

// Mount Web & API Routers
app.use("/", webRoutes);
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stall", stallRoutes);
app.use("/api/shop", stallRoutes); // Backward compatibility alias
app.use("/api/public/menu", publicMenuRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
