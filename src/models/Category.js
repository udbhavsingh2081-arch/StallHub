import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: "Stall", required: true, index: true },
    name: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
export default Category;
