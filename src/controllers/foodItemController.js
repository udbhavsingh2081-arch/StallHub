import { FoodItem } from "../models/FoodItem.js";

export class FoodItemController {
  static async getItems(req, res) {
    try {
      const stallId = req.stallId || req.query.stallId;
      if (!stallId) return res.status(400).json({ error: "missing_stall_id" });

      const items = await FoodItem.find({ stallId })
        .populate("categoryId", "name")
        .sort({ displayOrder: 1, createdAt: 1 });

      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async createItem(req, res) {
    try {
      const stallId = req.stallId;
      const { categoryId, name, description, price, foodType, image, variants, isFeatured } = req.body;

      if (!name || !price || !categoryId) {
        return res.status(400).json({ error: "missing_fields", message: "Name, price, and category are required." });
      }

      const item = await FoodItem.create({
        stallId,
        categoryId,
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        foodType: foodType || "veg",
        image: image?.trim() || "",
        variants: Array.isArray(variants) ? variants : [],
        isFeatured: Boolean(isFeatured),
        isAvailable: true
      });

      res.status(201).json({ message: "Food item created.", item });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      const item = await FoodItem.findOneAndUpdate(
        { _id: id, stallId: req.stallId },
        updates,
        { new: true }
      );

      if (!item) return res.status(404).json({ error: "Item not found." });
      res.json({ message: "Food item updated.", item });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const item = await FoodItem.findOne({ _id: id, stallId: req.stallId });
      if (!item) return res.status(404).json({ error: "Item not found." });

      item.isAvailable = !item.isAvailable;
      await item.save();

      res.json({
        message: `Item marked as ${item.isAvailable ? "In Stock" : "Sold Out"}.`,
        isAvailable: item.isAvailable,
        item
      });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const item = await FoodItem.findOneAndDelete({ _id: id, stallId: req.stallId });
      if (!item) return res.status(404).json({ error: "Item not found." });

      res.json({ message: "Food item deleted." });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }
}
export default FoodItemController;
