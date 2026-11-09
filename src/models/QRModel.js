import { prisma } from "../db.js";
import { QRService } from "../services/qrService.js";

export class QRModel {
  static async getByStall(stallId) {
    const stall = await prisma.stall.findUnique({
      where: { id: stallId },
      include: { qrCode: true }
    });
    if (!stall) throw new Error("Stall not found.");

    const publicBase = process.env.PUBLIC_MENU_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5000";
    const targetUrl = `${publicBase}/menu/${stall.slug}?source=qr`;

    let qr = stall.qrCode;
    if (!qr || !qr.qrUrl.includes("?source=qr")) {
      qr = await prisma.qRCode.upsert({
        where: { stallId: stall.id },
        update: { qrUrl: targetUrl },
        create: {
          stallId: stall.id,
          qrUrl: targetUrl,
          foregroundColor: "#142235",
          backgroundColor: "#FFFFFF"
        }
      });
    }

    const dataUrl = await QRService.toDataURL(qr.qrUrl, {
      foregroundColor: qr.foregroundColor,
      backgroundColor: qr.backgroundColor
    });

    return {
      ...qr,
      targetUrl: qr.qrUrl,
      dataUrl,
      stallName: stall.name,
      stallSlug: stall.slug,
      logoUrl: stall.logoUrl
    };
  }

  static async updateSettings(stallId, { foregroundColor, backgroundColor, includeLogo }) {
    const updateData = {};
    if (foregroundColor) updateData.foregroundColor = foregroundColor;
    if (backgroundColor) updateData.backgroundColor = backgroundColor;
    if (includeLogo !== undefined) updateData.includeLogo = Boolean(includeLogo);

    return prisma.qRCode.update({
      where: { stallId },
      data: updateData
    });
  }

  static async incrementScanCount(stallId) {
    return prisma.qRCode.updateMany({
      where: { stallId },
      data: { scanCount: { increment: 1 } }
    });
  }
}

export default QRModel;
