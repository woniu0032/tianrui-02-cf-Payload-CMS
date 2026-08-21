import nodemailer from 'nodemailer'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * 检查是否应该发送邮件通知（根据去重模式，使用数据库持久化）
 */
async function shouldSendNotification(dedupMode: string, clientIp: string, sessionId: string): Promise<boolean> {
  console.log(`[Email Dedup] Checking: dedupMode=${dedupMode}, clientIp=${clientIp}, sessionId=${sessionId}`)

  if (dedupMode === 'none') {
    console.log(`[Email Dedup] Mode is 'none', allowing notification`)
    return true
  }

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const key = dedupMode === 'ip_per_day'
    ? `ip_${clientIp}_${today}`
    : `session_${sessionId}`

  console.log(`[Email Dedup] Generated key: ${key}`)

  try {
    const payload = await getPayload({ config })

    // 查询数据库中是否已有该 key 的记录
    const existingRecords = await payload.find({
      collection: 'email-dedup-records',
      where: {
        dedupKey: { equals: key },
      },
      limit: 1,
    })

    if (existingRecords.docs.length > 0) {
      console.log(`[Email Dedup] Key already exists in database, blocking notification`)
      return false
    }

    // 插入新记录
    const expiresAt = dedupMode === 'ip_per_day'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期（会话级别）

    await payload.create({
      collection: 'email-dedup-records',
      data: {
        dedupKey: key,
        dedupMode,
        clientIp: clientIp || null,
        sessionId: sessionId || null,
        sentAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    })

    console.log(`[Email Dedup] Added key to database with expiresAt=${expiresAt.toISOString()}`)

    // 清理过期记录（使用 Payload 原生查询）
    try {
      const expiredRecords = await payload.find({
        collection: 'email-dedup-records',
        where: {
          expiresAt: { less_than: new Date().toISOString() },
        },
        limit: 100,
        depth: 0,
      })

      if (expiredRecords.docs.length > 0) {
        for (const record of expiredRecords.docs) {
          await payload.delete({
            collection: 'email-dedup-records',
            id: record.id,
          })
        }
        console.log(`[Email Dedup] Cleaned ${expiredRecords.docs.length} expired records from database`)
      }
    } catch (cleanupError) {
      console.warn(`[Email Dedup] Failed to cleanup expired records:`, cleanupError)
    }

    console.log(`[Email Dedup] Allowing notification`)
    return true
  } catch (error) {
    console.error(`[Email Dedup] Failed to check/create dedup record:`, error)
    // 出错时默认允许发送，避免阻塞正常通知
    console.log(`[Email Dedup] Fallback: allowing notification due to error`)
    return true
  }
}

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
        subjectTemplate: doc.subjectTemplate || '【{{typeLabel}}】新消息 - {{sessionId}}',
        dedupMode: (doc as any).dedupMode || 'ip_per_day',
      }))
    }
  } catch (err) {
    console.warn('[Email] Failed to read DB config for chat, falling back to env:', err)
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
      subjectTemplate: '【{{typeLabel}}】新消息 - {{sessionId}}',
      dedupMode: 'ip_per_day',
    },
  ]
}

/**
 * 替换邮件主题模板中的变量
 */
function renderSubject(template: string, data: {
  typeLabel: string
  sessionId: string
}): string {
  return template
    .replace(/\{\{typeLabel\}\}/g, data.typeLabel)
    .replace(/\{\{sessionId\}\}/g, data.sessionId || '未知会话')
}

/**
 * 客服消息邮件通知
 * 当客户发送新消息时，发送邮件到指定收件人
 * 优先使用数据库 email-notifications 集合的配置，未配置时回退到环境变量
 * 同一 IP 同一天只发送一次邮件提醒，避免重复打扰
 */
export async function sendChatNotification(data: {
  sessionId: string
  customerMessage: string
  timestamp: string
  messageCount?: number
  clientIp?: string  // 客户端 IP，用于去重
}): Promise<void> {
  const configs = await getEmailConfig('chat')

  if (!configs || configs.length === 0) {
    console.warn(`[Email] No SMTP config found for formType="chat", skipping notification`)
    return
  }

  const typeLabel = '在线客服'

  for (const cfg of configs) {
    if (cfg.recipients.length === 0) {
      console.warn(`[Email] Config "${cfg.name}" has no recipients, skipping`)
      continue
    }

    // 根据数据库配置的去重模式检查是否应该发送
    const dedupMode = cfg.dedupMode || 'ip_per_day'
    const ip = data.clientIp || 'unknown'
    const shouldSend = await shouldSendNotification(dedupMode, ip, data.sessionId)
    if (!shouldSend) {
      console.log(`[Email] Chat notification skipped for session ${data.sessionId} (dedupMode=${dedupMode})`)
      continue
    }

    const subject = renderSubject(cfg.subjectTemplate, {
      typeLabel,
      sessionId: data.sessionId,
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          ${typeLabel}新消息通知
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">会话 ID：</td><td style="padding: 8px 0;">${data.sessionId}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">消息时间：</td><td style="padding: 8px 0;">${new Date(data.timestamp).toLocaleString('zh-CN')}</td></tr>
          ${data.messageCount ? `<tr><td style="padding: 8px 0; font-weight: bold;">消息总数：</td><td style="padding: 8px 0;">${data.messageCount} 条</td></tr>` : ''}
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">客户消息：</td><td style="padding: 8px 0; white-space: pre-wrap;">${data.customerMessage}</td></tr>
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

      console.log(`[Email] Chat notification sent via "${cfg.name}" (${cfg.source}) to ${cfg.recipients.join(', ')}`)
    } catch (error) {
      console.error(`[Email] Failed to send chat notification via "${cfg.name}" (${cfg.source}):`, error)
    }
  }
}
