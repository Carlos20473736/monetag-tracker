import { Router, Request, Response } from 'express';
import { getEvents, getEventsByUser, getEventStats } from './db';

const router = Router();

/**
 * GET /api/events
 * Retorna todos os eventos com estatísticas
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await getEvents();
    const stats = await getEventStats();
    
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
    
    const events = await getEventsByUser(telegramId);
    
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

export default router;
