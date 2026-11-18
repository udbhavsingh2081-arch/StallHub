import { Stall } from "../models/Stall.js";
import { Category } from "../models/Category.js";
import { FoodItem } from "../models/FoodItem.js";

export class PublicMenuController {
  static async getPublicMenu(req, res) {
    try {
      const { slug } = req.params;
      const stall = await Stall.findOne({ slug: slug.toLowerCase().trim() });

      if (!stall) {
        return res.status(404).json({ error: "not_found", message: "Stall not found." });
      }

      if (stall.status === "suspended") {
        return res.status(403).json({
          suspended: true,
          message: "This digital menu is temporarily unavailable.",
          stall: { name: stall.name, logo: stall.logo }
        });
      }

      // Track analytics asynchronously
      const isQR = req.query.source === "qr";
      if (isQR) {
        Stall.findByIdAndUpdate(stall._id, { $inc: { scanCount: 1 } }).exec();
      } else {
        Stall.findByIdAndUpdate(stall._id, { $inc: { visitorCount: 1 } }).exec();
      }

      const categories = await Category.find({ stallId: stall._id, isActive: true })
        .sort({ displayOrder: 1, createdAt: 1 });

      const items = await FoodItem.find({ stallId: stall._id })
        .sort({ displayOrder: 1, createdAt: 1 });

      res.json({
        stall: {
          id: stall._id,
          name: stall.name,
          slug: stall.slug,
          tagline: stall.tagline,
          description: stall.description,
          cuisine: stall.cuisine,
          phone: stall.phone,
          address: stall.address,
          city: stall.city,
          openingHours: stall.openingHours,
          logo: stall.logo,
          banner: stall.banner,
          socialLinks: stall.socialLinks,
          primaryColor: stall.primaryColor
        },
        categories,
        items
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }
}
export default PublicMenuController;
