import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '../index';
import logger from './logger';

interface WSMessage {
  type: 'chat_message' | 'typing' | 'session_update' | 'admin_message';
  sessionId?: string;
  data?: any;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map(); // sessionId -> WebSocket
  private adminClients: Set<WebSocket> = new Set(); // 管理员连接

  initialize(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket, req) => {
      logger.info('WebSocket client connected');

      // 解析 URL 参数判断是用户还是管理员
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const isAdmin = url.searchParams.get('role') === 'admin';

      if (isAdmin) {
        this.adminClients.add(ws);
        logger.info('Admin WebSocket client connected');
      }

      ws.on('message', async (message: string) => {
        try {
          const parsed: WSMessage = JSON.parse(message.toString());
          await this.handleMessage(ws, parsed, isAdmin);
        } catch (error) {
          logger.error('WebSocket message parse error:', error);
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
        if (isAdmin) {
          this.adminClients.delete(ws);
        } else {
          // 清理用户连接
          for (const [sessionId, client] of this.clients.entries()) {
            if (client === ws) {
              this.clients.delete(sessionId);
              break;
            }
          }
        }
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    logger.info('WebSocket server initialized');
  }

  private async handleMessage(ws: WebSocket, message: WSMessage, isAdmin: boolean) {
    switch (message.type) {
      case 'chat_message':
        await this.handleChatMessage(ws, message, isAdmin);
        break;
      case 'typing':
        this.broadcastTyping(message.sessionId!, !isAdmin);
        break;
      case 'session_update':
        if (isAdmin && message.sessionId) {
          this.notifySessionUpdate(message.sessionId, message.data);
        }
        break;
      default:
        logger.warn('Unknown message type:', message.type);
    }
  }

  private async handleChatMessage(ws: WebSocket, message: WSMessage, isAdmin: boolean) {
    const { sessionId, data } = message;
    
    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Session ID required' }));
      return;
    }

    // 查找会话
    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
      return;
    }

    if (isAdmin) {
      // 管理员发送消息给用户
      const adminMessage = {
        role: 'assistant' as const,
        content: data.content,
        timestamp: new Date().toISOString(),
        isAdmin: true
      };

      const messages = [...(session.messages as any[]), adminMessage];
      
      await prisma.chatSession.update({
        where: { sessionId },
        data: {
          messages,
          lastMessageAt: new Date()
        }
      });

      // 转发给对应用户
      const userWs = this.clients.get(sessionId);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({
          type: 'chat_message',
          data: adminMessage
        }));
      }

      // 通知其他管理员
      this.broadcastToAdmins({
        type: 'session_update',
        sessionId,
        data: { lastMessage: adminMessage }
      });
    } else {
      // 用户发送消息
      const userMessage = {
        role: 'user' as const,
        content: data.content,
        timestamp: new Date().toISOString()
      };

      const messages = [...(session.messages as any[]), userMessage];
      
      await prisma.chatSession.update({
        where: { sessionId },
        data: {
          messages,
          lastMessageAt: new Date()
        }
      });

      // 注册用户连接
      this.clients.set(sessionId, ws);

      // 通知所有管理员有新消息
      this.broadcastToAdmins({
        type: 'session_update',
        sessionId,
        data: { 
          lastMessage: userMessage,
          unread: true
        }
      });

      // 如果是机器人会话，生成自动回复
      if (session.status === 'active') {
        // 这里可以调用 AI 服务生成回复
        // 暂时返回简单提示
        setTimeout(async () => {
          const botReply = {
            role: 'assistant' as const,
            content: '收到您的消息，客服将尽快回复。',
            timestamp: new Date().toISOString()
          };

          const updatedMessages = [...messages, botReply];
          
          await prisma.chatSession.update({
            where: { sessionId },
            data: {
              messages: updatedMessages,
              lastMessageAt: new Date()
            }
          });

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_message',
              data: botReply
            }));
          }

          this.broadcastToAdmins({
            type: 'session_update',
            sessionId,
            data: { lastMessage: botReply }
          });
        }, 1000);
      }
    }
  }

  private broadcastTyping(sessionId: string, isUser: boolean) {
    if (isUser) {
      // 通知管理员用户正在输入
      this.broadcastToAdmins({
        type: 'typing',
        sessionId,
        data: { isTyping: true }
      });
    } else {
      // 通知用户管理员正在输入
      const userWs = this.clients.get(sessionId);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({
          type: 'typing',
          data: { isTyping: true }
        }));
      }
    }
  }

  private notifySessionUpdate(sessionId: string, data: any) {
    const userWs = this.clients.get(sessionId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'session_update',
        data
      }));
    }
  }

  private broadcastToAdmins(message: any) {
    const messageStr = JSON.stringify(message);
    this.adminClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  // 获取活跃会话数
  getActiveSessions() {
    return this.clients.size;
  }

  // 获取管理员连接数
  getAdminCount() {
    return this.adminClients.size;
  }
}

export const websocketService = new WebSocketService();
