import crypto from "crypto";
import { prisma } from "../db.js";

export class AnalyticsModel {
  static hashVisitor(ip, userAgent) {
    return crypto.createHash("sha256").update(`${ip || "unknown"}-${userAgent || "unknown"}`).digest("hex").slice(0, 16);
  }

  static async logEvent({ stallId, eventType = "MENU_VIEW", entityId, ip, userAgent, referrer }) {
    const visitorHash = this.hashVisitor(ip, userAgent);
    return prisma.analyticsEvent.create({
      data: {
        stallId,
        eventType,
        entityId,
        visitorHash,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        referrer: referrer ? referrer.slice(0, 255) : null
      }
    });
  }

  static async getStallAnalytics(stallId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalViews, qrScans, events, qrRecord, topCategories, topItems] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { stallId, eventType: "MENU_VIEW", createdAt: { gte: since } }
      }),
      prisma.analyticsEvent.count({
        where: { stallId, eventType: "QR_SCAN", createdAt: { gte: since } }
      }),
      prisma.analyticsEvent.findMany({
        where: { stallId, createdAt: { gte: since } },
        select: { eventType: true, visitorHash: true, createdAt: true }
      }),
      prisma.qRCode.findUnique({
        where: { stallId },
        select: { scanCount: true }
      }),
      prisma.category.findMany({
        where: { stallId },
        select: { id: true, name: true, _count: { select: { foodItems: true } } }
      }),
      prisma.foodItem.findMany({
        where: { stallId },
        take: 5,
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, isFeatured: true, basePriceMinor: true }
      })
    ]);

    // Unique visitors count
    const uniqueVisitors = new Set(events.map(e => e.visitorHash).filter(Boolean)).size;

    // Daily breakdown for the last 7 days
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      dailyMap[d] = { date: d, views: 0, qrScans: 0 };
    }

    events.forEach(e => {
      const dateKey = e.createdAt.toISOString().split("T")[0];
      if (dailyMap[dateKey]) {
        if (e.eventType === "MENU_VIEW") dailyMap[dateKey].views++;
        if (e.eventType === "QR_SCAN") dailyMap[dateKey].qrScans++;
      }
    });

    return {
      periodDays: days,
      metrics: {
        totalViews,
        uniqueVisitors,
        qrScans,
        lifetimeQrScans: qrRecord?.scanCount || 0
      },
      dailyTrends: Object.values(dailyMap),
      topCategories: topCategories.map(c => ({ id: c.id, name: c.name, itemsCount: c._count.foodItems })),
      featuredItems: topItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.basePriceMinor / 100,
        isFeatured: item.isFeatured
      }))
    };
  }

  static async getPlatformAnalytics() {
    const [totalStalls, activeStalls, suspendedStalls, publishedMenus, totalViews, totalScans, stalls] = await Promise.all([
      prisma.stall.count(),
      prisma.stall.count({ where: { status: "ACTIVE" } }),
      prisma.stall.count({ where: { status: "SUSPENDED" } }),
      prisma.stall.count({ where: { menuStatus: "PUBLISHED" } }),
      prisma.analyticsEvent.count({ where: { eventType: "MENU_VIEW" } }),
      prisma.analyticsEvent.count({ where: { eventType: "QR_SCAN" } }),
      prisma.stall.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          menuStatus: true,
          createdAt: true,
          _count: {
            select: {
              foodItems: true,
              categories: true,
              analyticsEvents: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return {
      overview: {
        totalStalls,
        activeStalls,
        suspendedStalls,
        publishedMenus,
        totalViews,
        totalScans
      },
      stallsSummary: stalls.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        status: s.status,
        menuStatus: s.menuStatus,
        itemsCount: s._count.foodItems,
        categoriesCount: s._count.categories,
        totalVisits: s._count.analyticsEvents,
        createdAt: s.createdAt
      }))
    };
  }
}

export default AnalyticsModel;
