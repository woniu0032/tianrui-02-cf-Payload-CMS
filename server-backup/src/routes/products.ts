import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

// 数据验证 Schema
const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.number().positive(),
  category: z.string().min(1).max(100),
  images: z.array(z.string().url()).optional(),
  content: z.any().optional(), // JSON 富文本内容
  layout: z.any().optional(), // JSON 布局配置
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

// GET /api/products - 获取产品列表（支持分页和筛选）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isActive, 
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};
    if (category) where.category = category as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - 获取单个产品
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - 创建产品
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = productSchema.parse(req.body);
    
    const product = await prisma.product.create({
      data: validatedData
    });

    logger.info(`Product created: ${product.id}`);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - 更新产品
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData
    });

    logger.info(`Product updated: ${product.id}`);
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - 删除产品
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });

    logger.info(`Product deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// PATCH /api/products/:id/layout - 更新产品布局（拖拽编辑器专用）
router.patch('/:id/layout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { layout, content } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(layout && { layout }),
        ...(content && { content })
      }
    });

    logger.info(`Product layout updated: ${product.id}`);
    res.json(product);
  } catch (error) {
    logger.error('Error updating product layout:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

export default router;
