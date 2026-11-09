import { prisma } from "../db.js";

export class CategoryModel {
  static async listByStall(stallId) {
    return prisma.category.findMany({
      where: { stallId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { foodItems: true } }
      }
    });
  }

  static async findById(id, stallId) {
    return prisma.category.findFirst({
      where: { id, stallId },
      include: {
        foodItems: {
          include: { variants: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        }
      }
    });
  }

  static async create({ stallId, name, description, imageUrl, sortOrder = 0 }) {
    return prisma.category.create({
      data: {
        stallId,
        name: name.trim(),
        description,
        imageUrl,
        sortOrder: Number(sortOrder) || 0,
        isActive: true
      }
    });
  }

  static async update(id, stallId, data) {
    const existing = await prisma.category.findFirst({ where: { id, stallId } });
    if (!existing) throw new Error("Category not found or access denied.");

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

    return prisma.category.update({
      where: { id: existing.id },
      data: updateData
    });
  }

  static async delete(id, stallId, { moveItemsToCategoryId = null } = {}) {
    const existing = await prisma.category.findFirst({
      where: { id, stallId },
      include: { _count: { select: { foodItems: true } } }
    });
    if (!existing) throw new Error("Category not found or access denied.");

    if (existing._count.foodItems > 0 && moveItemsToCategoryId) {
      await prisma.foodItem.updateMany({
        where: { categoryId: id, stallId },
        data: { categoryId: moveItemsToCategoryId }
      });
    }

    return prisma.category.delete({
      where: { id: existing.id }
    });
  }
}

export default CategoryModel;
