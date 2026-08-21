import type { CollectionConfig } from 'payload'

export const EmailDedupRecords: CollectionConfig = {
  slug: 'email-dedup-records',
  admin: {
    useAsTitle: 'dedupKey',
    defaultColumns: ['dedupKey', 'dedupMode', 'clientIp', 'sentAt', 'expiresAt'],
    group: '系统管理',
    description: '📧 邮件去重记录，用于防止重复发送通知',
  },
  access: {
    read: () => true,
    create: () => false, // 仅系统内部创建
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'dedupKey',
      type: 'text',
      label: '去重键',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '格式: ip_{ip}_{date} 或 session_{sessionId}',
      },
    },
    {
      name: 'dedupMode',
      type: 'text',
      label: '去重模式',
      required: true,
    },
    {
      name: 'clientIp',
      type: 'text',
      label: '客户端 IP',
    },
    {
      name: 'sessionId',
      type: 'text',
      label: '会话 ID',
    },
    {
      name: 'sentAt',
      type: 'date',
      label: '发送时间',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: '过期时间',
      required: true,
      admin: {
        description: '超过此时间的记录会被自动清理',
      },
    },
  ],
}
