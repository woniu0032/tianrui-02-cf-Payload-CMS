import nodemailer from 'nodemailer';
import logger from './logger';

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// 发送邮件
export const sendEmail = async (options: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'System'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

// 发送表单提交通知
export const sendFormSubmissionNotification = async (formData: any) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    logger.warn('ADMIN_EMAIL not configured, skipping notification');
    return;
  }

  const subject = `新表单提交: ${formData.formType}`;
  
  // 格式化表单数据为 HTML
  const formatField = (key: string, value: any) => {
    return `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
  };

  let fieldsHtml = '';
  if (formData.data && typeof formData.data === 'object') {
    for (const [key, value] of Object.entries(formData.data)) {
      fieldsHtml += formatField(key, value);
    }
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">新表单提交通知</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>表单类型</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.formType}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>提交时间</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('zh-CN')}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>IP 地址</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.ipAddress || 'N/A'}</td></tr>
      </table>
      
      <h3 style="color: #333; margin-top: 20px;">表单数据</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${fieldsHtml}
      </table>
      
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        此邮件由系统自动发送，请勿回复。
      </p>
    </div>
  `;

  const text = `
新表单提交通知

表单类型: ${formData.formType}
提交时间: ${new Date().toLocaleString('zh-CN')}
IP 地址: ${formData.ipAddress || 'N/A'}

表单数据:
${JSON.stringify(formData.data, null, 2)}
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    text,
    html
  });
};
