import { AnalyticsModel } from "../models/AnalyticsModel.js";

export class AnalyticsController {
  static async getStallAnalytics(req, res) {
    const days = Number(req.query.days) || 30;
    const analytics = await AnalyticsModel.getStallAnalytics(req.stallId, days);
    res.json(analytics);
  }
}

export default AnalyticsController;
