import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const router = Router();

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 使用项目根目录，兼容开发和生产环境
    const uploadDir = path.resolve(process.cwd(), 'uploads');

    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：uuid + 原始扩展名
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤（只允许图片）
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  }
});

// POST /api/upload/image - 单张图片上传
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    logger.info(`Image uploaded: ${req.file.filename}`);
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    logger.error('Error uploading image:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
});

// POST /api/upload/images - 多张图片上传
router.post('/images', upload.array('images', 10), (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const files = req.files as Express.Multer.File[];
    const urls = files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));

    logger.info(`${files.length} images uploaded`);
    
    res.json({
      success: true,
      files: urls
    });
  } catch (error) {
    logger.error('Error uploading images:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
});

// DELETE /api/upload/:filename - 删除图片
router.delete('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.resolve(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Image deleted: ${filename}`);
      res.json({ success: true, message: '图片已删除' });
    } else {
      res.status(404).json({ error: '图片不存在' });
    }
  } catch (error) {
    logger.error('Error deleting image:', error);
    res.status(500).json({ error: '删除图片失败' });
  }
});

export default router;
