import { Router, Request, Response } from 'express';
import { getAllAdEvents, getAdEventsByTelegramId, getAdEventStats, deleteAllAdEvents } from './db';

const router = Router();

/**
 * GET /api/events
 * Retorna todos os eventos com estatísticas
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await getAllAdEvents();
    const dbStats = await getAdEventStats();
    
    // Format stats to match dashboard expectations
    const stats = {
      impressions: Number(dbStats.totalImpressions) || 0,
      clicks: Number(dbStats.totalClicks) || 0,
      uniqueUsers: Number(dbStats.uniqueUsers) || 0,
    };
    
    res.json({
      success: true,
      stats,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/events/user/:telegramId
 * Retorna eventos de um usuário específico
 */
router.get('/events/user/:telegramId', async (req: Request, res: Response) => {
  try {
    const telegramId = req.params.telegramId;
    
    if (!telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Telegram ID is required',
      });
    }
    
    const events = await getAdEventsByTelegramId(telegramId);
    
    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/events
 * Limpa todo o histórico de eventos
 */
router.delete('/events', async (req: Request, res: Response) => {
  try {
    await deleteAllAdEvents();
    
    res.json({
      success: true,
      message: 'All events deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
