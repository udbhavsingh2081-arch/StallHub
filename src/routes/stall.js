import { Router } from "express";
import { StallController } from "../controllers/stallController.js";
import { authenticate, requireStallOwner } from "../middleware/auth.js";

const router = Router();
router.get("/my", authenticate, requireStallOwner, StallController.getMyStall);
router.put("/my", authenticate, requireStallOwner, StallController.updateMyStall);
router.get("/my/qr", authenticate, requireStallOwner, StallController.getQRCode);

export default router;
