import { Category } from "../models/Category.js";
import { FoodItem } from "../models/FoodItem.js";

export class CategoryController {
  static async getCategories(req, res) {
    try {
      const stallId = req.stallId || req.query.stallId;
      if (!stallId) return res.status(400).json({ error: "missing_stall_id" });

      const categories = await Category.find({ stallId, isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async createCategory(req, res) {
    try {
      const stallId = req.stallId;
      const { name, displayOrder } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required." });

      const category = await Category.create({
        stallId,
        name: name.trim(),
        displayOrder: displayOrder || 0
      });

      res.status(201).json({ message: "Category created.", category });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, displayOrder } = req.body;

      const category = await Category.findOneAndUpdate(
        { _id: id, stallId: req.stallId },
        {
          ...(name && { name: name.trim() }),
          ...(displayOrder !== undefined && { displayOrder })
        },
        { new: true }
      );

      if (!category) return res.status(404).json({ error: "Category not found." });
      res.json({ message: "Category updated.", category });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findOneAndDelete({ _id: id, stallId: req.stallId });
      if (!category) return res.status(404).json({ error: "Category not found." });

      // Delete associated food items
      await FoodItem.deleteMany({ categoryId: id });

      res.json({ message: "Category and its items deleted." });
    } catch (err) {
      res.status(500).json({ error: "server_error", message: err.message });
    }
  }
}
export default CategoryController;
