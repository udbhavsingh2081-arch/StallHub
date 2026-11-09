import { prisma } from "../db.js";

export class StallModel {
  static async findById(id) {
    return prisma.stall.findUnique({
      where: { id },
      include: {
        theme: true,
        qrCode: true,
        _count: {
          select: {
            categories: true,
            foodItems: true,
            analyticsEvents: true,
            members: true
          }
        }
      }
    });
  }

  static async findBySlug(slug) {
    if (!slug) return null;
    return prisma.stall.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        theme: true,
        qrCode: true
      }
    });
  }

  static async listAll() {
    return prisma.stall.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          where: { role: { in: ["STALL_OWNER", "SHOP_ADMIN"] } },
          select: { id: true, name: true, email: true, phone: true, isActive: true }
        },
        theme: true,
        _count: {
          select: {
            categories: true,
            foodItems: true,
            analyticsEvents: true
          }
        }
      }
    });
  }

  static slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static async create({ name, slug, description, tagline, cuisineType, address, city, phone, email, logoUrl, coverUrl, primaryColor }) {
    const finalSlug = (slug ? this.slugify(slug) : this.slugify(name)) || `stall-${Date.now()}`;
    
    // Create Stall with default Theme and QR code record
    const stall = await prisma.stall.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description,
        tagline,
        cuisineType,
        address,
        city,
        phone,
        email,
        logoUrl,
        coverUrl,
        primaryColor: primaryColor || "#142235",
        theme: {
          create: {
            templateId: "MINIMAL",
            primaryColor: primaryColor || "#142235",
            secondaryColor: "#E8A64A",
            backgroundColor: "#F5F7FA"
          }
        },
        qrCode: {
          create: {
            qrUrl: `${process.env.PUBLIC_MENU_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5000"}/menu/${finalSlug}`
          }
        }
      },
      include: {
        theme: true,
        qrCode: true
      }
    });

    return stall;
  }

  static async update(id, data) {
    const allowed = [
      "name", "description", "tagline", "cuisineType", "address",
      "city", "phone", "email", "logoUrl", "coverUrl", "primaryColor", "status", "menuStatus"
    ];
    const updateData = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
    if (updateData.status && !["ACTIVE", "SUSPENDED", "INACTIVE"].includes(updateData.status)) {
      throw new Error("Invalid stall status.");
    }
    return prisma.stall.update({
      where: { id },
      data: updateData,
      include: { theme: true, qrCode: true }
    });
  }

  static async setStatus(id, status) {
    if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
      throw new Error("Invalid stall status.");
    }
    return prisma.stall.update({
      where: { id },
      data: { status }
    });
  }
}

export default StallModel;
