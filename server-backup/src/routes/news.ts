import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

// 数据验证 Schema
const newsSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().max(1000),
  content: z.any().optional(), // JSON 富文本内容
  layout: z.any().optional(), // JSON 布局配置
  coverImage: z.string().url().optional(),
  author: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
});

// GET /api/news - 获取新闻列表（支持分页、筛选和搜索）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isPublished, 
      search,
      tag
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};
    if (category) where.category = category as string;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (tag) where.tags = { has: tag as string };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
      }),
      prisma.news.count({ where })
    ]);

    res.json({
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:id - 获取单篇新闻
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 先检查新闻是否存在
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    // 增加浏览量
    const news = await prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(news);
  } catch (error) {
    logger.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST /api/news - 创建新闻
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = newsSchema.parse(req.body);
    
    const news = await prisma.news.create({
      data: {
        ...validatedData,
        publishedAt: validatedData.isPublished ? new Date() : null
      }
    });

    logger.info(`News created: ${news.id}`);
    res.status(201).json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT /api/news/:id - 更新新闻
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = newsSchema.partial().parse(req.body);

    const updateData: any = { ...validatedData };
    
    // 如果发布状态改变，更新发布时间
    if (validatedData.isPublished !== undefined) {
      updateData.publishedAt = validatedData.isPublished ? new Date() : null;
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    });

    logger.info(`News updated: ${news.id}`);
    res.json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE /api/news/:id - 删除新闻
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.news.delete({
      where: { id }
    });

    logger.info(`News deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// PATCH /api/news/:id/layout - 更新新闻布局（拖拽编辑器专用）
router.patch('/:id/layout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { layout, content } = req.body;

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(layout && { layout }),
        ...(content && { content })
      }
    });

    logger.info(`News layout updated: ${news.id}`);
    res.json(news);
  } catch (error) {
    logger.error('Error updating news layout:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

// GET /api/news/categories - 获取所有分类
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.news.findMany({
      select: { category: true },
      distinct: ['category']
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
