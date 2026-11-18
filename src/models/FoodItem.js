import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: "Stall", required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    foodType: { type: String, enum: ["veg", "non_veg", "egg"], default: "veg" },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export default FoodItem;
