import { Router, Request, Response } from "express";
import { eq, lt } from "drizzle-orm";
import { adSessions } from "../drizzle/schema";

const router = Router();

async function getDb() {
  const { getDb: getDbFunc } = await import("./db");
  return getDbFunc();
}

/**
 * POST /api/monetag/session/start
 * Inicia uma sessão de anúncio para um usuário
 * 
 * Body:
 * - userId: ID do usuário
 * - userEmail: Email do usuário
 * - zoneId: ID da zona do Monetag
 */
router.post("/monetag/session/start", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, zoneId } = req.body;

    if (!userId || !userEmail || !zoneId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, userEmail, zoneId",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Gerar token único
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Sessão expira em 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Criar sessão
    await db.insert(adSessions).values({
      userId: String(userId),
      userEmail: String(userEmail),
      zoneId: String(zoneId),
      sessionToken,
      expiresAt,
    });

    console.log(`[Session] Created session for user ${userId} (${userEmail})`);

    return res.status(200).json({
      success: true,
      sessionToken,
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/monetag/session/active
 * Busca a sessão ativa mais recente para uma zona
 */
router.get("/monetag/session/active", async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.query;

    if (!zoneId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: zoneId",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Buscar sessão ativa mais recente (não expirada)
    const now = new Date();
    const sessions = await db
      .select()
      .from(adSessions)
      .where(eq(adSessions.zoneId, String(zoneId)))
      .orderBy(adSessions.createdAt)
      .limit(10);

    // Filtrar sessões não expiradas
    const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);

    if (activeSessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No active session found",
      });
    }

    // Retornar a mais recente
    const session = activeSessions[activeSessions.length - 1];

    return res.status(200).json({
      success: true,
      session: {
        userId: session.userId,
        userEmail: session.userEmail,
        zoneId: session.zoneId,
      },
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/monetag/session/cleanup
 * Remove sessões expiradas
 */
router.delete("/monetag/session/cleanup", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const now = new Date();
    const result = await db.delete(adSessions).where(lt(adSessions.expiresAt, now));

    console.log(`[Session] Cleaned up expired sessions`);

    return res.status(200).json({
      success: true,
      message: "Expired sessions cleaned up",
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
