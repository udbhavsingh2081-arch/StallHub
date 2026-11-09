import { PublicationModel } from "../models/PublicationModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { StallModel } from "../models/StallModel.js";

export class PublicationController {
  static async getActive(req, res) {
    const publication = await PublicationModel.getActivePublication(req.stallId);
    res.json({ publication });
  }

  static async getHistory(req, res) {
    const history = await PublicationModel.listHistory(req.stallId);
    res.json({ publications: history });
  }

  static async publish(req, res) {
    try {
      const stall = await StallModel.findById(req.stallId);
      const publication = await PublicationModel.publish(req.stallId, req.user?.id);

      await AuditLogModel.log({
        req,
        action: "MENU_PUBLISHED",
        entityType: "MenuPublication",
        entityId: publication.id,
        stallId: req.stallId,
        details: { version: publication.version }
      });

      const publicBase = process.env.PUBLIC_MENU_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5000";
      res.json({
        message: "Menu published successfully!",
        publication,
        publicUrl: `${publicBase}/menu/${stall.slug}`
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async unpublish(req, res) {
    try {
      const result = await PublicationModel.unpublish(req.stallId);
      await AuditLogModel.log({
        req,
        action: "MENU_UNPUBLISHED",
        entityType: "Stall",
        entityId: req.stallId,
        stallId: req.stallId
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async rollback(req, res) {
    try {
      const { version } = req.body;
      if (!version) return res.status(400).json({ message: "Version number is required." });

      const target = await PublicationModel.rollback(req.stallId, version);
      await AuditLogModel.log({
        req,
        action: "MENU_ROLLED_BACK",
        entityType: "MenuPublication",
        entityId: target.id,
        stallId: req.stallId,
        details: { restoredVersion: target.version }
      });

      res.json({
        message: `Successfully rolled back to menu version ${target.version}.`,
        publication: target
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default PublicationController;
