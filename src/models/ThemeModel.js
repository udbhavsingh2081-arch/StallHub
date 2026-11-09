import { prisma } from "../db.js";

export const PRESET_TEMPLATES = {
  LUXURY: {
    templateId: "LUXURY",
    primaryColor: "#0F0F11",
    secondaryColor: "#D4AF37", // Gold
    backgroundColor: "#16161A",
    accentColor: "#E2C974",
    fontHeading: "Playfair Display",
    fontBody: "Cinzel",
    layoutType: "LIST",
    categoryStyle: "SCROLL",
    cardStyle: "IMAGE_TOP",
    isHeaderSticky: true,
    showCoverBanner: true,
    bannerHeight: 280
  },
  MINIMAL: {
    templateId: "MINIMAL",
    primaryColor: "#111827",
    secondaryColor: "#4B5563",
    backgroundColor: "#FFFFFF",
    accentColor: "#F3F4F6",
    fontHeading: "Inter",
    fontBody: "Inter",
    layoutType: "LIST",
    categoryStyle: "TABS",
    cardStyle: "MINIMAL",
    isHeaderSticky: true,
    showCoverBanner: false,
    bannerHeight: 180
  },
  STREET_FOOD: {
    templateId: "STREET_FOOD",
    primaryColor: "#142235", // FoodStallHub Navy
    secondaryColor: "#E8A64A", // FoodStallHub Amber
    backgroundColor: "#F5F7FA",
    accentColor: "#27364A",
    fontHeading: "Manrope",
    fontBody: "DM Sans",
    layoutType: "GRID",
    categoryStyle: "TABS",
    cardStyle: "COMPACT",
    isHeaderSticky: true,
    showCoverBanner: true,
    bannerHeight: 240
  },
  FRESH: {
    templateId: "FRESH",
    primaryColor: "#1B4332", // Forest Emerald
    secondaryColor: "#52B788", // Fresh Mint
    backgroundColor: "#F7FFF7",
    accentColor: "#2D6A4F",
    fontHeading: "Outfit",
    fontBody: "Plus Jakarta Sans",
    layoutType: "GRID",
    categoryStyle: "SCROLL",
    cardStyle: "COMPACT",
    isHeaderSticky: true,
    showCoverBanner: true,
    bannerHeight: 220
  }
};

export class ThemeModel {
  static async getByStall(stallId) {
    let theme = await prisma.stallTheme.findUnique({ where: { stallId } });
    if (!theme) {
      theme = await prisma.stallTheme.create({
        data: {
          stallId,
          ...PRESET_TEMPLATES.STREET_FOOD
        }
      });
    }
    return theme;
  }

  static async applyTemplate(stallId, templateName) {
    const preset = PRESET_TEMPLATES[templateName.toUpperCase()];
    if (!preset) throw new Error(`Unknown template: ${templateName}. Choose from: LUXURY, MINIMAL, STREET_FOOD, FRESH.`);

    return prisma.stallTheme.upsert({
      where: { stallId },
      update: { ...preset },
      create: { stallId, ...preset }
    });
  }

  static async updateTheme(stallId, customSettings) {
    const allowed = [
      "templateId", "primaryColor", "secondaryColor", "backgroundColor", "accentColor",
      "fontHeading", "fontBody", "layoutType", "categoryStyle", "cardStyle",
      "isHeaderSticky", "showCoverBanner", "bannerHeight", "socialLinks", "customSettings"
    ];
    const updateData = Object.fromEntries(
      Object.entries(customSettings).filter(([k]) => allowed.includes(k))
    );

    return prisma.stallTheme.upsert({
      where: { stallId },
      update: updateData,
      create: {
        stallId,
        ...PRESET_TEMPLATES.STREET_FOOD,
        ...updateData
      }
    });
  }
}

export default ThemeModel;
