import { User } from "../models/User.js";
import { Stall } from "../models/Stall.js";
import { signToken } from "../middleware/auth.js";

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "missing_fields", message: "Email and password are required." });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
      }

      let stall = null;
      if (user.stallId) {
        stall = await Stall.findById(user.stallId);
      }

      const token = signToken(user);
      res.json({
        message: "Signed in successfully.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          stallId: user.stallId,
          stall: stall ? { id: stall._id, name: stall.name, slug: stall.slug, status: stall.status } : null
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "server_error", message: "Login failed. Please try again." });
    }
  }

  static async me(req, res) {
    try {
      let stall = null;
      if (req.user.stallId) {
        stall = await Stall.findById(req.user.stallId);
      }
      res.json({
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          stallId: req.user.stallId,
          stall: stall ? { id: stall._id, name: stall.name, slug: stall.slug, status: stall.status } : null
        }
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static logout(req, res) {
    res.json({ message: "Signed out successfully." });
  }
}
export default AuthController;
