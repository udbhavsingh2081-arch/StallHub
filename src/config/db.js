import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Stall } from "../models/Stall.js";
import { Category } from "../models/Category.js";
import { FoodItem } from "../models/FoodItem.js";

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stallhub";
  
  try {
    await mongoose.connect(mongoURI);
    console.log(`✓ MongoDB Connected: ${mongoURI}`);
    await autoSeed();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function autoSeed() {
  try {
    // 1. Ensure Super Admin exists
    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "udbhavsingh2081@gmail.com").toLowerCase().trim();
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Udbhavsingh2005%";
    const adminName = process.env.SUPER_ADMIN_NAME || "Udbhav Singh";

    let superAdmin = await User.findOne({ email: adminEmail });
    if (!superAdmin) {
      superAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "super_admin",
        isActive: true
      });
      await superAdmin.save();
      console.log(`✓ Super Admin initialized: ${adminEmail}`);
    }

    // 2. Ensure Demo Stall exists
    let demoStall = await Stall.findOne({ slug: "pizza-corner" });
    if (!demoStall) {
      demoStall = await Stall.create({
        name: "Pizza Corner",
        slug: "pizza-corner",
        tagline: "Artisan Wood-Fired Slices & Fresh Shakes",
        description: "Freshly made artisan pizzas, crispy sides, and chilled beverages.",
        cuisine: "Italian & Fast Food",
        phone: "+91 98765 43210",
        email: "owner@pizzacorner.com",
        address: "Shop 14, Food Street, City Centre",
        city: "Metropolis",
        openingHours: "11:00 AM - 11:00 PM",
        logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
        banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop",
        status: "active",
        socialLinks: {
          instagram: "https://instagram.com/pizzacorner",
          whatsapp: "+919876543210"
        }
      });
      console.log(`✓ Demo Stall created: ${demoStall.name}`);
    }

    // 3. Ensure Stall Owner exists
    const ownerEmail = "owner@pizzacorner.com";
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      owner = new User({
        name: "Marco Rossi",
        email: ownerEmail,
        password: "StallOwnerPass123!",
        role: "stall_owner",
        stallId: demoStall._id,
        phone: "+91 98765 43210",
        isActive: true
      });
      await owner.save();
      console.log(`✓ Demo Stall Owner initialized: ${ownerEmail}`);
    }

    // 4. Ensure Categories & Items exist for demo stall
    const catCount = await Category.countDocuments({ stallId: demoStall._id });
    if (catCount === 0) {
      const pizzasCat = await Category.create({ stallId: demoStall._id, name: "Pizzas", displayOrder: 1 });
      const sidesCat = await Category.create({ stallId: demoStall._id, name: "Sides & Starters", displayOrder: 2 });
      const drinksCat = await Category.create({ stallId: demoStall._id, name: "Beverages & Shakes", displayOrder: 3 });

      await FoodItem.create([
        {
          stallId: demoStall._id,
          categoryId: pizzasCat._id,
          name: "Margherita Supreme",
          description: "Fresh tomato concasse, basil chiffonade, extra virgin olive oil, and buffalo mozzarella.",
          price: 249,
          foodType: "veg",
          image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=350&fit=crop",
          isAvailable: true,
          isFeatured: true,
          variants: [
            { name: "Regular 8\"", price: 249 },
            { name: "Medium 10\"", price: 399 },
            { name: "Large 12\"", price: 549 }
          ]
        },
        {
          stallId: demoStall._id,
          categoryId: pizzasCat._id,
          name: "Smokey BBQ Pepperoni",
          description: "Smoked spicy chicken pepperoni slices, caramelized onion relish, and mozzarella.",
          price: 349,
          foodType: "non_veg",
          image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=350&fit=crop",
          isAvailable: true,
          isFeatured: true,
          variants: [
            { name: "Regular 8\"", price: 349 },
            { name: "Medium 10\"", price: 499 },
            { name: "Large 12\"", price: 699 }
          ]
        },
        {
          stallId: demoStall._id,
          categoryId: sidesCat._id,
          name: "Garlic Parmesan Stix",
          description: "Baked bread batons coated with roasted garlic butter and aged parmesan dip.",
          price: 139,
          foodType: "veg",
          image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&h=350&fit=crop",
          isAvailable: true,
          variants: []
        },
        {
          stallId: demoStall._id,
          categoryId: drinksCat._id,
          name: "Classic Cold Coffee",
          description: "Double espresso shot blended with creamed whole milk and chocolate drizzle.",
          price: 89,
          foodType: "veg",
          image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&h=350&fit=crop",
          isAvailable: true,
          variants: [
            { name: "Regular", price: 89 },
            { name: "Large with Ice Cream", price: 129 }
          ]
        }
      ]);
      console.log("✓ Demo categories & food items created.");
    }
  } catch (seedErr) {
    console.error("AutoSeed notice:", seedErr.message);
  }
}

export default connectDB;
