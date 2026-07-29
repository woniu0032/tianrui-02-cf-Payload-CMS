import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const router = Router();

// 消息 Schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.string().datetime().optional()
});

// 创建会话 Schema
const createSessionSchema = z.object({
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// 发送消息 Schema
const sendMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1)
});

// POST /api/chat/sessions - 创建新会话
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const validatedData = createSessionSchema.parse(req.body);
    const sessionId = uuidv4();

    const session = await prisma.chatSession.create({
      data: {
        sessionId,
        userId: validatedData.userId || null,
        messages: [],
        metadata: validatedData.metadata || {},
        status: 'active'
      }
    });

    logger.info(`Chat session created: ${sessionId}`);
    res.status(201).json({
      sessionId: session.sessionId,
      createdAt: session.createdAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/chat/sessions/:sessionId - 获取会话历史
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
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
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt
    });
  } catch (error) {
    logger.error('Error fetching chat session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/chat/messages - 发送消息并获取回复
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    const { sessionId, message } = validatedData;

    // 查找会话
    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // 添加用户消息
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const messages = [...(session.messages as any[]), userMessage];

    // 生成机器人回复（这里可以集成真实的 AI API）
    const assistantReply = await generateBotResponse(message, messages);
    
    const assistantMessage = {
      role: 'assistant' as const,
      content: assistantReply,
      timestamp: new Date().toISOString()
    };

    messages.push(assistantMessage);

    // 更新会话
    const updatedSession = await prisma.chatSession.update({
      where: { sessionId },
      data: {
        messages,
        lastMessageAt: new Date()
      }
    });

    res.json({
      reply: assistantReply,
      timestamp: assistantMessage.timestamp
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/chat/sessions/:sessionId/close - 关闭会话
router.patch('/sessions/:sessionId/close', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = await prisma.chatSession.update({
      where: { sessionId },
      data: { status: 'closed' }
    });

    logger.info(`Chat session closed: ${sessionId}`);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error closing session:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
});

// DELETE /api/chat/sessions/:sessionId - 删除会话
router.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    await prisma.chatSession.delete({
      where: { sessionId }
    });

    logger.info(`Chat session deleted: ${sessionId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// 简单的机器人回复生成器（可替换为真实 AI API）
async function generateBotResponse(userMessage: string, history: any[]): Promise<string> {
  // 这里可以集成 OpenAI、Claude 或其他 AI API
  // 目前使用简单的规则回复作为示例
  
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
    return '您好！很高兴为您服务。请问有什么可以帮助您的吗？';
  }
  
  if (lowerMessage.includes('产品') || lowerMessage.includes('product')) {
    return '我们提供多种优质产品。您可以访问我们的产品页面查看详细信息，或者告诉我您感兴趣的产品类型，我可以为您推荐。';
  }
  
  if (lowerMessage.includes('价格') || lowerMessage.includes('price')) {
    return '我们的产品价格因型号和配置而异。建议您查看具体产品页面获取准确报价，或联系我们的销售团队获取定制方案。';
  }
  
  if (lowerMessage.includes('联系') || lowerMessage.includes('contact')) {
    return '您可以通过以下方式联系我们：\n- 邮箱：contact@example.com\n- 电话：400-xxx-xxxx\n- 在线客服：当前对话';
  }
  
  if (lowerMessage.includes('谢谢') || lowerMessage.includes('thank')) {
    return '不客气！如果还有其他问题，随时欢迎咨询。祝您有愉快的一天！';
  }
  
  return '感谢您的消息。我是智能客服助手，可以回答关于产品和服务的问题。请问还有什么我可以帮助您的吗？';
}

export default router;
