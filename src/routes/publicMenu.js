import { Router } from "express";
import { PublicMenuController } from "../controllers/publicMenuController.js";

const router = Router();

router.get("/:slug", PublicMenuController.getMenuJson);

export default router;
