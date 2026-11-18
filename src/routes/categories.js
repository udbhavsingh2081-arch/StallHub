import { Router } from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { authenticate, requireStallOwner } from "../middleware/auth.js";

const router = Router();
router.get("/", authenticate, requireStallOwner, CategoryController.getCategories);
router.post("/", authenticate, requireStallOwner, CategoryController.createCategory);
router.put("/:id", authenticate, requireStallOwner, CategoryController.updateCategory);
router.delete("/:id", authenticate, requireStallOwner, CategoryController.deleteCategory);

export default router;
