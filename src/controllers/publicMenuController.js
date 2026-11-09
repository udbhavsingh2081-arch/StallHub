import { StallModel } from "../models/StallModel.js";
import { PublicationModel } from "../models/PublicationModel.js";
import { AnalyticsModel } from "../models/AnalyticsModel.js";
import { QRModel } from "../models/QRModel.js";
import { renderPublicMenuHtml } from "../views/templates/publicMenu.js";
import { renderQrPosterHtml } from "../views/templates/qrPoster.js";
import { renderStallUnavailableHtml } from "../views/templates/stallUnavailable.js";

export class PublicMenuController {
  // JSON API for public menu
  static async getMenuJson(req, res) {
    const { slug } = req.params;
    const stall = await StallModel.findBySlug(slug);

    if (!stall) {
      return res.status(404).json({ error: "stall_not_found", message: "Stall not found." });
    }

    if (stall.status !== "ACTIVE") {
      return res.status(403).json({ error: "stall_suspended", message: "This stall is temporarily unavailable." });
    }

    const activePublication = await PublicationModel.getActivePublication(stall.id);
    if (!activePublication || stall.menuStatus !== "PUBLISHED") {
      return res.status(404).json({ error: "menu_not_published", message: "This stall has not published a menu yet." });
    }

    // Record analytics
    const isQr = req.query.source === "qr" || req.query.ref === "qr";
    if (isQr) {
      await QRModel.incrementScanCount(stall.id);
      await AnalyticsModel.logEvent({
        stallId: stall.id,
        eventType: "QR_SCAN",
        ip: req.ip,
        userAgent: req.get("user-agent"),
        referrer: req.get("referrer")
      });
    }

    await AnalyticsModel.logEvent({
      stallId: stall.id,
      eventType: "MENU_VIEW",
      ip: req.ip,
      userAgent: req.get("user-agent"),
      referrer: req.get("referrer")
    });

    res.json(activePublication.snapshot);
  }

  // HTML Web View for customer browsing
  static async renderMenuView(req, res) {
    const { slug } = req.params;
    const stall = await StallModel.findBySlug(slug);

    if (!stall) {
      return res.status(404).send(renderStallUnavailableHtml({ reason: "NOT_FOUND", stallName: slug }));
    }

    if (stall.status !== "ACTIVE") {
      return res.status(403).send(renderStallUnavailableHtml({ reason: "SUSPENDED", stallName: stall.name }));
    }

    const activePublication = await PublicationModel.getActivePublication(stall.id);
    if (!activePublication || stall.menuStatus !== "PUBLISHED") {
      return res.send(renderStallUnavailableHtml({ reason: "NOT_PUBLISHED", stallName: stall.name }));
    }

    // Record analytics
    const isQr = req.query.source === "qr" || req.query.ref === "qr";
    if (isQr) {
      await QRModel.incrementScanCount(stall.id);
      await AnalyticsModel.logEvent({
        stallId: stall.id,
        eventType: "QR_SCAN",
        ip: req.ip,
        userAgent: req.get("user-agent"),
        referrer: req.get("referrer")
      });
    }

    await AnalyticsModel.logEvent({
      stallId: stall.id,
      eventType: "MENU_VIEW",
      ip: req.ip,
      userAgent: req.get("user-agent"),
      referrer: req.get("referrer")
    });

    const html = renderPublicMenuHtml({
      snapshot: activePublication.snapshot,
      isPreview: false
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  }

  // Live Preview HTML View (for stall owners to preview draft changes before publishing)
  static async renderPreviewView(req, res) {
    const { slug } = req.params;
    const stall = await StallModel.findBySlug(slug);
    if (!stall) return res.status(404).send("Stall not found.");

    const draftSnapshot = await PublicationModel.buildLiveDraftSnapshot(stall.id);
    const html = renderPublicMenuHtml({
      snapshot: draftSnapshot,
      isPreview: true
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  }

  // Printable QR poster HTML view
  static async renderPoster(req, res) {
    const { slug } = req.params;
    const stall = await StallModel.findBySlug(slug);
    if (!stall) return res.status(404).send("Stall not found.");

    const qrData = await QRModel.getByStall(stall.id);
    const html = renderQrPosterHtml({
      stall,
      qrDataUrl: qrData.dataUrl,
      targetUrl: qrData.targetUrl
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  }
}

export default PublicMenuController;
