import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import logger from '../utils/logger';
import { websocketService } from '../utils/websocket';

const router = Router();

// GET /api/admin/dashboard - 获取管理面板统计数据
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalNews,
      publishedNews,
      totalForms,
      pendingForms,
      totalSessions,
      activeSessions
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.news.count(),
      prisma.news.count({ where: { isPublished: true } }),
      prisma.formSubmission.count(),
      prisma.formSubmission.count({ where: { status: 'pending' } }),
      prisma.chatSession.count(),
      prisma.chatSession.count({ where: { status: 'active' } })
    ]);

    res.json({
      products: { total: totalProducts, active: activeProducts },
      news: { total: totalNews, published: publishedNews },
      forms: { total: totalForms, pending: pendingForms },
      chat: { 
        total: totalSessions, 
        active: activeSessions,
        websocketConnections: websocketService.getActiveSessions()
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/chat/sessions - 获取所有客服会话（管理员用）
router.get('/chat/sessions', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status as string;

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ lastMessageAt: 'desc' }]
      }),
      prisma.chatSession.count({ where })
    ]);

    res.json({
      data: sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// GET /api/admin/chat/sessions/:sessionId/messages - 获取会话完整消息历史
router.get('/chat/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session.sessionId,
      messages: session.messages,
      status: session.status,
      userId: session.userId,
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt
    });
  } catch (error) {
    logger.error('Error fetching session messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/admin/chat/sessions/:sessionId/transfer - 转接会话给人工客服
router.post('/chat/sessions/:sessionId/transfer', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { adminId } = req.body;

    const existingSession = await prisma.chatSession.findUnique({ where: { sessionId } });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = await prisma.chatSession.update({
      where: { sessionId },
      data: {
        status: 'transferred',
        metadata: {
          ...(existingSession.metadata as object || {}),
          transferredTo: adminId,
          transferredAt: new Date().toISOString()
        }
      }
    });

    logger.info(`Chat session ${sessionId} transferred to admin ${adminId}`);
    res.json({ success: true, session });
  } catch (error) {
    logger.error('Error transferring session:', error);
    res.status(500).json({ error: 'Failed to transfer session' });
  }
});

// PATCH /api/admin/chat/sessions/:sessionId/close - 管理员关闭会话
router.patch('/chat/sessions/:sessionId/close', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = await prisma.chatSession.update({
      where: { sessionId },
      data: { status: 'closed' }
    });

    logger.info(`Admin closed chat session: ${sessionId}`);
    res.json({ success: true, session });
  } catch (error) {
    logger.error('Error closing session:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
});

// GET /api/admin/forms/stats - 获取表单统计
router.get('/forms/stats', async (req: Request, res: Response) => {
  try {
    const stats = await prisma.formSubmission.groupBy({
      by: ['formType', 'status'],
      _count: true
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching form stats:', error);
    res.status(500).json({ error: 'Failed to fetch form stats' });
  }
});

export default router;
