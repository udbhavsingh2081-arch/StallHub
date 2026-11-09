import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  console.log("Seeding FoodStallHub database...");

  const adminName = process.env.SUPER_ADMIN_NAME || "Udbhav Singh";
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "udbhavsingh2081@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Udbhavsingh2005%";
  
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash, role: "SUPER_ADMIN", isActive: true, stallId: null },
    create: { name: adminName, email: adminEmail, passwordHash, role: "SUPER_ADMIN", isActive: true }
  });
  console.log(`✓ Super Admin initialized: ${admin.email}`);

  // Create demonstration stall: "Pizza Corner"
  const stall = await prisma.stall.upsert({
    where: { slug: "pizza-corner" },
    update: {
      name: "Pizza Corner",
      tagline: "Artisan Wood-Fired Slices & Fresh Shakes",
      cuisineType: "Italian & Street Fast Food",
      description: "Authentic stone-baked pizzas, freshly brewed beverages, and artisan desserts in the heart of the city.",
      address: "Shop 14, Food Street, City Centre",
      city: "Metropolis",
      phone: "+91 98765 43210",
      email: "hello@pizzacorner.com",
      status: "ACTIVE",
      menuStatus: "PUBLISHED",
      primaryColor: "#142235",
      logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"
    },
    create: {
      name: "Pizza Corner",
      slug: "pizza-corner",
      tagline: "Artisan Wood-Fired Slices & Fresh Shakes",
      cuisineType: "Italian & Street Fast Food",
      description: "Authentic stone-baked pizzas, freshly brewed beverages, and artisan desserts in the heart of the city.",
      address: "Shop 14, Food Street, City Centre",
      city: "Metropolis",
      phone: "+91 98765 43210",
      email: "hello@pizzacorner.com",
      status: "ACTIVE",
      menuStatus: "PUBLISHED",
      primaryColor: "#142235",
      logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"
    }
  });
  console.log(`✓ Demo Stall initialized: ${stall.name} (/menu/${stall.slug})`);

  // Create Stall Owner
  const ownerEmail = "owner@pizzacorner.com";
  const ownerPasswordHash = await bcrypt.hash("StallOwnerPass123!", 12);
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { name: "Marco Rossi", passwordHash: ownerPasswordHash, role: "STALL_OWNER", stallId: stall.id, isActive: true },
    create: { name: "Marco Rossi", email: ownerEmail, passwordHash: ownerPasswordHash, role: "STALL_OWNER", stallId: stall.id, isActive: true }
  });

  await prisma.stallMember.upsert({
    where: { stallId_userId: { stallId: stall.id, userId: owner.id } },
    update: { role: "OWNER", canAddItems: true, canEditPrices: true, canManageCategories: true, canCustomizeMenu: true, canManageStaff: true },
    create: { stallId: stall.id, userId: owner.id, role: "OWNER", canAddItems: true, canEditPrices: true, canManageCategories: true, canCustomizeMenu: true, canManageStaff: true }
  });
  console.log(`✓ Stall Owner initialized: ${owner.email}`);

  // Create Stall Staff
  const staffEmail = "chef@pizzacorner.com";
  const staffPasswordHash = await bcrypt.hash("StaffPass123!", 12);
  const staff = await prisma.user.upsert({
    where: { email: staffEmail },
    update: { name: "Luigi Chef", passwordHash: staffPasswordHash, role: "STALL_STAFF", stallId: stall.id, isActive: true },
    create: { name: "Luigi Chef", email: staffEmail, passwordHash: staffPasswordHash, role: "STALL_STAFF", stallId: stall.id, isActive: true }
  });

  await prisma.stallMember.upsert({
    where: { stallId_userId: { stallId: stall.id, userId: staff.id } },
    update: { role: "STAFF", canAddItems: true, canEditPrices: false, canManageCategories: false, canCustomizeMenu: false, canManageStaff: false },
    create: { stallId: stall.id, userId: staff.id, role: "STAFF", canAddItems: true, canEditPrices: false, canManageCategories: false, canCustomizeMenu: false, canManageStaff: false }
  });
  console.log(`✓ Stall Staff initialized: ${staff.email}`);

  // Theme
  await prisma.stallTheme.upsert({
    where: { stallId: stall.id },
    update: {
      templateId: "STREET_FOOD",
      primaryColor: "#142235",
      secondaryColor: "#E8A64A",
      backgroundColor: "#F5F7FA",
      accentColor: "#27364A",
      fontHeading: "Manrope",
      fontBody: "DM Sans",
      layoutType: "GRID",
      categoryStyle: "TABS",
      cardStyle: "COMPACT",
      isHeaderSticky: true,
      showCoverBanner: true,
      bannerHeight: 240,
      socialLinks: { instagram: "@pizzacorner", whatsapp: "+919876543210" }
    },
    create: {
      stallId: stall.id,
      templateId: "STREET_FOOD",
      primaryColor: "#142235",
      secondaryColor: "#E8A64A",
      backgroundColor: "#F5F7FA",
      accentColor: "#27364A",
      fontHeading: "Manrope",
      fontBody: "DM Sans",
      layoutType: "GRID",
      categoryStyle: "TABS",
      cardStyle: "COMPACT",
      isHeaderSticky: true,
      showCoverBanner: true,
      bannerHeight: 240,
      socialLinks: { instagram: "@pizzacorner", whatsapp: "+919876543210" }
    }
  });

  // QR Code
  const frontendBase = process.env.PUBLIC_MENU_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5000";
  await prisma.qRCode.upsert({
    where: { stallId: stall.id },
    update: { qrUrl: `${frontendBase}/menu/${stall.slug}`, foregroundColor: "#142235", backgroundColor: "#FFFFFF" },
    create: { stallId: stall.id, qrUrl: `${frontendBase}/menu/${stall.slug}`, foregroundColor: "#142235", backgroundColor: "#FFFFFF" }
  });

  // Categories & Items
  const catStarters = await prisma.category.upsert({
    where: { stallId_name: { stallId: stall.id, name: "Starters & Appetizers" } },
    update: { sortOrder: 1, isActive: true },
    create: { stallId: stall.id, name: "Starters & Appetizers", description: "Crispy appetizers to start your meal", sortOrder: 1 }
  });

  const catPizzas = await prisma.category.upsert({
    where: { stallId_name: { stallId: stall.id, name: "Wood-Fired Pizzas" } },
    update: { sortOrder: 2, isActive: true },
    create: { stallId: stall.id, name: "Wood-Fired Pizzas", description: "Handmade dough stone-baked to perfection", sortOrder: 2 }
  });

  const catBeverages = await prisma.category.upsert({
    where: { stallId_name: { stallId: stall.id, name: "Beverages & Shakes" } },
    update: { sortOrder: 3, isActive: true },
    create: { stallId: stall.id, name: "Beverages & Shakes", description: "Chilled shakes and artisanal brews", sortOrder: 3 }
  });

  // Food Items with Variants and Veg/Non-Veg types
  const garlicBread = await prisma.foodItem.upsert({
    where: { id: "item-garlic-bread" },
    update: {},
    create: {
      id: "item-garlic-bread",
      stallId: stall.id,
      categoryId: catStarters.id,
      name: "Cheesy Garlic Bread",
      description: "French loaf toasted with aromatic garlic butter and melted mozzarella.",
      foodType: "VEG",
      basePriceMinor: 14000,
      currencyCode: "INR",
      isAvailable: true,
      isFeatured: true,
      prepTimeMinutes: 10,
      sortOrder: 1,
      tags: ["Bestseller", "Cheesy"],
      imageUrl: "https://images.unsplash.com/photo-1619895092538-128341789043?w=500&h=350&fit=crop"
    }
  });

  const margherita = await prisma.foodItem.upsert({
    where: { id: "item-margherita" },
    update: {},
    create: {
      id: "item-margherita",
      stallId: stall.id,
      categoryId: catPizzas.id,
      name: "Classic Margherita Pizza",
      description: "San Marzano tomato sauce, fresh buffalo mozzarella, and fragrant garden basil.",
      foodType: "VEG",
      basePriceMinor: 24900,
      discountPriceMinor: 21900,
      currencyCode: "INR",
      isAvailable: true,
      isFeatured: true,
      prepTimeMinutes: 15,
      sortOrder: 1,
      tags: ["Classic", "Vegetarian", "Popular"],
      imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&h=350&fit=crop"
    }
  });

  // Margherita variants (Small, Medium, Large)
  await prisma.foodVariant.deleteMany({ where: { foodItemId: margherita.id } });
  await prisma.foodVariant.createMany({
    data: [
      { foodItemId: margherita.id, name: "Regular 8\"", priceMinor: 21900, isAvailable: true, sortOrder: 1 },
      { foodItemId: margherita.id, name: "Medium 10\"", priceMinor: 34900, isAvailable: true, sortOrder: 2 },
      { foodItemId: margherita.id, name: "Large 12\"", priceMinor: 49900, isAvailable: true, sortOrder: 3 }
    ]
  });

  const pepperoni = await prisma.foodItem.upsert({
    where: { id: "item-pepperoni" },
    update: {},
    create: {
      id: "item-pepperoni",
      stallId: stall.id,
      categoryId: catPizzas.id,
      name: "Spicy Pepperoni Feast",
      description: "Loaded with smoky beef pepperoni slices and hot crushed chili oil.",
      foodType: "NON_VEG",
      basePriceMinor: 38000,
      currencyCode: "INR",
      isAvailable: true,
      isFeatured: true,
      prepTimeMinutes: 15,
      sortOrder: 2,
      tags: ["Chef Special", "Spicy"],
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=350&fit=crop"
    }
  });

  const coldCoffee = await prisma.foodItem.upsert({
    where: { id: "item-cold-coffee" },
    update: {},
    create: {
      id: "item-cold-coffee",
      stallId: stall.id,
      categoryId: catBeverages.id,
      name: "Artisan Cold Coffee",
      description: "Slow-brewed arabica espresso blended with rich cream and dark chocolate drizzle.",
      foodType: "VEG",
      basePriceMinor: 9000,
      currencyCode: "INR",
      isAvailable: true,
      isFeatured: false,
      prepTimeMinutes: 5,
      sortOrder: 1,
      tags: ["Refreshing"],
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&h=350&fit=crop"
    }
  });

  await prisma.foodVariant.deleteMany({ where: { foodItemId: coldCoffee.id } });
  await prisma.foodVariant.createMany({
    data: [
      { foodItemId: coldCoffee.id, name: "Small", priceMinor: 6000, isAvailable: true, sortOrder: 1 },
      { foodItemId: coldCoffee.id, name: "Medium", priceMinor: 9000, isAvailable: true, sortOrder: 2 },
      { foodItemId: coldCoffee.id, name: "Large", priceMinor: 12000, isAvailable: true, sortOrder: 3 }
    ]
  });

  // Publication snapshot for public menu
  const fullSnapshot = {
    stall: {
      name: stall.name,
      slug: stall.slug,
      tagline: stall.tagline,
      description: stall.description,
      address: stall.address,
      city: stall.city,
      phone: stall.phone,
      email: stall.email,
      logoUrl: stall.logoUrl,
      coverUrl: stall.coverUrl,
      primaryColor: stall.primaryColor
    },
    theme: {
      templateId: "STREET_FOOD",
      primaryColor: "#142235",
      secondaryColor: "#E8A64A",
      backgroundColor: "#F5F7FA",
      accentColor: "#27364A",
      fontHeading: "Manrope",
      fontBody: "DM Sans",
      layoutType: "GRID",
      categoryStyle: "TABS",
      cardStyle: "COMPACT",
      isHeaderSticky: true,
      showCoverBanner: true,
      bannerHeight: 240,
      socialLinks: { instagram: "@pizzacorner", whatsapp: "+919876543210" }
    },
    categories: [
      {
        id: catStarters.id,
        name: catStarters.name,
        description: catStarters.description,
        sortOrder: 1,
        items: [
          {
            id: garlicBread.id,
            name: garlicBread.name,
            description: garlicBread.description,
            foodType: garlicBread.foodType,
            price: 140,
            currencyCode: "INR",
            imageUrl: garlicBread.imageUrl,
            isFeatured: true,
            prepTimeMinutes: 10,
            tags: garlicBread.tags,
            variants: []
          }
        ]
      },
      {
        id: catPizzas.id,
        name: catPizzas.name,
        description: catPizzas.description,
        sortOrder: 2,
        items: [
          {
            id: margherita.id,
            name: margherita.name,
            description: margherita.description,
            foodType: margherita.foodType,
            price: 219,
            discountPrice: 219,
            originalPrice: 249,
            currencyCode: "INR",
            imageUrl: margherita.imageUrl,
            isFeatured: true,
            prepTimeMinutes: 15,
            tags: margherita.tags,
            variants: [
              { name: 'Regular 8"', price: 219 },
              { name: 'Medium 10"', price: 349 },
              { name: 'Large 12"', price: 499 }
            ]
          },
          {
            id: pepperoni.id,
            name: pepperoni.name,
            description: pepperoni.description,
            foodType: pepperoni.foodType,
            price: 380,
            currencyCode: "INR",
            imageUrl: pepperoni.imageUrl,
            isFeatured: true,
            prepTimeMinutes: 15,
            tags: pepperoni.tags,
            variants: []
          }
        ]
      },
      {
        id: catBeverages.id,
        name: catBeverages.name,
        description: catBeverages.description,
        sortOrder: 3,
        items: [
          {
            id: coldCoffee.id,
            name: coldCoffee.name,
            description: coldCoffee.description,
            foodType: coldCoffee.foodType,
            price: 90,
            currencyCode: "INR",
            imageUrl: coldCoffee.imageUrl,
            isFeatured: false,
            prepTimeMinutes: 5,
            tags: coldCoffee.tags,
            variants: [
              { name: "Small", price: 60 },
              { name: "Medium", price: 90 },
              { name: "Large", price: 120 }
            ]
          }
        ]
      }
    ],
    publishedAt: new Date().toISOString(),
    version: 1
  };

  await prisma.menuPublication.create({
    data: {
      stallId: stall.id,
      version: 1,
      snapshot: fullSnapshot,
      publishedByUserId: owner.id,
      isActive: true
    }
  });

  console.log("✓ Menu Publication snapshot created (v1 active)");
  console.log("Database seeded successfully!");
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
