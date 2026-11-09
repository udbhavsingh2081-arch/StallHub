import { prisma } from "../db.js";
import { ThemeModel } from "./ThemeModel.js";

export class PublicationModel {
  static async getActivePublication(stallId) {
    return prisma.menuPublication.findFirst({
      where: { stallId, isActive: true },
      orderBy: { publishedAt: "desc" }
    });
  }

  static async listHistory(stallId) {
    return prisma.menuPublication.findMany({
      where: { stallId },
      orderBy: { version: "desc" },
      include: {
        publishedByUser: { select: { id: true, name: true, email: true } }
      }
    });
  }

  static async buildLiveDraftSnapshot(stallId) {
    const [stall, theme, categories] = await Promise.all([
      prisma.stall.findUnique({
        where: { id: stallId },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          description: true,
          cuisineType: true,
          address: true,
          city: true,
          phone: true,
          email: true,
          logoUrl: true,
          coverUrl: true,
          primaryColor: true,
          status: true
        }
      }),
      ThemeModel.getByStall(stallId),
      prisma.category.findMany({
        where: { stallId, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          foodItems: {
            where: { isAvailable: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            include: {
              variants: {
                where: { isAvailable: true },
                orderBy: { sortOrder: "asc" }
              }
            }
          }
        }
      })
    ]);

    if (!stall) throw new Error("Stall not found.");

    return {
      stall,
      theme,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        items: cat.foodItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          foodType: item.foodType,
          price: item.basePriceMinor / 100,
          discountPrice: item.discountPriceMinor ? item.discountPriceMinor / 100 : null,
          currencyCode: item.currencyCode,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          prepTimeMinutes: item.prepTimeMinutes,
          sortOrder: item.sortOrder,
          tags: item.tags,
          variants: item.variants.map(v => ({
            id: v.id,
            name: v.name,
            description: v.description,
            price: v.priceMinor / 100
          }))
        }))
      })),
      generatedAt: new Date().toISOString()
    };
  }

  static async publish(stallId, publishedByUserId) {
    const snapshot = await this.buildLiveDraftSnapshot(stallId);

    // Get the next version number
    const lastPub = await prisma.menuPublication.findFirst({
      where: { stallId },
      orderBy: { version: "desc" }
    });
    const nextVersion = (lastPub?.version || 0) + 1;

    // Deactivate previous active publications
    await prisma.menuPublication.updateMany({
      where: { stallId, isActive: true },
      data: { isActive: false }
    });

    // Create the new active publication
    const publication = await prisma.menuPublication.create({
      data: {
        stallId,
        version: nextVersion,
        snapshot,
        publishedByUserId,
        isActive: true
      }
    });

    // Mark stall as published
    await prisma.stall.update({
      where: { id: stallId },
      data: { menuStatus: "PUBLISHED" }
    });

    return publication;
  }

  static async unpublish(stallId) {
    await prisma.menuPublication.updateMany({
      where: { stallId, isActive: true },
      data: { isActive: false }
    });

    await prisma.stall.update({
      where: { id: stallId },
      data: { menuStatus: "DRAFT" }
    });

    return { message: "Menu unpublished successfully." };
  }

  static async rollback(stallId, targetVersion) {
    const target = await prisma.menuPublication.findFirst({
      where: { stallId, version: Number(targetVersion) }
    });
    if (!target) throw new Error(`Version ${targetVersion} not found.`);

    await prisma.menuPublication.updateMany({
      where: { stallId, isActive: true },
      data: { isActive: false }
    });

    await prisma.menuPublication.update({
      where: { id: target.id },
      data: { isActive: true }
    });

    await prisma.stall.update({
      where: { id: stallId },
      data: { menuStatus: "PUBLISHED" }
    });

    return target;
  }
}

export default PublicationModel;
