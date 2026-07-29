import type { CollectionConfig } from 'payload'

export const ChatSessions: CollectionConfig = {
  slug: 'chat-sessions',
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'status', 'lastMessageAt', 'createdAt'],
    group: '数据管理',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      label: '会话 ID',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'userId',
      type: 'text',
      label: '用户 ID',
    },
    {
      name: 'messages',
      type: 'array',
      label: '消息记录',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: '用户', value: 'user' },
            { label: '助手', value: 'assistant' },
            { label: '系统', value: 'system' },
          ],
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      options: [
        { label: '进行中', value: 'active' },
        { label: '已关闭', value: 'closed' },
        { label: '已转接', value: 'transferred' },
      ],
      defaultValue: 'active',
      index: true,
    },
    {
      name: 'metadata',
      type: 'json',
      label: '元数据',
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      label: '最后消息时间',
      index: true,
    },
    {
      name: 'transferredTo',
      type: 'relationship',
      label: '转接给',
      relationTo: 'users',
    },
    {
      name: 'transferredAt',
      type: 'date',
      label: '转接时间',
    },
  ],
}
