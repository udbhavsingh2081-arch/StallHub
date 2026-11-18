import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.me);
router.post("/logout", AuthController.logout);

export default router;
