import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN"));

// Overview & Analytics
router.get("/overview", SuperAdminController.getOverview);
router.get("/analytics", SuperAdminController.getAnalytics);
router.get("/audit-logs", SuperAdminController.getAuditLogs);

// Stalls Management
router.get("/stalls", SuperAdminController.listStalls);
router.post("/stalls", SuperAdminController.createStall);
router.get("/stalls/:id", SuperAdminController.getStallDetails);
router.patch("/stalls/:id", SuperAdminController.updateStall);
router.patch("/stalls/:id/status", SuperAdminController.setStallStatus);

// Owners & Approval Management
router.get("/owners", SuperAdminController.listOwners);
router.post("/owners", SuperAdminController.createOwner);
router.patch("/owners/:id", SuperAdminController.updateOwner);
router.get("/check-availability", SuperAdminController.checkAvailability);
router.post("/approve-shopkeeper/:id", SuperAdminController.approveShopkeeper);
router.post("/reject-shopkeeper/:id", SuperAdminController.rejectShopkeeper);

// Backward Compatibility aliases for legacy endpoints
router.get("/shops", SuperAdminController.listStalls);
router.post("/shops", SuperAdminController.createStall);
router.patch("/shops/:id", SuperAdminController.updateStall);
router.get("/shopkeepers", SuperAdminController.listOwners);
router.post("/shopkeepers", SuperAdminController.createOwner);
router.patch("/shopkeepers/:id", SuperAdminController.updateOwner);

export default router;
