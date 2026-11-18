import { Router } from "express";
import { FoodItemController } from "../controllers/foodItemController.js";
import { authenticate, requireStallOwner } from "../middleware/auth.js";

const router = Router();
router.get("/", authenticate, requireStallOwner, FoodItemController.getItems);
router.post("/", authenticate, requireStallOwner, FoodItemController.createItem);
router.put("/:id", authenticate, requireStallOwner, FoodItemController.updateItem);
router.patch("/:id/toggle", authenticate, requireStallOwner, FoodItemController.toggleAvailability);
router.delete("/:id", authenticate, requireStallOwner, FoodItemController.deleteItem);

export default router;
