import { ThemeModel, PRESET_TEMPLATES } from "../models/ThemeModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";

export class ThemeController {
  static async getTheme(req, res) {
    const theme = await ThemeModel.getByStall(req.stallId);
    res.json({ theme });
  }

  static async getTemplates(req, res) {
    res.json({ templates: PRESET_TEMPLATES });
  }

  static async applyTemplate(req, res) {
    try {
      const { templateName } = req.body;
      if (!templateName) return res.status(400).json({ message: "templateName is required (LUXURY, MINIMAL, STREET_FOOD, FRESH)." });

      const updated = await ThemeModel.applyTemplate(req.stallId, templateName);
      await AuditLogModel.log({
        req,
        action: "THEME_TEMPLATE_APPLIED",
        entityType: "StallTheme",
        entityId: updated.id,
        stallId: req.stallId,
        details: { templateName }
      });

      res.json({ theme: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateTheme(req, res) {
    try {
      const updated = await ThemeModel.updateTheme(req.stallId, req.body);
      await AuditLogModel.log({
        req,
        action: "THEME_UPDATED",
        entityType: "StallTheme",
        entityId: updated.id,
        stallId: req.stallId,
        details: req.body
      });
      res.json({ theme: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default ThemeController;
