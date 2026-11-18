import mongoose from "mongoose";

const stallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    cuisine: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    logo: {
      type: String,
      default: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop"
    },
    banner: {
      type: String,
      default: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    openingHours: { type: String, default: "11:00 AM - 11:00 PM" },
    socialLinks: {
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      facebook: { type: String, default: "" }
    },
    primaryColor: { type: String, default: "#f59e0b" },
    scanCount: { type: Number, default: 0 },
    visitorCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Stall = mongoose.model("Stall", stallSchema);
export default Stall;
