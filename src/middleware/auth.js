import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "stallhub-jwt-secret-key-32-chars-minimum";

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      stallId: user.stallId
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function authenticate(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: "unauthorized", message: "Please sign in to continue." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "unauthorized", message: "User account is suspended or invalid." });
    }

    req.user = user;
    req.stallId = user.stallId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token", message: "Session expired. Please sign in again." });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ error: "forbidden", message: "Only the platform owner can access this resource." });
  }
  next();
}

export function requireStallOwner(req, res, next) {
  if (req.user?.role !== "stall_owner" && req.user?.role !== "super_admin") {
    return res.status(403).json({ error: "forbidden", message: "Access restricted to stall owners." });
  }
  next();
}
