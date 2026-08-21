import type { CollectionConfig } from 'payload'
import { sendChatNotification } from '../utils/sendChatNotification'

export const ChatSessions: CollectionConfig = {
  slug: 'chat-sessions',
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'status', 'lastMessageAt', 'createdAt'],
    group: '数据管理',
    description: '💬 客服工作台入口：https://api.hyfsad.com/chat-dashboard',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // 检测是否有新消息
        const currentMessages = doc.messages || []
        const previousMessages = previousDoc?.messages || []
        const hasNewMessage = currentMessages.length > previousMessages.length

        if (!hasNewMessage) return

        const lastMessage = currentMessages[currentMessages.length - 1]

        // 只通知用户发送的消息（role === 'user'）
        if (lastMessage.role !== 'user') return

        // 从请求中获取客户端 IP（按优先级尝试多个 header）
        const forwardedFor = req.headers?.get('x-forwarded-for') as string
        const realIp = req.headers?.get('x-real-ip') as string
        const cfConnectingIp = req.headers?.get('cf-connecting-ip') as string

        // Cloudflare 代理下，x-forwarded-for 可能包含多个 IP，取第一个
        let clientIp: string | undefined
        if (forwardedFor) {
          clientIp = forwardedFor.split(',')[0].trim()
        } else if (realIp) {
          clientIp = realIp.trim()
        } else if (cfConnectingIp) {
          clientIp = cfConnectingIp.trim()
        }

        console.log(`[ChatSessions] Extracted clientIp: ${clientIp}, headers: x-forwarded-for=${!!forwardedFor}, x-real-ip=${!!realIp}, cf-connecting-ip=${!!cfConnectingIp}`)

        try {
          await sendChatNotification({
            sessionId: doc.sessionId,
            customerMessage: lastMessage.content,
            timestamp: lastMessage.timestamp,
            messageCount: currentMessages.length,
            clientIp,
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
    {
      name: 'pinnedAt',
      type: 'date',
      label: '置顶时间',
      admin: {
        description: '非空表示已置顶，按此字段降序排列',
      },
    },
  ],
}
