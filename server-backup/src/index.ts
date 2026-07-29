import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import productRoutes from './routes/products';
import newsRoutes from './routes/news';
import formRoutes from './routes/forms';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import { websocketService } from './utils/websocket';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 强制使用8080端口（Zeabur要求）
const ACTUAL_PORT = 8080;
console.log(`[DEBUG] Environment PORT: ${process.env.PORT}`);
console.log(`[DEBUG] Using port: ${ACTUAL_PORT}`);

// 初始化 Prisma 客户端
export const prisma = new PrismaClient();

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// 请求日志中间件
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 路由
app.use('/api/products', productRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// 全局错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const server = app.listen(ACTUAL_PORT, () => {
  logger.info(`Server is running on port ${ACTUAL_PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // 初始化 WebSocket 服务
  websocketService.initialize(server);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
