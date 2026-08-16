import type { CollectionConfig } from 'payload'

export const EmailNotifications: CollectionConfig = {
  slug: 'email-notifications',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'enabled', 'smtpHost', 'createdAt'],
    group: '系统配置',
    description: '邮件通知配置，支持多收件人管理。数据库配置优先于环境变量。',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '配置名称',
      required: true,
      unique: true,
      admin: {
        description: '例如：询盘通知、留言通知',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
      admin: {
        description: '关闭后此配置不会触发邮件发送',
      },
    },
    {
      name: 'formTypes',
      type: 'select',
      label: '适用表单类型',
      hasMany: true,
      required: true,
      options: [
        { label: '询盘 (inquiry)', value: 'inquiry' },
        { label: '在线留言 (message)', value: 'message' },
        { label: '在线客服 (chat)', value: 'chat' },
      ],
      admin: {
        description: '选择哪些表单类型使用此配置发送邮件',
      },
    },
    // SMTP 服务器配置
    {
      name: 'smtpHost',
      type: 'text',
      label: 'SMTP 服务器地址',
      required: true,
      admin: {
        placeholder: 'smtp.163.com',
      },
    },
    {
      name: 'smtpPort',
      type: 'number',
      label: 'SMTP 端口',
      defaultValue: 465,
      admin: {
        description: 'SSL 通常用 465，TLS 通常用 587',
      },
    },
    {
      name: 'smtpSecure',
      type: 'checkbox',
      label: '使用 SSL/TLS',
      defaultValue: true,
      admin: {
        description: '端口 465 勾选此项，端口 587 取消勾选',
      },
    },
    {
      name: 'smtpUser',
      type: 'text',
      label: 'SMTP 账号',
      required: true,
      admin: {
        placeholder: 'your-email@163.com',
      },
    },
    {
      name: 'smtpPass',
      type: 'text',
      label: 'SMTP 密码/授权码',
      required: true,
      admin: {
        description: '163/QQ 邮箱请使用授权码而非登录密码',
        placeholder: '输入授权码',
      },
    },
    {
      name: 'smtpFrom',
      type: 'text',
      label: '发件人地址',
      admin: {
        description: '留空则使用 SMTP 账号作为发件人',
        placeholder: '留空默认使用 SMTP 账号',
      },
    },
    // 收件人列表
    {
      name: 'recipients',
      type: 'array',
      label: '收件人列表',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'email',
          type: 'email',
          label: '邮箱地址',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: '备注名称',
          admin: {
            description: '可选，用于标识收件人身份',
            placeholder: '例如：王总、李经理',
          },
        },
      ],
    },
    {
      name: 'extraRecipients',
      type: 'textarea',
      label: '额外收件人（逗号分隔）',
      admin: {
        description: '可在此处快速添加多个邮箱，每行一个或用逗号分隔',
        rows: 3,
      },
    },
    {
      name: 'subjectTemplate',
      type: 'text',
      label: '邮件主题模板',
      defaultValue: '【{{typeLabel}}】{{customerName}} - {{productOrCompany}}',
      admin: {
        description: '可用变量：{{typeLabel}} {{customerName}} {{productOrCompany}}',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '备注',
      admin: {
        description: '内部备注，不影响邮件发送',
        rows: 2,
      },
    },
  ],
}
