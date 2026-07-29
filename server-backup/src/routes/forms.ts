import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import logger from '../utils/logger';
import { sendFormSubmissionNotification } from '../utils/email';

const router = Router();

// 通用表单数据验证 Schema（灵活支持各种表单类型）
const formSubmissionSchema = z.object({
  formType: z.string().min(1).max(50), // contact, inquiry, feedback, etc.
  data: z.record(z.any()), // 灵活的表单数据
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional()
});

// POST /api/forms/submit - 提交表单
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const validatedData = formSubmissionSchema.parse({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const submission = await prisma.formSubmission.create({
      data: {
        formType: validatedData.formType,
        data: validatedData.data,
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent
      }
    });

    logger.info(`Form submitted: ${submission.id} (type: ${submission.formType})`);

    // 异步发送邮件通知（不阻塞响应）
    sendFormSubmissionNotification({
      formType: submission.formType,
      data: submission.data,
      ipAddress: submission.ipAddress
    }).catch(err => {
      logger.error('Failed to send email notification:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    logger.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// GET /api/forms - 获取表单提交列表（管理员用）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      formType, 
      status 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (formType) where.formType = formType as string;
    if (status) where.status = status as string;

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ createdAt: 'desc' }]
      }),
      prisma.formSubmission.count({ where })
    ]);

    res.json({
      data: submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /api/forms/:id - 获取单个表单提交详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await prisma.formSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    logger.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// PATCH /api/forms/:id/status - 更新表单状态
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processed', 'archived'] as const;
    if (!validStatuses.includes(status as any)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: pending, processed, or archived'
      });
    }

    const submission = await prisma.formSubmission.update({
      where: { id },
      data: { status: status as string }
    });

    logger.info(`Form status updated: ${id} -> ${status}`);
    res.json(submission);
  } catch (error) {
    logger.error('Error updating form status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/forms/:id - 删除表单提交
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.formSubmission.delete({
      where: { id }
    });

    logger.info(`Form submission deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;
