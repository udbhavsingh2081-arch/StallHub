import { StallModel } from "../models/StallModel.js";
import { FoodItemModel } from "../models/FoodItemModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { AnalyticsModel } from "../models/AnalyticsModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { Presenter } from "../views/presenters/Presenter.js";
import { prisma } from "../db.js";

export class StallAdminController {
  static async getProfile(req, res) {
    const stall = await StallModel.findById(req.stallId);
    if (!stall) return res.status(404).json({ message: "Stall not found." });
    res.json({ stall: Presenter.formatStall(stall) });
  }

  static async updateProfile(req, res) {
    try {
      const allowed = [
        "name", "description", "tagline", "cuisineType",
        "address", "city", "phone", "email", "logoUrl", "coverUrl", "primaryColor"
      ];
      const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
      const updated = await StallModel.update(req.stallId, data);

      await AuditLogModel.log({
        req,
        action: "STALL_PROFILE_UPDATED",
        entityType: "Stall",
        entityId: req.stallId,
        stallId: req.stallId,
        details: data
      });

      res.json({ stall: Presenter.formatStall(updated) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getDashboard(req, res) {
    const [stall, categories, foodItems, analytics, recentActivity] = await Promise.all([
      StallModel.findById(req.stallId),
      CategoryModel.listByStall(req.stallId),
      FoodItemModel.listByStall(req.stallId),
      AnalyticsModel.getStallAnalytics(req.stallId, 30),
      prisma.auditLog.findMany({
        where: { stallId: req.stallId },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } }
      })
    ]);

    const availableCount = foodItems.filter(i => i.isAvailable).length;
    const unavailableCount = foodItems.length - availableCount;

    res.json({
      stall: Presenter.formatStall(stall),
      summary: {
        menuStatus: stall.menuStatus,
        totalItems: foodItems.length,
        availableItems: availableCount,
        unavailableItems: unavailableCount,
        totalCategories: categories.length,
        totalViews: analytics.metrics.totalViews,
        uniqueVisitors: analytics.metrics.uniqueVisitors,
        qrScans: analytics.metrics.qrScans
      },
      analyticsTrends: analytics.dailyTrends,
      recentActivity,
      publicMenuUrl: `${process.env.PUBLIC_MENU_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5000"}/menu/${stall.slug}`
    });
  }
}

export default StallAdminController;
