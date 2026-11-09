import { Router } from "express";
import { PublicMenuController } from "../controllers/publicMenuController.js";
import { renderPortalLandingHtml } from "../views/templates/portalLanding.js";
import { renderStallUnavailableHtml } from "../views/templates/stallUnavailable.js";
import { renderLoginPageHtml } from "../views/templates/loginPage.js";
import { renderStallAdminHtml } from "../views/templates/stallAdminPage.js";
import { renderSuperAdminHtml } from "../views/templates/superAdminPage.js";
import { StallModel } from "../models/StallModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { FoodItemModel } from "../models/FoodItemModel.js";
import { QRModel } from "../models/QRModel.js";
import { AnalyticsModel } from "../models/AnalyticsModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { Presenter } from "../views/presenters/Presenter.js";
import { prisma } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  res.redirect("/portal");
});

router.get("/portal", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPortalLandingHtml());
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated?.() && req.user?.isActive) {
    if (req.user.role === "SUPER_ADMIN") {
      return res.redirect("/super-admin");
    }
    return res.redirect("/stall-admin");
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderLoginPageHtml());
});

router.get(["/stall-admin", "/dashboard"], async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.isActive) {
    return res.redirect("/login");
  }

  let stallId = req.user.stallId;
  if (!stallId && req.user.role === "SUPER_ADMIN") {
    const firstStall = await prisma.stall.findFirst({ orderBy: { createdAt: "asc" } });
    stallId = firstStall?.id;
  }

  if (!stallId) {
    return res.status(403).send("No food stall is assigned to this account.");
  }

  const [stall, categories, foodItems, analytics, qrCode] = await Promise.all([
    StallModel.findById(stallId),
    CategoryModel.listByStall(stallId),
    FoodItemModel.listByStall(stallId),
    AnalyticsModel.getStallAnalytics(stallId, 30),
    QRModel.getByStall(stallId)
  ]);

  if (!stall) return res.status(404).send("Stall not found.");

  const formattedItems = foodItems.map(i => Presenter.formatFoodItem(i));
  const formattedCats = categories.map(c => Presenter.formatCategory(c));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(
    renderStallAdminHtml({
      stall: Presenter.formatStall(stall),
      categories: formattedCats,
      foodItems: formattedItems,
      user: req.user,
      analytics,
      qrCode
    })
  );
});

router.get(["/super-admin", "/admin"], async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.isActive) {
    return res.redirect("/login");
  }
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).send("Forbidden: Only the website platform owner (Super Admin) can access this console.");
  }

  const [stalls, owners, analytics, recentActivity] = await Promise.all([
    StallModel.listAll(),
    prisma.user.findMany({
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
    }),
    AnalyticsModel.getPlatformAnalytics(),
    AuditLogModel.list({ limit: 8 })
  ]);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(
    renderSuperAdminHtml({
      stalls: stalls.map(s => Presenter.formatStall(s)),
      owners,
      metrics: analytics.overview,
      recentActivity,
      user: req.user
    })
  );
});

router.get("/unavailable", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderStallUnavailableHtml({ reason: "SUSPENDED" }));
});

// Customer Public Menu & QR Poster views
router.get("/menu/:slug", PublicMenuController.renderMenuView);
router.get("/menu/:slug/poster", PublicMenuController.renderPoster);
router.get("/menu/:slug/preview", PublicMenuController.renderPreviewView);

export default router;
