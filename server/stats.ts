import { Router, Request, Response } from "express";
import * as db from "./db";

const router = Router();

/**
 * GET /api/monetag/stats
 * Retorna estatísticas de impressões e cliques do usuário
 * 
 * Query params:
 * - email: Email do usuário (obrigatório)
 */
router.get("/monetag/stats", async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    console.log("[Stats] Received request for email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: email",
      });
    }

    // Buscar todos os eventos do usuário por email
    const events = await db.getAdEventsByEmail(String(email));

    // Contar impressões e cliques
    const impressions = events.filter(e => e.eventType === 'impression').length;
    const clicks = events.filter(e => e.eventType === 'click').length;

    // Calcular receita total
    const totalRevenue = events.reduce((sum, e) => {
      const rev = parseFloat(e.revenue || '0');
      return sum + (isNaN(rev) ? 0 : rev);
    }, 0);

    const stats = {
      impressions,
      clicks,
      totalRevenue: totalRevenue.toFixed(4),
    };

    console.log("[Stats] Returning:", stats);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[Stats] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
