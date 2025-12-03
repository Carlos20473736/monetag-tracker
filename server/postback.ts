import { Router, Request, Response } from "express";
import * as db from "./db";

const router = Router();

/**
 * Monetag Postback Endpoint
 * Receives notifications from Monetag when ad events occur
 * 
 * Expected parameters:
 * - event_type: "impression" or "click"
 * - zone_id: The Monetag zone ID
 * - click_id: Unique click identifier from Monetag
 * - sub_id: Custom sub ID (can be telegram_id)
 * - revenue: Revenue amount
 * - currency: Currency code
 * - country: Country code
 * - ip: User IP address
 */
router.post("/monetag/postback", async (req: Request, res: Response) => {
  try {
    const {
      event_type,
      zone_id,
      click_id,
      sub_id,
      revenue,
      currency,
      country,
      ip,
    } = req.query;

    console.log("[Postback] Received:", req.query);

    // 🚫 IGNORAR postbacks do Monetag S2S com macros literais
    if (sub_id === '{sub_id}' && sub_id2 === '{sub_id2}') {
      console.log('[Postback] ❌ IGNORADO - Postback do Monetag S2S com macros literais');
      return res.status(200).json({
        success: true,
        message: 'Ignored - literal macros',
      });
    }

    // Validate required fields
    if (!event_type || !zone_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: event_type, zone_id",
      });
    }

    // Validate event type
    if (event_type !== "impression" && event_type !== "click") {
      return res.status(400).json({
        success: false,
        error: "Invalid event_type. Must be 'impression' or 'click'",
      });
    }

    // Extract telegram_id from sub_id if available
    const telegramId = sub_id ? String(sub_id) : null;

    // Get user agent from headers
    const userAgent = req.headers["user-agent"] || null;

    // Record the event
    await db.createAdEvent({
      eventType: event_type as "impression" | "click",
      telegramId,
      zoneId: String(zone_id),
      clickId: click_id ? String(click_id) : null,
      subId: sub_id ? String(sub_id) : null,
      revenue: revenue ? String(revenue) : null,
      currency: currency ? String(currency) : null,
      userAgent: userAgent ? String(userAgent) : null,
      ipAddress: ip ? String(ip) : null,
      country: country ? String(country) : null,
      rawData: JSON.stringify(req.query),
    });

    console.log("[Postback] Event recorded successfully");

    return res.status(200).json({
      success: true,
      message: "Event recorded",
    });
  } catch (error) {
    console.error("[Postback] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET endpoint for testing postback
 */
router.get("/monetag/postback", async (req: Request, res: Response) => {
  try {
    const {
      event_type,
      zone_id,
      click_id,
      sub_id,
      revenue,
      currency,
      country,
      ip,
    } = req.query;

    console.log("[Postback GET] Received:", req.query);

    // 🚫 IGNORAR postbacks do Monetag S2S com macros literais
    if (sub_id === '{sub_id}' && sub_id2 === '{sub_id2}') {
      console.log('[Postback GET] ❌ IGNORADO - Postback do Monetag S2S com macros literais');
      console.log('[Postback GET] sub_id:', sub_id, '| sub_id2:', sub_id2);
      return res.status(200).json({
        success: true,
        message: 'Ignored - literal macros',
      });
    }

    // Validate required fields
    if (!event_type || !zone_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: event_type, zone_id",
      });
    }

    // Validate event type
    if (event_type !== "impression" && event_type !== "click") {
      return res.status(400).json({
        success: false,
        error: "Invalid event_type. Must be 'impression' or 'click'",
      });
    }

    const telegramId = sub_id ? String(sub_id) : null;
    const userAgent = req.headers["user-agent"] || null;

    await db.createAdEvent({
      eventType: event_type as "impression" | "click",
      telegramId,
      zoneId: String(zone_id),
      clickId: click_id ? String(click_id) : null,
      subId: sub_id ? String(sub_id) : null,
      revenue: revenue ? String(revenue) : null,
      currency: currency ? String(currency) : null,
      userAgent: userAgent ? String(userAgent) : null,
      ipAddress: ip ? String(ip) : null,
      country: country ? String(country) : null,
      rawData: JSON.stringify(req.query),
    });

    console.log("[Postback GET] Event recorded successfully");

    return res.status(200).json({
      success: true,
      message: "Event recorded",
    });
  } catch (error) {
    console.error("[Postback GET] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Health check endpoint
 */
router.get("/monetag/health", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Postback endpoint is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
