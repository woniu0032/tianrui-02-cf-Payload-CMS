import type { CollectionConfig } from 'payload'
import { sendChatNotification } from '../utils/sendChatNotification'

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
    update: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        // 检测是否有新消息
        const currentMessages = doc.messages || []
        const previousMessages = previousDoc?.messages || []
        const hasNewMessage = currentMessages.length > previousMessages.length

        if (!hasNewMessage) return

        const lastMessage = currentMessages[currentMessages.length - 1]

        // 只通知用户发送的消息（role === 'user'）
        if (lastMessage.role !== 'user') return

        try {
          await sendChatNotification({
            sessionId: doc.sessionId,
            customerMessage: lastMessage.content,
            timestamp: lastMessage.timestamp,
            messageCount: currentMessages.length,
          })
        } catch (error) {
          console.error('[ChatSessions] Failed to send email notification:', error)
          // 不阻塞主流程，仅记录错误
        }
      },
    ],
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
          type: 'text',
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
      type: 'text',
      label: '状态',
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
