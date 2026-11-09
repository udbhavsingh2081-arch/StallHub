import { Router } from "express";
import { StallAdminController } from "../controllers/stallAdminController.js";
import { MenuController } from "../controllers/menuController.js";
import { ThemeController } from "../controllers/themeController.js";
import { PublicationController } from "../controllers/publicationController.js";
import { QRController } from "../controllers/qrController.js";
import { TeamController } from "../controllers/teamController.js";
import { AnalyticsController } from "../controllers/analyticsController.js";
import { requireAuth, requireRole, requireStallAccess, requirePermission } from "../middleware/auth.js";

const router = Router();

// Protect all stall routes with authentication, tenant check, and stall scoping
router.use(
  requireAuth,
  requireRole("STALL_OWNER", "STALL_MANAGER", "STALL_STAFF", "SHOP_ADMIN", "SUPER_ADMIN"),
  requireStallAccess
);

// Stall Profile & Dashboard
router.get("/profile", StallAdminController.getProfile);
router.patch("/profile", requirePermission("canCustomizeMenu"), StallAdminController.updateProfile);
router.get("/dashboard", StallAdminController.getDashboard);

// Categories
router.get("/categories", MenuController.listCategories);
router.post("/categories", requirePermission("canManageCategories"), MenuController.createCategory);
router.patch("/categories/:id", requirePermission("canManageCategories"), MenuController.updateCategory);
router.delete("/categories/:id", requirePermission("canManageCategories"), MenuController.deleteCategory);

// Food Items
router.get("/items", MenuController.listItems);
router.get("/items/:id", MenuController.getItem);
router.post("/items", requirePermission("canAddItems"), MenuController.createItem);
router.patch("/items/:id", requirePermission("canEditPrices"), MenuController.updateItem);
router.patch("/items/:id/availability", MenuController.toggleAvailability);
router.post("/items/:id/duplicate", requirePermission("canAddItems"), MenuController.duplicateItem);
router.delete("/items/:id", requirePermission("canEditPrices"), MenuController.deleteItem);

// Food Variants
router.post("/items/:id/variants", requirePermission("canEditPrices"), MenuController.addVariant);
router.patch("/variants/:id", requirePermission("canEditPrices"), MenuController.updateVariant);
router.delete("/variants/:id", requirePermission("canEditPrices"), MenuController.deleteVariant);

// Theme & Customization Engine
router.get("/theme", ThemeController.getTheme);
router.get("/theme/templates", ThemeController.getTemplates);
router.patch("/theme", requirePermission("canCustomizeMenu"), ThemeController.updateTheme);
router.post("/theme/apply-template", requirePermission("canCustomizeMenu"), ThemeController.applyTemplate);

// Draft & Publish Management
router.post("/publish", requirePermission("canCustomizeMenu"), PublicationController.publish);
router.post("/unpublish", requirePermission("canCustomizeMenu"), PublicationController.unpublish);
router.get("/publications", PublicationController.getHistory);
router.post("/publications/rollback", requirePermission("canCustomizeMenu"), PublicationController.rollback);

// QR Code Management
router.get("/qr", QRController.getQrDetails);
router.patch("/qr", requirePermission("canCustomizeMenu"), QRController.updateSettings);
router.get("/qr/download/png", QRController.downloadPng);
router.get("/qr/download/svg", QRController.downloadSvg);

// Team & Staff Management
router.get("/team", TeamController.listMembers);
router.post("/team/invite", requirePermission("canManageStaff"), TeamController.inviteStaff);
router.patch("/team/:id/permissions", requirePermission("canManageStaff"), TeamController.updatePermissions);
router.delete("/team/:id", requirePermission("canManageStaff"), TeamController.removeMember);

// Analytics
router.get("/analytics", AnalyticsController.getStallAnalytics);

export default router;
