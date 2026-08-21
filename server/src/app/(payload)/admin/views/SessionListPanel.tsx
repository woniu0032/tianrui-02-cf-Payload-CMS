'use client'

import React, { useState } from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  sessionId: string
  userId?: string
  messages: Message[]
  status: 'active' | 'closed' | 'transferred'
  metadata?: any
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

const C = {
  navy: '#12294b',
  blue: '#1e5aa8',
  blueHover: '#17498a',
  blueLight: '#eaf2fb',
  bg: '#f4f7fb',
  card: '#ffffff',
  text: '#1f2937',
  sub: '#64748b',
  faint: '#94a3b8',
  border: '#e5eaf2',
  green: '#10b981',
  greenBg: '#e7f8f1',
  gray: '#6b7280',
  grayBg: '#f1f3f7',
}

interface SessionListPanelProps {
  sessions: ChatSession[]
  selectedId: string | null
  onSelectSession: (id: string) => void
  onClose: () => void
}

export default function SessionListPanel({
  sessions,
  selectedId,
  onSelectSession,
  onClose,
}: SessionListPanelProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSessions = sessions.filter((session) => {
    if (filter !== 'all' && session.status !== filter) return false
    if (searchQuery) {
      const lastMsg = session.messages?.[session.messages.length - 1]
      const content = lastMsg?.content || ''
      const sessionId = session.sessionId || ''
      return (
        content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sessionId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  const activeCount = sessions.filter((s) => s.status === 'active').length
  const closedCount = sessions.filter((s) => s.status === 'closed').length

  const getMessagePreview = (session: ChatSession) => {
    const messages = session.messages || []
    if (messages.length === 0) return '暂无消息'
    const lastMsg = messages[messages.length - 1]
    return lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const statusTag = (status: string) => {
    if (status === 'active')
      return (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: C.greenBg, color: C.green, fontWeight: 500 }}>
          活跃
        </span>
      )
    if (status === 'transferred')
      return (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: C.blueLight, color: C.blue, fontWeight: 500 }}>
          已转接
        </span>
      )
    return (
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: C.grayBg, color: C.gray, fontWeight: 500 }}>
        已关闭
      </span>
    )
  }

  return (
    <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(18,41,75,.08)' }}>
      {/* 面板头部 */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>全局会话列表</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: C.greenBg, color: C.green }}>活跃 {activeCount}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: C.grayBg, color: C.sub }}>已关闭 {closedCount}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          title="收起列表"
          style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.sub }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.grayBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索会话内容或ID..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
            marginBottom: 10,
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
          onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? C.blue : C.grayBg,
                color: filter === f ? '#fff' : C.sub,
                transition: 'all .2s',
              }}
            >
              {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已关闭'}
            </button>
          ))}
        </div>
      </div>

      {/* 会话列表 */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: C.faint, fontSize: 13 }}>
            {searchQuery ? '未找到匹配的会话' : '暂无会话'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = selectedId === session.id
            const preview = getMessagePreview(session)

            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id)
                  onClose()
                }}
                style={{
                  padding: '13px 16px',
                  borderBottom: `1px solid ${C.border}`,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${isSelected ? C.blue : 'transparent'}`,
                  background: isSelected ? C.blueLight : 'transparent',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = C.blueLight
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, marginRight: 8 }}>
                    {session.sessionId.slice(0, 16)}...
                  </span>
                  {statusTag(session.status)}
                </div>
                <div style={{ fontSize: 12, color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 5 }}>
                  {preview}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.faint }}>
                  <span>{formatTime(session.lastMessageAt)}</span>
                  <span>{session.messages?.length || 0} 条消息</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
