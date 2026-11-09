import { CategoryModel } from "../models/CategoryModel.js";
import { FoodItemModel } from "../models/FoodItemModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { Presenter } from "../views/presenters/Presenter.js";

export class MenuController {
  // Categories
  static async listCategories(req, res) {
    const categories = await CategoryModel.listByStall(req.stallId);
    res.json({ categories: categories.map(c => Presenter.formatCategory(c)) });
  }

  static async createCategory(req, res) {
    try {
      const { name, description, imageUrl, sortOrder } = req.body;
      if (!name?.trim()) return res.status(400).json({ message: "Category name is required." });

      const category = await CategoryModel.create({
        stallId: req.stallId,
        name,
        description,
        imageUrl,
        sortOrder
      });

      await AuditLogModel.log({
        req,
        action: "CATEGORY_CREATED",
        entityType: "Category",
        entityId: category.id,
        stallId: req.stallId,
        details: { name: category.name }
      });

      res.status(201).json({ category: Presenter.formatCategory(category) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const updated = await CategoryModel.update(req.params.id, req.stallId, req.body);
      await AuditLogModel.log({
        req,
        action: "CATEGORY_UPDATED",
        entityType: "Category",
        entityId: updated.id,
        stallId: req.stallId,
        details: req.body
      });
      res.json({ category: Presenter.formatCategory(updated) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { moveItemsToCategoryId } = req.body || {};
      await CategoryModel.delete(req.params.id, req.stallId, { moveItemsToCategoryId });
      await AuditLogModel.log({
        req,
        action: "CATEGORY_DELETED",
        entityType: "Category",
        entityId: req.params.id,
        stallId: req.stallId
      });
      res.json({ message: "Category deleted successfully." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Food Items
  static async listItems(req, res) {
    const { categoryId, isAvailable, foodType } = req.query;
    const items = await FoodItemModel.listByStall(req.stallId, { categoryId, isAvailable, foodType });
    res.json({ items: items.map(i => Presenter.formatFoodItem(i)) });
  }

  static async getItem(req, res) {
    const item = await FoodItemModel.findById(req.params.id, req.stallId);
    if (!item) return res.status(404).json({ message: "Food item not found." });
    res.json({ item: Presenter.formatFoodItem(item) });
  }

  static async createItem(req, res) {
    try {
      const item = await FoodItemModel.create({
        stallId: req.stallId,
        ...req.body
      });
      await AuditLogModel.log({
        req,
        action: "FOOD_ITEM_CREATED",
        entityType: "FoodItem",
        entityId: item.id,
        stallId: req.stallId,
        details: { name: item.name, price: item.basePriceMinor / 100 }
      });
      res.status(201).json({ item: Presenter.formatFoodItem(item) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateItem(req, res) {
    try {
      const updated = await FoodItemModel.update(req.params.id, req.stallId, req.body);
      await AuditLogModel.log({
        req,
        action: "FOOD_ITEM_UPDATED",
        entityType: "FoodItem",
        entityId: updated.id,
        stallId: req.stallId,
        details: req.body
      });
      res.json({ item: Presenter.formatFoodItem(updated) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async toggleAvailability(req, res) {
    try {
      const { isAvailable } = req.body;
      const updated = await FoodItemModel.toggleAvailability(req.params.id, req.stallId, isAvailable);
      await AuditLogModel.log({
        req,
        action: updated.isAvailable ? "FOOD_ITEM_AVAILABLE" : "FOOD_ITEM_UNAVAILABLE",
        entityType: "FoodItem",
        entityId: updated.id,
        stallId: req.stallId
      });
      res.json({ item: Presenter.formatFoodItem(updated) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async duplicateItem(req, res) {
    try {
      const clone = await FoodItemModel.duplicate(req.params.id, req.stallId);
      await AuditLogModel.log({
        req,
        action: "FOOD_ITEM_DUPLICATED",
        entityType: "FoodItem",
        entityId: clone.id,
        stallId: req.stallId,
        details: { originalId: req.params.id, newName: clone.name }
      });
      res.status(201).json({ item: Presenter.formatFoodItem(clone) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async deleteItem(req, res) {
    try {
      await FoodItemModel.delete(req.params.id, req.stallId);
      await AuditLogModel.log({
        req,
        action: "FOOD_ITEM_DELETED",
        entityType: "FoodItem",
        entityId: req.params.id,
        stallId: req.stallId
      });
      res.json({ message: "Food item deleted successfully." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Variants
  static async addVariant(req, res) {
    try {
      const variant = await FoodItemModel.addVariant(req.params.id, req.stallId, req.body);
      res.status(201).json({
        variant: {
          id: variant.id,
          name: variant.name,
          description: variant.description,
          price: variant.priceMinor / 100,
          isAvailable: variant.isAvailable
        }
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateVariant(req, res) {
    try {
      const updated = await FoodItemModel.updateVariant(req.params.id, req.stallId, req.body);
      res.json({
        variant: {
          id: updated.id,
          name: updated.name,
          description: updated.description,
          price: updated.priceMinor / 100,
          isAvailable: updated.isAvailable
        }
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async deleteVariant(req, res) {
    try {
      await FoodItemModel.deleteVariant(req.params.id, req.stallId);
      res.json({ message: "Variant deleted successfully." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default MenuController;
