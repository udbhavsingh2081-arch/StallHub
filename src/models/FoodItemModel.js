import { prisma } from "../db.js";

export class FoodItemModel {
  static async listByStall(stallId, { categoryId, isAvailable, foodType } = {}) {
    const where = { stallId };
    if (categoryId) where.categoryId = categoryId;
    if (isAvailable !== undefined) where.isAvailable = Boolean(isAvailable);
    if (foodType) where.foodType = foodType;

    return prisma.foodItem.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        variants: { orderBy: { sortOrder: "asc" } }
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  static async findById(id, stallId) {
    return prisma.foodItem.findFirst({
      where: { id, stallId },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } }
      }
    });
  }

  static async create({
    stallId,
    categoryId,
    name,
    description,
    imageUrl,
    foodType = "VEG",
    price,
    discountPrice,
    isAvailable = true,
    isFeatured = false,
    prepTimeMinutes,
    sortOrder = 0,
    tags = [],
    variants = []
  }) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, stallId } });
    if (!category) throw new Error("Category does not belong to this stall.");

    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      throw new Error("Valid base price is required.");
    }

    const discountMinor = discountPrice !== undefined && discountPrice !== null && discountPrice !== ""
      ? Math.round(Number(discountPrice) * 100)
      : null;

    const item = await prisma.foodItem.create({
      data: {
        stallId,
        categoryId,
        name: name.trim(),
        description,
        imageUrl,
        foodType: ["VEG", "NON_VEG", "EGG"].includes(foodType) ? foodType : "VEG",
        basePriceMinor: Math.round(priceNumber * 100),
        discountPriceMinor: discountMinor,
        isAvailable: Boolean(isAvailable),
        isFeatured: Boolean(isFeatured),
        prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : null,
        sortOrder: Number(sortOrder) || 0,
        tags: Array.isArray(tags) ? tags : [],
        variants: variants && variants.length > 0 ? {
          create: variants.map((v, i) => ({
            name: v.name.trim(),
            description: v.description,
            priceMinor: Math.round(Number(v.price) * 100),
            isAvailable: v.isAvailable !== false,
            sortOrder: v.sortOrder || i + 1
          }))
        } : undefined
      },
      include: {
        category: true,
        variants: true
      }
    });

    return item;
  }

  static async update(id, stallId, data) {
    const existing = await prisma.foodItem.findFirst({ where: { id, stallId } });
    if (!existing) throw new Error("Food item not found or access denied.");

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.foodType !== undefined && ["VEG", "NON_VEG", "EGG"].includes(data.foodType)) {
      updateData.foodType = data.foodType;
    }
    if (data.price !== undefined) {
      const p = Number(data.price);
      if (!Number.isFinite(p) || p < 0) throw new Error("Price must be 0 or greater.");
      updateData.basePriceMinor = Math.round(p * 100);
    }
    if (data.discountPrice !== undefined) {
      updateData.discountPriceMinor = data.discountPrice === null || data.discountPrice === ""
        ? null
        : Math.round(Number(data.discountPrice) * 100);
    }
    if (data.isAvailable !== undefined) updateData.isAvailable = Boolean(data.isAvailable);
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
    if (data.prepTimeMinutes !== undefined) {
      updateData.prepTimeMinutes = data.prepTimeMinutes ? Number(data.prepTimeMinutes) : null;
    }
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : [];

    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await prisma.category.findFirst({ where: { id: data.categoryId, stallId } });
      if (!category) throw new Error("Category must belong to this stall.");
      updateData.categoryId = category.id;
    }

    return prisma.foodItem.update({
      where: { id: existing.id },
      data: updateData,
      include: { category: true, variants: true }
    });
  }

  static async toggleAvailability(id, stallId, isAvailable) {
    const existing = await prisma.foodItem.findFirst({ where: { id, stallId } });
    if (!existing) throw new Error("Food item not found or access denied.");

    return prisma.foodItem.update({
      where: { id: existing.id },
      data: { isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : !existing.isAvailable }
    });
  }

  static async duplicate(id, stallId) {
    const existing = await prisma.foodItem.findFirst({
      where: { id, stallId },
      include: { variants: true }
    });
    if (!existing) throw new Error("Food item not found or access denied.");

    return prisma.foodItem.create({
      data: {
        stallId: existing.stallId,
        categoryId: existing.categoryId,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        imageUrl: existing.imageUrl,
        foodType: existing.foodType,
        basePriceMinor: existing.basePriceMinor,
        discountPriceMinor: existing.discountPriceMinor,
        currencyCode: existing.currencyCode,
        isAvailable: existing.isAvailable,
        isFeatured: false,
        prepTimeMinutes: existing.prepTimeMinutes,
        sortOrder: existing.sortOrder + 1,
        tags: existing.tags,
        variants: {
          create: existing.variants.map(v => ({
            name: v.name,
            description: v.description,
            priceMinor: v.priceMinor,
            isAvailable: v.isAvailable,
            sortOrder: v.sortOrder
          }))
        }
      },
      include: { category: true, variants: true }
    });
  }

  static async delete(id, stallId) {
    const existing = await prisma.foodItem.findFirst({ where: { id, stallId } });
    if (!existing) throw new Error("Food item not found or access denied.");

    return prisma.foodItem.delete({
      where: { id: existing.id }
    });
  }

  // Variant operations
  static async addVariant(itemId, stallId, { name, price, description, isAvailable = true }) {
    const item = await prisma.foodItem.findFirst({ where: { id: itemId, stallId } });
    if (!item) throw new Error("Food item not found.");

    const priceNum = Number(price);
    if (!name?.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      throw new Error("Variant name and valid price are required.");
    }

    return prisma.foodVariant.create({
      data: {
        foodItemId: item.id,
        name: name.trim(),
        description,
        priceMinor: Math.round(priceNum * 100),
        isAvailable: Boolean(isAvailable)
      }
    });
  }

  static async updateVariant(variantId, stallId, data) {
    const variant = await prisma.foodVariant.findFirst({
      where: { id: variantId, foodItem: { stallId } }
    });
    if (!variant) throw new Error("Variant not found or access denied.");

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isAvailable !== undefined) updateData.isAvailable = Boolean(data.isAvailable);
    if (data.price !== undefined) {
      const p = Number(data.price);
      if (!Number.isFinite(p) || p < 0) throw new Error("Price must be 0 or greater.");
      updateData.priceMinor = Math.round(p * 100);
    }

    return prisma.foodVariant.update({
      where: { id: variant.id },
      data: updateData
    });
  }

  static async deleteVariant(variantId, stallId) {
    const variant = await prisma.foodVariant.findFirst({
      where: { id: variantId, foodItem: { stallId } }
    });
    if (!variant) throw new Error("Variant not found or access denied.");

    return prisma.foodVariant.delete({
      where: { id: variant.id }
    });
  }
}

export default FoodItemModel;
