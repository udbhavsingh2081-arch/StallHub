export class Presenter {
  static formatFoodItem(item) {
    if (!item) return null;
    return {
      id: item.id,
      stallId: item.stallId,
      categoryId: item.categoryId,
      categoryName: item.category?.name,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      foodType: item.foodType,
      price: item.basePriceMinor / 100,
      discountPrice: item.discountPriceMinor ? item.discountPriceMinor / 100 : null,
      currencyCode: item.currencyCode || "INR",
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      prepTimeMinutes: item.prepTimeMinutes,
      sortOrder: item.sortOrder,
      tags: item.tags || [],
      variants: (item.variants || []).map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        price: v.priceMinor / 100,
        isAvailable: v.isAvailable,
        sortOrder: v.sortOrder
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  static formatCategory(cat) {
    if (!cat) return null;
    return {
      id: cat.id,
      stallId: cat.stallId,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      foodItemsCount: cat._count?.foodItems ?? (cat.foodItems?.length || 0),
      foodItems: cat.foodItems ? cat.foodItems.map(this.formatFoodItem) : undefined,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    };
  }

  static formatStall(stall) {
    if (!stall) return null;
    return {
      id: stall.id,
      name: stall.name,
      slug: stall.slug,
      tagline: stall.tagline,
      description: stall.description,
      cuisineType: stall.cuisineType,
      address: stall.address,
      city: stall.city,
      phone: stall.phone,
      email: stall.email,
      logoUrl: stall.logoUrl,
      coverUrl: stall.coverUrl,
      status: stall.status,
      menuStatus: stall.menuStatus,
      primaryColor: stall.primaryColor,
      theme: stall.theme || null,
      qrCode: stall.qrCode || null,
      owners: (stall.users || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive
      })),
      counts: stall._count || {},
      createdAt: stall.createdAt,
      updatedAt: stall.updatedAt
    };
  }
}

export default Presenter;
