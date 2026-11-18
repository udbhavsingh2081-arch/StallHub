import { Stall } from "../models/Stall.js";
import { User } from "../models/User.js";
import { FoodItem } from "../models/FoodItem.js";
import { Category } from "../models/Category.js";

export class SuperAdminController {
  static async getOverview(req, res) {
    try {
      const [stalls, totalDishes] = await Promise.all([
        Stall.find().sort({ createdAt: -1 }),
        FoodItem.countDocuments()
      ]);

      const stallIds = stalls.map(s => s._id);
      const owners = await User.find({ stallId: { $in: stallIds }, role: "stall_owner" });

      const ownerMap = {};
      owners.forEach(o => {
        ownerMap[o.stallId.toString()] = {
          name: o.name,
          email: o.email,
          phone: o.phone
        };
      });

      const enrichedStalls = stalls.map(s => {
        const doc = s.toObject();
        doc.owner = ownerMap[s._id.toString()] || null;
        return doc;
      });

      const totalStalls = stalls.length;
      const activeStalls = stalls.filter(s => s.status === "active").length;
      const totalVisits = stalls.reduce((acc, s) => acc + (s.visitorCount || 0) + (s.scanCount || 0), 0);

      res.json({
        metrics: {
          totalStalls,
          activeStalls,
          suspendedStalls: totalStalls - activeStalls,
          totalDishes,
          totalVisits
        },
        stalls: enrichedStalls
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async checkAvailability(req, res) {
    try {
      const { email, slug } = req.query;
      const results = {};

      if (email) {
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        results.email = {
          value: email,
          available: !existingUser,
          message: existingUser ? "This email is already registered." : "Email is available!"
        };
      }

      if (slug) {
        const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
        const existingStall = await Stall.findOne({ slug: normalized });
        results.slug = {
          value: normalized,
          available: !existingStall,
          message: existingStall ? "This stall slug URL is already taken." : "Slug is available!"
        };
      }

      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async createStall(req, res) {
    try {
      const {
        name,
        slug,
        ownerName,
        ownerEmail,
        ownerPassword,
        phone,
        cuisine,
        description,
        address,
        city
      } = req.body;

      if (!name || !ownerEmail || !ownerPassword) {
        return res.status(400).json({ error: "missing_fields", message: "Stall name, owner email, and password are required." });
      }

      const cleanSlug = (slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");

      const existingSlug = await Stall.findOne({ slug: cleanSlug });
      if (existingSlug) {
        return res.status(400).json({ error: "slug_taken", message: "Stall slug is already taken." });
      }

      const existingUser = await User.findOne({ email: ownerEmail.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ error: "email_taken", message: "An account with this email already exists." });
      }

      const stall = await Stall.create({
        name: name.trim(),
        slug: cleanSlug,
        cuisine: cuisine?.trim() || "Multi-cuisine",
        description: description?.trim() || "",
        phone: phone?.trim() || "",
        email: ownerEmail.toLowerCase().trim(),
        address: address?.trim() || "",
        city: city?.trim() || "",
        status: "active"
      });

      const user = new User({
        name: ownerName?.trim() || name.trim(),
        email: ownerEmail.toLowerCase().trim(),
        password: ownerPassword,
        phone: phone?.trim() || "",
        role: "stall_owner",
        stallId: stall._id,
        isActive: true
      });
      await user.save();

      // Create a default category
      const defaultCat = await Category.create({
        stallId: stall._id,
        name: "Main Menu",
        displayOrder: 1
      });

      res.status(201).json({
        message: "Stall and shopkeeper created successfully.",
        stall,
        owner: { id: user._id, name: user.name, email: user.email }
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async toggleStallStatus(req, res) {
    try {
      const { id } = req.params;
      const stall = await Stall.findById(id);
      if (!stall) return res.status(404).json({ error: "Stall not found." });

      stall.status = stall.status === "active" ? "suspended" : "active";
      await stall.save();

      res.json({
        message: `Stall has been ${stall.status === "active" ? "activated" : "suspended"}.`,
        stall
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }
}
export default SuperAdminController;
