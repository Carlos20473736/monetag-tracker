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
      ymid,
      request_var,
      revenue,
      currency,
      country,
      ip,
      // Manter compatibilidade com versões antigas
      sub_id,
      sub_id2,
    } = req.query;

    console.log("[Postback] Received:", req.query);

    // 🚫 IGNORAR postbacks do Monetag S2S com macros literais
    if (ymid === '{ymid}' || request_var === '{request_var}' || sub_id === '{sub_id}' || sub_id2 === '{sub_id2}') {
      console.log('[Postback] ❌ IGNORADO - Postback do Monetag S2S com macros literais');
      console.log('[Postback] ymid:', ymid, '| request_var:', request_var);
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

    // Usar ymid (novo) ou sub_id (antigo) para telegram_id
    const telegramId = ymid ? String(ymid) : (sub_id ? String(sub_id) : null);
    const userEmail = request_var ? String(request_var) : (sub_id2 ? String(sub_id2) : null);

    // Get user agent from headers
    const userAgent = req.headers["user-agent"] || null;

    // Record the event
    await db.createAdEvent({
      eventType: event_type as "impression" | "click",
      telegramId,
      zoneId: String(zone_id),
      clickId: click_id ? String(click_id) : null,
      subId: ymid ? String(ymid) : (sub_id ? String(sub_id) : null),
      subId2: userEmail,
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
      ymid,
      request_var,
      revenue,
      currency,
      country,
      ip,
      // Manter compatibilidade com versões antigas
      sub_id,
      sub_id2,
    } = req.query;

    console.log("[Postback GET] Received:", req.query);

    // 🔄 SUBSTITUIR macros literais por dados da sessão ativa
    let finalSubId = sub_id;
    let finalSubId2 = sub_id2;
    
    if (sub_id === '{sub_id}' || sub_id2 === '{sub_id2}') {
      console.log('[Postback GET] 🔍 Postback com macros literais detectado, buscando sessão ativa...');
      
      try {
        // Importar função para buscar sessão
        const { default: sessionsRouter } = await import('./sessions');
        
        // Buscar sessão ativa para esta zona
        const db = await (await import('./db')).getDb();
        if (db) {
          const { adSessions } = await import('../drizzle/schema');
          const { eq } = await import('drizzle-orm');
          
          const sessions = await db
            .select()
            .from(adSessions)
            .where(eq(adSessions.zoneId, String(zone_id)))
            .orderBy(adSessions.createdAt)
            .limit(10);
          
          // Filtrar sessões não expiradas
          const now = new Date();
          const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);
          
          if (activeSessions.length > 0) {
            // Usar a sessão mais recente
            const session = activeSessions[activeSessions.length - 1];
            finalSubId = session.userId;
            finalSubId2 = session.userEmail;
            
            console.log('[Postback GET] ✅ Sessão ativa encontrada!');
            console.log('[Postback GET] userId:', finalSubId, '| userEmail:', finalSubId2);
          } else {
            console.log('[Postback GET] ⚠️ Nenhuma sessão ativa encontrada, ignorando postback');
            return res.status(200).json({
              success: true,
              message: 'Ignored - no active session',
            });
          }
        }
      } catch (error) {
        console.error('[Postback GET] Erro ao buscar sessão:', error);
        return res.status(200).json({
          success: true,
          message: 'Ignored - session lookup failed',
        });
      }
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

    // Usar ymid (novo) ou finalSubId (com dados da sessão) para telegram_id
    const telegramId = ymid ? String(ymid) : (finalSubId ? String(finalSubId) : null);
    const userEmail = request_var ? String(request_var) : (finalSubId2 ? String(finalSubId2) : null);
    const userAgent = req.headers["user-agent"] || null;

    await db.createAdEvent({
      eventType: event_type as "impression" | "click",
      telegramId,
      zoneId: String(zone_id),
      clickId: click_id ? String(click_id) : null,
      subId: ymid ? String(ymid) : (finalSubId ? String(finalSubId) : null),
      subId2: userEmail,
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
      event_type,
      sub_id: telegramId,
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
