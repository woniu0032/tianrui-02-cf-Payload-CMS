'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import SessionListPanel from './SessionListPanel'

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
  pinnedAt?: string
  createdAt: string
  updatedAt: string
}

// 使用相对路径避免 SSR hydration mismatch
const API_BASE = ''

// 天睿纺织官网配色体系
const C = {
  navy: '#12294b',        // 深色导航
  navySoft: '#1a3a66',
  blue: '#1e5aa8',        // 商务蓝主色
  blueHover: '#17498a',
  blueLight: '#eaf2fb',
  blueBorder: '#c9dcf3',
  bg: '#f4f7fb',
  card: '#ffffff',
  text: '#1f2937',
  sub: '#64748b',
  faint: '#94a3b8',
  border: '#e5eaf2',
  green: '#10b981',
  greenBg: '#e7f8f1',
  red: '#ef4444',
  redBg: '#fdecec',
  gray: '#6b7280',
  grayBg: '#f1f3f7',
}

const css = `
.tr-cd * { box-sizing: border-box; margin: 0; padding: 0; }
.tr-cd { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: ${C.bg}; color: ${C.text}; min-height: 100vh; display: flex; flex-direction: column; }
.tr-cd button { font-family: inherit; cursor: pointer; border: none; background: none; }
.tr-cd textarea { font-family: inherit; }
.tr-cd ::-webkit-scrollbar { width: 6px; height: 6px; }
.tr-cd ::-webkit-scrollbar-thumb { background: #c3cfdd; border-radius: 3px; }
.tr-cd ::-webkit-scrollbar-track { background: transparent; }

.tr-topbar { background: ${C.navy}; color: #fff; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; box-shadow: 0 2px 8px rgba(18,41,75,.25); }
.tr-logo { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; letter-spacing: .5px; }
.tr-logo-badge { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, ${C.blue}, #3b82d8); display: flex; align-items: center; justify-content: center; font-size: 15px; }
.tr-topbar-right { display: flex; align-items: center; gap: 14px; font-size: 12px; color: rgba(255,255,255,.75); }
.tr-live-dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.green}; display: inline-block; animation: trPulse 1.6s infinite; }
@keyframes trPulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.5);} 70% { box-shadow: 0 0 0 6px rgba(16,185,129,0);} 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0);} }

.tr-stats { display: flex; gap: 14px; padding: 18px 24px 0; flex-wrap: wrap; }
.tr-stat { flex: 1; min-width: 150px; background: ${C.card}; border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 4px rgba(18,41,75,.08); border: 1px solid ${C.border}; }
.tr-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.tr-stat-num { font-size: 22px; font-weight: 700; line-height: 1.1; }
.tr-stat-label { font-size: 12px; color: ${C.sub}; margin-top: 2px; }

.tr-body { flex: 1; display: flex; gap: 14px; padding: 14px 24px 24px; min-height: 0; overflow: hidden; }
.tr-list { width: 340px; flex-shrink: 0; background: ${C.card}; border-radius: 10px; border: 1px solid ${C.border}; box-shadow: 0 1px 4px rgba(18,41,75,.08); display: flex; flex-direction: column; min-height: 0; }
.tr-list-head { padding: 14px 16px 10px; border-bottom: 1px solid ${C.border}; }
.tr-list-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.tr-filters { display: flex; gap: 6px; }
.tr-filter { flex: 1; padding: 7px 0; font-size: 12px; border-radius: 7px; background: ${C.grayBg}; color: ${C.sub}; font-weight: 500; transition: all .2s; }
.tr-filter:hover { background: #e6eaf1; }
.tr-filter.on { background: ${C.blue}; color: #fff; box-shadow: 0 2px 6px rgba(30,90,168,.35); }
.tr-list-body { flex: 1; overflow-y: auto; }
.tr-item { padding: 13px 16px; border-bottom: 1px solid ${C.border}; cursor: pointer; position: relative; transition: background .15s; border-left: 3px solid transparent; }
.tr-item:hover { background: ${C.blueLight}; }
.tr-item.sel { background: ${C.blueLight}; border-left-color: ${C.blue} !important; }
.tr-item.new-msg { background: #fff8e6; border-left-color: #f59e0b; }
.tr-item.new-msg:hover { background: #fef3c7; }
.tr-item.pinned { border-left-color: ${C.blue}; }
.tr-item-actions { position: absolute; top: 10px; right: 10px; display: none; gap: 4px; }
.tr-item:hover .tr-item-actions { display: flex; }
.tr-item-action-btn { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all .15s; }
.tr-item-action-btn.pin { background: ${C.blueLight}; color: ${C.blue}; }
.tr-item-action-btn.pin:hover { background: ${C.blue}; color: #fff; }
.tr-item-action-btn.del { background: ${C.redBg}; color: ${C.red}; }
.tr-item-action-btn.del:hover { background: ${C.red}; color: #fff; }
.tr-pin-icon { font-size: 12px; }
.tr-item-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 5px; padding-right: 60px; }
.tr-item-id { font-size: 13px; font-weight: 600; color: ${C.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tr-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; font-weight: 500; }
.tr-item-msg { font-size: 12px; color: ${C.sub}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.tr-item-foot { display: flex; justify-content: space-between; font-size: 11px; color: ${C.faint}; }
.tr-unread-dot { position: absolute; top: 14px; right: 14px; width: 8px; height: 8px; border-radius: 50%; background: ${C.red}; box-shadow: 0 0 0 3px ${C.redBg}; }

.tr-chat { flex: 1; background: ${C.card}; border-radius: 10px; border: 1px solid ${C.border}; box-shadow: 0 1px 4px rgba(18,41,75,.08); display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.tr-chat-head { padding: 13px 18px; border-bottom: 1px solid ${C.border}; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.tr-chat-head-id { font-size: 14px; font-weight: 700; }
.tr-chat-head-sub { font-size: 12px; color: ${C.sub}; margin-top: 2px; }
.tr-chat-actions { display: flex; gap: 8px; }
.tr-btn { padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; transition: all .2s; }
.tr-btn-primary { background: ${C.blue}; color: #fff; box-shadow: 0 2px 6px rgba(30,90,168,.3); }
.tr-btn-primary:hover { background: ${C.blueHover}; }
.tr-btn-ghost { background: ${C.grayBg}; color: ${C.sub}; }
.tr-btn-ghost:hover { background: #e6eaf1; color: ${C.text}; }
.tr-btn:disabled { opacity: .5; cursor: not-allowed; }

.tr-msgs { flex: 1; overflow-y: auto; padding: 20px 18px; background: ${C.bg}; display: flex; flex-direction: column; gap: 14px; }
.tr-msg { max-width: 72%; display: flex; flex-direction: column; }
.tr-msg.user { align-self: flex-start; }
.tr-msg.assistant { align-self: flex-end; }
.tr-bubble { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; box-shadow: 0 1px 3px rgba(18,41,75,.1); }
.tr-msg.user .tr-bubble { background: ${C.card}; border: 1px solid ${C.border}; border-top-left-radius: 4px; }
.tr-msg.assistant .tr-bubble { background: ${C.blue}; color: #fff; border-top-right-radius: 4px; }
.tr-msg-meta { font-size: 11px; color: ${C.faint}; margin-top: 4px; }
.tr-msg.user .tr-msg-meta { align-self: flex-start; }
.tr-msg.assistant .tr-msg-meta { align-self: flex-end; }

.tr-input-bar { padding: 14px 16px; border-top: 1px solid ${C.border}; display: flex; gap: 10px; align-items: flex-end; background: ${C.card}; border-radius: 0 0 10px 10px; }
.tr-input { flex: 1; resize: none; border: 1px solid ${C.border}; border-radius: 8px; padding: 10px 12px; font-size: 13px; line-height: 1.5; max-height: 120px; outline: none; transition: border-color .2s, box-shadow .2s; background: #fbfcfe; }
.tr-input:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(30,90,168,.12); background: #fff; }

.tr-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${C.faint}; gap: 12px; padding: 40px 20px; text-align: center; }
.tr-empty-icon { width: 64px; height: 64px; border-radius: 16px; background: ${C.blueLight}; color: ${C.blue}; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.tr-empty-title { font-size: 15px; font-weight: 600; color: ${C.sub}; }
.tr-empty-sub { font-size: 12px; }

.tr-loading { display: flex; align-items: center; justify-content: center; height: 100vh; gap: 10px; color: ${C.sub}; font-size: 14px; }
.tr-spinner { width: 22px; height: 22px; border: 3px solid ${C.blueBorder}; border-top-color: ${C.blue}; border-radius: 50%; animation: trSpin .8s linear infinite; }
@keyframes trSpin { to { transform: rotate(360deg); } }

.tr-back { display: none; align-items: center; gap: 6px; color: ${C.blue}; font-size: 13px; font-weight: 600; padding: 10px 16px 0; }

@media (max-width: 860px) {
  .tr-topbar { padding: 0 14px; }
  .tr-stats { padding: 12px 14px 0; gap: 10px; }
  .tr-stat { min-width: calc(50% - 5px); padding: 10px 14px; }
  .tr-stat-num { font-size: 18px; }
  .tr-body { padding: 12px 14px 14px; flex-direction: column; }
  .tr-list { width: 100%; max-height: 260px; }
  .tr-chat { min-height: 400px; }
  .tr-msg { max-width: 86%; }
}
`

export default function ChatDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyInput, setReplyInput] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showSessionList, setShowSessionList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getToken = () => {
    if (typeof document === 'undefined') return null
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'payload-token') return decodeURIComponent(value)
    }
    return null
  }

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken() || ''}`,
  })

  const loadSessions = useCallback(async () => {
    try {
      // 先按 pinnedAt 降序，再按 lastMessageAt 降序
      const params = new URLSearchParams({ limit: '100', sort: '-updatedAt' })
      if (filter !== 'all') params.set('where[status][equals]', filter)

      const res = await fetch(`${API_BASE}/api/chat-sessions?${params}`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      let docs: ChatSession[] = data.docs || []

      // 前端排序：置顶会话优先（pinnedAt 非空且较新的排前面），然后按 lastMessageAt 降序
      docs.sort((a, b) => {
        const aPinned = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
        const bPinned = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
        if (aPinned && bPinned) return bPinned - aPinned  // 都置顶，按置顶时间降序
        if (aPinned) return -1  // a 置顶，排前面
        if (bPinned) return 1   // b 置顶，排前面
        // 都没置顶，按最后消息时间降序
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })

      setSessions(docs)

      const unread = docs.filter((s) => {
        if (s.status !== 'active') return false
        // 如果客服已读过（metadata.readByAgent === true），不算未读
        if (s.metadata?.readByAgent) return false
        const lastMsg = s.messages?.[s.messages.length - 1]
        return lastMsg?.role === 'user'
      }).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadSessions()
    const interval = setInterval(loadSessions, 5000)
    return () => clearInterval(interval)
  }, [loadSessions])

  const selectedSession = sessions.find((s) => s.id === selectedId) || null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedSession?.messages?.length, selectedId])

  const handleReply = async () => {
    const text = replyInput.trim()
    if (!text || !selectedSession || sending) return

    setSending(true)
    setReplyInput('')

    const assistantMsg: Message = {
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
    }

    try {
      const allMessages = [...(selectedSession.messages || []), assistantMsg]
      const res = await fetch(`${API_BASE}/api/chat-sessions/${selectedSession.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          messages: allMessages,
          lastMessageAt: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to send reply')
      loadSessions()
    } catch (err) {
      console.error('Failed to send reply:', err)
      alert('回复发送失败，请重试')
    } finally {
      setSending(false)
    }
  }

  const handleClose = async (session: ChatSession) => {
    if (!confirm('确定关闭此会话？')) return
    try {
      await fetch(`${API_BASE}/api/chat-sessions/${session.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'closed' }),
      })
      loadSessions()
      if (selectedId === session.id) setSelectedId(null)
    } catch (error) {
      console.error('Close failed:', error)
      alert('关闭失败')
    }
  }

  const handleDelete = async (session: ChatSession) => {
    if (!confirm(`确定删除会话 ${session.sessionId.slice(0, 13)}…？\n此操作不可恢复！`)) return
    try {
      const res = await fetch(`${API_BASE}/api/chat-sessions/${session.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete failed')
      loadSessions()
      if (selectedId === session.id) setSelectedId(null)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  const handlePin = async (session: ChatSession) => {
    try {
      const pinnedAt = session.pinnedAt ? null : new Date().toISOString()
      await fetch(`${API_BASE}/api/chat-sessions/${session.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ pinnedAt }),
      })
      loadSessions()
    } catch (error) {
      console.error('Pin failed:', error)
      alert('置顶操作失败')
    }
  }

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedId(session.id)

    // 如果该会话有未读消息（最后一条是用户发的），调用 API 清除未读标记
    const lastMsg = session.messages?.[session.messages.length - 1]
    if (session.status === 'active' && lastMsg?.role === 'user') {
      try {
        // 通过添加一个空的 assistant 消息或更新 metadata 来标记已读
        // 这里使用 metadata 中的 readByAgent 字段来标记
        await fetch(`${API_BASE}/api/chat-sessions/${session.id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            metadata: { ...session.metadata, readByAgent: true, readAt: new Date().toISOString() },
          }),
        })
        // 立即刷新列表以清除红点
        loadSessions()
      } catch (error) {
        console.error('Mark as read failed:', error)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply()
    }
  }

  const fmtTime = (t?: string) =>
    t
      ? new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '-'

  const activeCount = sessions.filter((s) => s.status === 'active').length
  const closedCount = sessions.filter((s) => s.status === 'closed').length

  const statusTag = (status: string) => {
    if (status === 'active') return <span className="tr-tag" style={{ background: C.greenBg, color: C.green }}>活跃</span>
    if (status === 'transferred') return <span className="tr-tag" style={{ background: C.blueLight, color: C.blue }}>已转接</span>
    return <span className="tr-tag" style={{ background: C.grayBg, color: C.gray }}>已关闭</span>
  }

  if (loading) {
    return (
      <div className="tr-cd">
        <style>{css}</style>
        <div className="tr-loading"><div className="tr-spinner" />正在加载会话数据…</div>
      </div>
    )
  }

  return (
    <div className="tr-cd">
      <style>{css}</style>

      {/* 顶部深色导航 */}
      <div className="tr-topbar">
        <div className="tr-logo">
          <div className="tr-logo-badge">💬</div>
          <span>天睿纺织 · 客服工作台</span>
        </div>
        <div className="tr-topbar-right">
          <span className="tr-live-dot" />
          <span>实时同步中（5 秒）</span>
          <a href="/admin" style={{ color: 'rgba(255,255,255,.85)', fontSize: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,.3)', padding: '5px 12px', borderRadius: 7 }}>
            返回 Admin
          </a>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="tr-stats">
        <div className="tr-stat">
          <div className="tr-stat-icon" style={{ background: C.greenBg, color: C.green }}>●</div>
          <div>
            <div className="tr-stat-num" style={{ color: C.green }}>{activeCount}</div>
            <div className="tr-stat-label">活跃会话</div>
          </div>
        </div>
        <div className="tr-stat">
          <div className="tr-stat-icon" style={{ background: C.grayBg, color: C.gray }}>■</div>
          <div>
            <div className="tr-stat-num" style={{ color: C.sub }}>{closedCount}</div>
            <div className="tr-stat-label">已关闭</div>
          </div>
        </div>
        <div className="tr-stat">
          <div className="tr-stat-icon" style={{ background: C.redBg, color: C.red }}>!</div>
          <div>
            <div className="tr-stat-num" style={{ color: unreadCount > 0 ? C.red : C.sub }}>{unreadCount}</div>
            <div className="tr-stat-label">未读消息</div>
          </div>
        </div>
      </div>

      {/* 主体分栏 */}
      <div className="tr-body">
        {/* 左侧会话列表（常驻不隐藏） */}
        <div className="tr-list">
          <div className="tr-list-head">
            <div className="tr-list-title">
              <span>会话列表</span>
              <span style={{ fontSize: 11, color: C.faint, fontWeight: 400 }}>共 {sessions.length} 个</span>
            </div>
            <div className="tr-filters">
              {(['all', 'active', 'closed'] as const).map((f) => (
                <button key={f} className={`tr-filter ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已关闭'}
                </button>
              ))}
            </div>
          </div>
          <div className="tr-list-body">
            {sessions.length === 0 ? (
              <div className="tr-empty" style={{ minHeight: 200 }}>
                <div className="tr-empty-icon"></div>
                <div className="tr-empty-title">暂无会话</div>
                <div className="tr-empty-sub">客户发起咨询后会实时显示在这里</div>
              </div>
            ) : (
              sessions.map((session) => {
                const lastMsg = session.messages?.[session.messages.length - 1]
                // 未读判断：活跃状态 + 最后一条是用户消息 + 客服未读过
                const hasUnread = session.status === 'active' && lastMsg?.role === 'user' && !session.metadata?.readByAgent
                const isNewMsg = hasUnread && selectedId !== session.id
                const isPinned = !!session.pinnedAt
                return (
                  <div
                    key={session.id}
                    className={`tr-item ${selectedId === session.id ? 'sel' : ''} ${isNewMsg ? 'new-msg' : ''} ${isPinned ? 'pinned' : ''}`}
                    onClick={() => handleSelectSession(session)}
                  >
                    {/* 悬停操作按钮 */}
                    <div className="tr-item-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`tr-item-action-btn pin`}
                        title={isPinned ? '取消置顶' : '置顶'}
                        onClick={() => handlePin(session)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </button>
                      <button
                        className="tr-item-action-btn del"
                        title="删除会话"
                        onClick={() => handleDelete(session)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>

                    {hasUnread && <div className="tr-unread-dot" />}
                    <div className="tr-item-top">
                      <span className="tr-item-id">
                        {isPinned && <span className="tr-pin-icon" style={{ marginRight: 4 }}>📌</span>}
                        {session.sessionId.slice(0, 13)}…
                      </span>
                      {statusTag(session.status)}
                    </div>
                    <div className="tr-item-msg" style={hasUnread ? { color: C.text, fontWeight: 600 } : undefined}>
                      {lastMsg ? `${lastMsg.role === 'user' ? '客户：' : '客服：'}${lastMsg.content}` : '暂无消息'}
                    </div>
                    <div className="tr-item-foot">
                      <span>{fmtTime(session.lastMessageAt)}</span>
                      <span>{session.messages?.length || 0} 条消息</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 右侧聊天窗口（常驻不隐藏） */}
        <div className="tr-chat">
          {selectedSession ? (
            <>
              {/* 全局会话列表面板（可折叠） */}
              {showSessionList && (
                <SessionListPanel
                  sessions={sessions}
                  selectedId={selectedId}
                  onSelectSession={(id) => {
                    setSelectedId(id)
                    setShowSessionList(false)
                  }}
                  onClose={() => setShowSessionList(false)}
                />
              )}

              <div className="tr-chat-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* 切换会话按钮 */}
                  <button
                    onClick={() => setShowSessionList(!showSessionList)}
                    title="查看全局会话列表"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 7,
                      background: C.blueLight,
                      color: C.blue,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#d4e4f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = C.blueLight)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span>会话列表</span>
                    {activeCount > 0 && (
                      <span style={{ marginLeft: 2, padding: '1px 6px', borderRadius: 999, background: C.blue, color: '#fff', fontSize: 11 }}>
                        {activeCount}
                      </span>
                    )}
                  </button>
                  <div>
                    <div className="tr-chat-head-id">会话 {selectedSession.sessionId.slice(0, 13)}…</div>
                    <div className="tr-chat-head-sub">
                      {statusTag(selectedSession.status)}
                      <span style={{ marginLeft: 8 }}>最后活跃 {fmtTime(selectedSession.lastMessageAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="tr-chat-actions">
                  {selectedSession.status === 'active' && (
                    <button className="tr-btn tr-btn-ghost" onClick={() => handleClose(selectedSession)}>
                      关闭会话
                    </button>
                  )}
                </div>
              </div>

              <div className="tr-msgs">
                {(selectedSession.messages || []).map((msg, i) => (
                  <div key={i} className={`tr-msg ${msg.role === 'assistant' ? 'assistant' : 'user'}`}>
                    <div className="tr-bubble">{msg.content}</div>
                    <div className="tr-msg-meta">
                      {msg.role === 'assistant' ? '客服' : '客户'} · {fmtTime(msg.timestamp)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="tr-input-bar">
                <textarea
                  className="tr-input"
                  rows={2}
                  placeholder="输入回复内容，Enter 发送，Shift+Enter 换行"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="tr-btn tr-btn-primary" onClick={handleReply} disabled={sending || !replyInput.trim()}>
                  {sending ? '发送中…' : '发送'}
                </button>
              </div>
            </>
          ) : (
            <div className="tr-empty">
              <div className="tr-empty-icon"></div>
              <div className="tr-empty-title">选择一个会话开始回复</div>
              <div className="tr-empty-sub">左侧列表中带红点的会话有客户未读消息</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
