import { QRModel } from "../models/QRModel.js";
import { QRService } from "../services/qrService.js";
import { AuditLogModel } from "../models/AuditLogModel.js";

export class QRController {
  static async getQrDetails(req, res) {
    try {
      const qrData = await QRModel.getByStall(req.stallId);
      res.json({ qr: qrData });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async downloadPng(req, res) {
    try {
      const qrData = await QRModel.getByStall(req.stallId);
      const buffer = await QRService.toBuffer(qrData.targetUrl, {
        foregroundColor: qrData.foregroundColor,
        backgroundColor: qrData.backgroundColor,
        width: 800
      });

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename="${qrData.stallSlug}-menu-qr.png"`);
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate PNG QR code." });
    }
  }

  static async downloadSvg(req, res) {
    try {
      const qrData = await QRModel.getByStall(req.stallId);
      const svg = await QRService.toSVG(qrData.targetUrl, {
        foregroundColor: qrData.foregroundColor,
        backgroundColor: qrData.backgroundColor,
        width: 800
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Content-Disposition", `attachment; filename="${qrData.stallSlug}-menu-qr.svg"`);
      res.send(svg);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate SVG QR code." });
    }
  }

  static async updateSettings(req, res) {
    try {
      const { foregroundColor, backgroundColor, includeLogo } = req.body;
      const updated = await QRModel.updateSettings(req.stallId, {
        foregroundColor,
        backgroundColor,
        includeLogo
      });

      await AuditLogModel.log({
        req,
        action: "QR_SETTINGS_UPDATED",
        entityType: "QRCode",
        entityId: updated.id,
        stallId: req.stallId,
        details: { foregroundColor, backgroundColor }
      });

      res.json({ qr: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default QRController;
