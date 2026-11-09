import { StallModel } from "../models/StallModel.js";
import { UserModel } from "../models/UserModel.js";
import { AnalyticsModel } from "../models/AnalyticsModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { Presenter } from "../views/presenters/Presenter.js";
import { prisma } from "../db.js";

export class SuperAdminController {
  static async getOverview(req, res) {
    const analytics = await AnalyticsModel.getPlatformAnalytics();
    const recentActivity = await AuditLogModel.list({ limit: 10 });
    res.json({
      metrics: analytics.overview,
      stallsSummary: analytics.stallsSummary,
      recentActivity
    });
  }

  static async listStalls(req, res) {
    const stalls = await StallModel.listAll();
    res.json({ stalls: stalls.map(s => Presenter.formatStall(s)) });
  }

  static async getStallDetails(req, res) {
    const stall = await StallModel.findById(req.params.id);
    if (!stall) return res.status(404).json({ message: "Stall not found." });
    res.json({ stall: Presenter.formatStall(stall) });
  }

  static async createStall(req, res) {
    const {
      name, slug, description, tagline, cuisineType, address, city, phone, email,
      logoUrl, coverUrl, primaryColor,
      ownerName, ownerEmail, ownerPassword, ownerPhone
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Stall name is required." });
    }

    // Check slug collision
    if (slug) {
      const existing = await StallModel.findBySlug(slug);
      if (existing) return res.status(400).json({ message: "A stall with this URL slug already exists." });
    }

    const stall = await StallModel.create({
      name, slug, description, tagline, cuisineType, address, city, phone, email,
      logoUrl, coverUrl, primaryColor
    });

    let ownerUser = null;
    if (ownerEmail?.trim() && ownerPassword) {
      ownerUser = await UserModel.createOwner({
        name: ownerName?.trim() || `${name} Owner`,
        email: ownerEmail.trim(),
        password: ownerPassword,
        stallId: stall.id,
        phone: ownerPhone
      });
    }

    await AuditLogModel.log({
      req,
      action: "STALL_CREATED",
      entityType: "Stall",
      entityId: stall.id,
      stallId: stall.id,
      details: { name: stall.name, slug: stall.slug, ownerEmail }
    });

    res.status(201).json({
      stall: Presenter.formatStall(stall),
      owner: UserModel.sanitize(ownerUser)
    });
  }

  static async updateStall(req, res) {
    try {
      const updated = await StallModel.update(req.params.id, req.body);
      await AuditLogModel.log({
        req,
        action: "STALL_UPDATED",
        entityType: "Stall",
        entityId: updated.id,
        stallId: updated.id,
        details: req.body
      });
      res.json({ stall: Presenter.formatStall(updated) });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async setStallStatus(req, res) {
    const { status } = req.body;
    if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed: ACTIVE, SUSPENDED, INACTIVE." });
    }
    const updated = await StallModel.setStatus(req.params.id, status);
    await AuditLogModel.log({
      req,
      action: `STALL_STATUS_${status}`,
      entityType: "Stall",
      entityId: updated.id,
      stallId: updated.id,
      details: { previousStatus: updated.status, newStatus: status }
    });
    res.json({ stall: Presenter.formatStall(updated) });
  }

  static async listOwners(req, res) {
    const owners = await prisma.user.findMany({
      where: { role: { in: ["STALL_OWNER", "SHOP_ADMIN"] } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        stallId: true,
        stall: { select: { id: true, name: true, slug: true, status: true } },
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ owners });
  }

  static async createOwner(req, res) {
    const { name, email, password, stallId, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !stallId) {
      return res.status(400).json({ message: "Name, email, stallId, and password of at least 8 characters are required." });
    }
    const stall = await StallModel.findById(stallId);
    if (!stall) return res.status(404).json({ message: "Stall not found." });

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: "An account with this email already exists." });

    const owner = await UserModel.createOwner({ name, email, password, stallId, phone });
    await AuditLogModel.log({
      req,
      action: "OWNER_CREATED",
      entityType: "User",
      entityId: owner.id,
      stallId,
      details: { email: owner.email, stallName: stall.name }
    });

    res.status(201).json({ owner: UserModel.sanitize(owner) });
  }

  static async updateOwner(req, res) {
    const data = {};
    if (typeof req.body.isActive === "boolean") data.isActive = req.body.isActive;
    if (typeof req.body.name === "string" && req.body.name.trim()) data.name = req.body.name.trim();
    if (typeof req.body.phone === "string") data.phone = req.body.phone.trim();

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, phone: true, isActive: true, stallId: true }
    });

    await AuditLogModel.log({
      req,
      action: "OWNER_UPDATED",
      entityType: "User",
      entityId: user.id,
      stallId: user.stallId,
      details: data
    });

    res.json({ owner: user });
  }

  static async checkAvailability(req, res) {
    const { email, slug } = req.query;
    const result = {
      email: email?.toLowerCase().trim() || null,
      emailAvailable: true,
      existingUser: null,
      slug: slug ? StallModel.slugify(slug) : null,
      slugAvailable: true,
      existingStall: null
    };

    if (result.email) {
      const user = await UserModel.findByEmail(result.email);
      if (user) {
        result.emailAvailable = false;
        result.existingUser = { id: user.id, name: user.name, email: user.email, stallName: user.stall?.name };
      }
    }

    if (result.slug) {
      const stall = await StallModel.findBySlug(result.slug);
      if (stall) {
        result.slugAvailable = false;
        result.existingStall = { id: stall.id, name: stall.name, slug: stall.slug, status: stall.status };
      }
    }

    res.json(result);
  }

  static async approveShopkeeper(req, res) {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { stall: true }
    });
    if (!user) return res.status(404).json({ message: "Shopkeeper account not found." });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      select: { id: true, name: true, email: true, isActive: true, stallId: true }
    });

    if (user.stallId) {
      await prisma.stall.update({
        where: { id: user.stallId },
        data: { status: "ACTIVE" }
      });
    }

    await AuditLogModel.log({
      req,
      action: "SHOPKEEPER_APPROVED",
      entityType: "User",
      entityId: user.id,
      stallId: user.stallId,
      details: { email: user.email, stallName: user.stall?.name }
    });

    res.json({
      message: `Shopkeeper ${user.name} (${user.email}) has been approved and activated!`,
      user: updatedUser
    });
  }

  static async rejectShopkeeper(req, res) {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { stall: true }
    });
    if (!user) return res.status(404).json({ message: "Shopkeeper account not found." });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true, stallId: true }
    });

    if (user.stallId) {
      await prisma.stall.update({
        where: { id: user.stallId },
        data: { status: "SUSPENDED" }
      });
    }

    await AuditLogModel.log({
      req,
      action: "SHOPKEEPER_REJECTED",
      entityType: "User",
      entityId: user.id,
      stallId: user.stallId,
      details: { email: user.email, stallName: user.stall?.name }
    });

    res.json({
      message: `Shopkeeper ${user.name} (${user.email}) has been suspended/rejected.`,
      user: updatedUser
    });
  }

  static async getAuditLogs(req, res) {
    const logs = await AuditLogModel.list({ limit: 100 });
    res.json({ logs });
  }

  static async getAnalytics(req, res) {
    const analytics = await AnalyticsModel.getPlatformAnalytics();
    res.json(analytics);
  }
}

export default SuperAdminController;
