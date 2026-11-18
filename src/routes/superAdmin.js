import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdminController.js";
import { authenticate, requireSuperAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/overview", authenticate, requireSuperAdmin, SuperAdminController.getOverview);
router.get("/check-availability", authenticate, requireSuperAdmin, SuperAdminController.checkAvailability);
router.post("/stalls", authenticate, requireSuperAdmin, SuperAdminController.createStall);
router.patch("/stalls/:id/status", authenticate, requireSuperAdmin, SuperAdminController.toggleStallStatus);

export default router;
