import QRCode from "qrcode";
import { Stall } from "../models/Stall.js";

export class StallController {
  static async getMyStall(req, res) {
    try {
      let stallId = req.stallId;
      if (!stallId && req.user.role === "super_admin") {
        const first = await Stall.findOne();
        stallId = first?._id;
      }

      if (!stallId) {
        return res.status(404).json({ error: "not_found", message: "No stall assigned to this account." });
      }

      const stall = await Stall.findById(stallId);
      if (!stall) {
        return res.status(404).json({ error: "not_found", message: "Stall not found." });
      }

      res.json({ stall });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async updateMyStall(req, res) {
    try {
      const stallId = req.stallId || req.params.id;
      const { name, tagline, description, cuisine, phone, address, city, openingHours, logo, banner, socialLinks } = req.body;

      const stall = await Stall.findByIdAndUpdate(
        stallId,
        {
          ...(name && { name: name.trim() }),
          ...(tagline !== undefined && { tagline: tagline.trim() }),
          ...(description !== undefined && { description: description.trim() }),
          ...(cuisine !== undefined && { cuisine: cuisine.trim() }),
          ...(phone !== undefined && { phone: phone.trim() }),
          ...(address !== undefined && { address: address.trim() }),
          ...(city !== undefined && { city: city.trim() }),
          ...(openingHours !== undefined && { openingHours: openingHours.trim() }),
          ...(logo && { logo: logo.trim() }),
          ...(banner && { banner: banner.trim() }),
          ...(socialLinks && { socialLinks })
        },
        { new: true }
      );

      res.json({ message: "Stall updated successfully.", stall });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async getQRCode(req, res) {
    try {
      const stallId = req.stallId || req.params.id;
      const stall = await Stall.findById(stallId);
      if (!stall) return res.status(404).json({ error: "not_found" });

      const host = req.get("host") || "localhost:5000";
      const protocol = req.protocol || "http";
      const targetUrl = `${protocol}://${host}/menu/${stall.slug}?source=qr`;

      const qrDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 480,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" }
      });

      res.json({
        slug: stall.slug,
        targetUrl,
        qrDataUrl,
        scanCount: stall.scanCount
      });
    } catch (err) {
      res.status(500).json({ error: "qr_failed", message: err.message });
    }
  }
}
export default StallController;
