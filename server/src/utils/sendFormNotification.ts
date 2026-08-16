import nodemailer from 'nodemailer'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * 获取邮件通知配置（数据库优先，环境变量回退）
 */
async function getEmailConfig(formType: string) {
  // 1. 尝试从数据库读取启用的配置
  try {
    const payload = await getPayload({ config })
    const configs = await payload.find({
      collection: 'email-notifications',
      where: {
        and: [
          { enabled: { equals: true } },
          { formTypes: { contains: formType } },
        ],
      },
      limit: 10,
      sort: '-createdAt',
    })

    if (configs.docs.length > 0) {
      return configs.docs.map((doc) => ({
        source: 'database' as const,
        name: doc.name,
        smtpHost: doc.smtpHost,
        smtpPort: doc.smtpPort ?? 465,
        smtpSecure: doc.smtpSecure ?? true,
        smtpUser: doc.smtpUser,
        smtpPass: doc.smtpPass,
        smtpFrom: doc.smtpFrom || doc.smtpUser,
        recipients: [
          ...(doc.recipients?.map((r) => r.email).filter(Boolean) || []),
          ...(doc.extraRecipients
            ? doc.extraRecipients
                .split(/[,，\n]+/)
                .map((s) => s.trim())
                .filter(Boolean)
            : []),
        ],
        subjectTemplate: doc.subjectTemplate || '【{{typeLabel}}】{{customerName}} - {{productOrCompany}}',
      }))
    }
  } catch (err) {
    console.warn('[Email] Failed to read DB config, falling back to env:', err)
  }

  // 2. 回退到环境变量
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT || '465'
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null
  }

  const smtpFrom = process.env.SMTP_FROM || smtpUser
  const extraEmails = process.env.FORM_NOTIFICATION_EMAILS
    ? process.env.FORM_NOTIFICATION_EMAILS.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return [
    {
      source: 'env' as const,
      name: '环境变量默认配置',
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpSecure: smtpPort === '465',
      smtpUser,
      smtpPass,
      smtpFrom,
      recipients: extraEmails.length > 0 ? extraEmails : [smtpFrom],
      subjectTemplate: '【{{typeLabel}}】{{customerName}} - {{productOrCompany}}',
    },
  ]
}

/**
 * 替换邮件主题模板中的变量
 */
function renderSubject(template: string, data: {
  typeLabel: string
  customerName: string
  productOrCompany: string
}): string {
  return template
    .replace(/\{\{typeLabel\}\}/g, data.typeLabel)
    .replace(/\{\{customerName\}\}/g, data.customerName || '未知客户')
    .replace(/\{\{productOrCompany\}\}/g, data.productOrCompany || '无产品信息')
}

/**
 * 表单提交邮件通知
 * 当 formType 为 'inquiry' 或 'message' 时，发送邮件到指定收件人
 * 优先使用数据库 email-notifications 集合的配置，未配置时回退到环境变量
 */
export async function sendFormNotification(formData: {
  formType: string
  customerName?: string
  email?: string
  phone?: string
  companyName?: string
  productName?: string
  quantity?: string
  message?: string
}): Promise<void> {
  // 仅对询盘和在线留言触发邮件通知
  if (formData.formType !== 'inquiry' && formData.formType !== 'message') {
    return
  }

  const configs = await getEmailConfig(formData.formType)

  if (!configs || configs.length === 0) {
    console.warn(`[Email] No SMTP config found for formType="${formData.formType}", skipping notification`)
    return
  }

  const typeLabel = formData.formType === 'inquiry' ? '询盘' : '在线留言'
  const productOrCompany = formData.productName || formData.companyName || ''

  for (const cfg of configs) {
    if (cfg.recipients.length === 0) {
      console.warn(`[Email] Config "${cfg.name}" has no recipients, skipping`)
      continue
    }

    const subject = renderSubject(cfg.subjectTemplate, {
      typeLabel,
      customerName: formData.customerName || '',
      productOrCompany,
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          ${typeLabel}通知
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">客户姓名：</td><td style="padding: 8px 0;">${formData.customerName || '-'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">邮箱：</td><td style="padding: 8px 0;">${formData.email || '-'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">电话：</td><td style="padding: 8px 0;">${formData.phone || '-'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">公司名称：</td><td style="padding: 8px 0;">${formData.companyName || '-'}</td></tr>
          ${formData.productName ? `<tr><td style="padding: 8px 0; font-weight: bold;">产品名称：</td><td style="padding: 8px 0;">${formData.productName}</td></tr>` : ''}
          ${formData.quantity ? `<tr><td style="padding: 8px 0; font-weight: bold;">数量：</td><td style="padding: 8px 0;">${formData.quantity}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">留言内容：</td><td style="padding: 8px 0;">${formData.message || '-'}</td></tr>
        </table>
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">此邮件由天睿纺织 Payload CMS 自动发送 · 配置来源：${cfg.source === 'database' ? '后台管理' : '环境变量'}</p>
      </div>
    `

    try {
      const transporter = nodemailer.createTransport({
        host: cfg.smtpHost,
        port: cfg.smtpPort,
        secure: cfg.smtpSecure,
        auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
      })

      await transporter.sendMail({
        from: cfg.smtpFrom,
        to: cfg.recipients.join(','),
        subject,
        html,
      })

      console.log(`[Email] Sent via "${cfg.name}" (${cfg.source}) to ${cfg.recipients.join(', ')}`)
    } catch (error) {
      console.error(`[Email] Failed to send via "${cfg.name}" (${cfg.source}):`, error)
    }
  }
}
