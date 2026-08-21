import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchChatSessions,
  fetchChatSession,
  updateChatSession,
  logoutUser,
  isAuthenticated,
  ChatSession,
  API_BASE_URL,
  WS_BASE_URL
} from '../services/api';
import SessionListPanel from '../components/SessionListPanel';

const AdminChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [showSessionList, setShowSessionList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      if (filter !== 'all') params.status = filter;
      const response = await fetchChatSessions(params);
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      if ((error as any).message?.includes('Unauthorized')) {
        logoutUser();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  // 初始加载 + 定时刷新列表
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [loadSessions, navigate]);

  // 选中会话时加载详情 + WebSocket 实时订阅
  useEffect(() => {
    if (!selectedId) {
      setSelectedSession(null);
      return;
    }

    const loadDetail = async () => {
      try {
        const session = sessions.find(s => s.id === selectedId);
        if (session) {
          const detail = await fetchChatSession(session.sessionId);
          setSelectedSession(detail || session);
        }
      } catch (err) {
        console.error('Failed to load session detail:', err);
      }
    };

    loadDetail();

    // WebSocket 实时订阅当前选中会话（带轮询降级）
    let pollingInterval: NodeJS.Timeout | null = null;
    let wsConnected = false;

    const startPolling = () => {
      console.log('[AdminChat] WebSocket unavailable, falling back to polling');
      pollingInterval = setInterval(async () => {
        try {
          const session = await fetchChatSession(
            sessions.find(s => s.id === selectedId)?.sessionId || ''
          );
          if (session && session.messages) {
            setSelectedSession(prev => prev ? { ...prev, messages: session.messages } : null);
            setSessions(prev => prev.map(s =>
              s.id === selectedId ? { ...s, messages: session.messages } : s
            ));
          }
        } catch (err) {
          console.error('[AdminChat] Polling failed:', err);
        }
      }, 3000); // 每 3 秒轮询一次
    };

    const wsUrl = `${WS_BASE_URL}/api/chat-sessions/${selectedId}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AdminChat] WebSocket connected');
        wsConnected = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.doc?.messages) {
            setSelectedSession(prev => prev ? { ...prev, messages: data.doc.messages } : null);
            // 同时更新列表中的消息预览
            setSessions(prev => prev.map(s =>
              s.id === selectedId ? { ...s, messages: data.doc.messages } : s
            ));
          }
        } catch (err) {
          console.error('[AdminChat] Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[AdminChat] WebSocket error:', err);
        if (!wsConnected) {
          startPolling();
        }
      };

      ws.onclose = () => {
        console.log('[AdminChat] WebSocket disconnected');
        if (!wsConnected) {
          startPolling();
        }
      };
    } catch (err) {
      console.error('[AdminChat] WebSocket creation failed:', err);
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedId, sessions]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  // 发送回复
  const handleReply = async () => {
    const text = replyInput.trim();
    if (!text || !selectedSession || sending) return;

    setSending(true);
    setReplyInput('');

    const assistantMsg = {
      role: 'assistant' as const,
      content: text,
      timestamp: new Date().toISOString(),
    };

    try {
      const allMessages = [...(selectedSession.messages || []), assistantMsg];
      await updateChatSession(selectedSession.id, {
        messages: allMessages,
        lastMessageAt: new Date().toISOString(),
      });
      // WebSocket 会自动推送更新，无需手动刷新
      loadSessions(); // 仅刷新列表排序
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('回复发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // 关闭会话
  const handleClose = async (session: ChatSession) => {
    if (!confirm('确定关闭此会话？')) return;
    try {
      await updateChatSession(session.id, { status: 'closed' });
      loadSessions();
      if (selectedId === session.id) {
        setSelectedId(null);
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Close failed:', error);
      alert('关闭失败');
    }
  };

  // 标记已处理
  const handleMarkProcessed = async (session: ChatSession) => {
    try {
      await updateChatSession(session.id, { 
        status: 'closed',
        metadata: { ...session.metadata, processedAt: new Date().toISOString() }
      });
      loadSessions();
    } catch (error) {
      console.error('Mark processed failed:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin/login');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  // 统计
  const activeCount = sessions.filter(s => s.status === 'active').length;
  const closedCount = sessions.filter(s => s.status === 'closed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">客服工作台</h1>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">活跃 {activeCount}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">已关闭 {closedCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">自动刷新中</span>
            <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition">退出登录</button>
          </div>
        </div>
      </header>

      {/* 主体：左右分栏 */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* 左侧会话列表（移动端隐藏） */}
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r flex flex-col flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          {/* 筛选 */}
          <div className="p-3 border-b flex gap-2">
            {(['all', 'active', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已关闭'}
              </button>
            ))}
          </div>

          {/* 列表 */}
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">暂无会话</div>
            ) : (
              sessions.map((session) => {
                const lastMsg = session.messages?.[session.messages.length - 1];
                const isSelected = selectedId === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedId(session.id)}
                    className={`p-4 border-b cursor-pointer transition hover:bg-blue-50 ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {session.sessionId.slice(0, 16)}...
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        session.status === 'active' ? 'bg-green-100 text-green-700' :
                        session.status === 'transferred' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {session.status === 'active' ? '活跃' : session.status === 'transferred' ? '已转接' : '已关闭'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {lastMsg ? lastMsg.content : '暂无消息'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                      <span className="text-xs text-gray-400">{session.messages?.length || 0} 条消息</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右侧聊天区域 */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <p>选择一个会话开始回复</p>
              </div>
            </div>
          ) : (
            <>
              {/* 全局会话列表面板（可折叠） */}
              {showSessionList && (
                <SessionListPanel
                  sessions={sessions}
                  selectedId={selectedId}
                  onSelectSession={(id) => {
                    setSelectedId(id);
                    setShowSessionList(false);
                  }}
                  onClose={() => setShowSessionList(false)}
                />
              )}

              {/* 会话信息栏 */}
              <div className="bg-white border-b p-4 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedId(null)} className="md:hidden text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  {/* 切换会话按钮 */}
                  <button
                    onClick={() => setShowSessionList(!showSessionList)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    title="查看全局会话列表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    <span>会话列表</span>
                    {sessions.filter(s => s.status === 'active').length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {sessions.filter(s => s.status === 'active').length}
                      </span>
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900">会话 {selectedSession.sessionId.slice(0, 12)}...</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedSession.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {selectedSession.status === 'active' ? '活跃' : selectedSession.status === 'transferred' ? '已转接' : '已关闭'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      创建于 {new Date(selectedSession.createdAt).toLocaleString('zh-CN')} · {selectedSession.messages?.length || 0} 条消息
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedSession.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleMarkProcessed(selectedSession)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm transition"
                      >
                        标记已处理
                      </button>
                      <button
                        onClick={() => handleClose(selectedSession)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition"
                      >
                        关闭会话
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(!selectedSession.messages || selectedSession.messages.length === 0) ? (
                  <div className="text-center text-gray-400 py-12">暂无消息记录</div>
                ) : (
                  selectedSession.messages.map((msg: any, idx: number) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'assistant' ? 'justify-start' : 'justify-center'}`}>
                      <div className={`max-w-[70%] p-3 rounded-xl text-sm break-words ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : msg.role === 'assistant'
                          ? 'bg-white text-gray-700 shadow-sm border rounded-bl-sm'
                          : 'bg-yellow-50 text-yellow-800 text-xs'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          {msg.role === 'assistant' && ' · 客服回复'}
                          {msg.role === 'user' && ' · 客户'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 回复输入区 */}
              <div className="bg-white border-t p-4 flex-shrink-0">
                {selectedSession.status === 'active' ? (
                  <div className="flex gap-3">
                    <textarea
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入回复内容，按 Enter 发送..."
                      rows={2}
                      disabled={sending}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending || !replyInput.trim()}
                      className="px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      {sending ? '发送中...' : '发送'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-3">
                    此会话已{selectedSession.status === 'closed' ? '关闭' : '转接'}，无法回复
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
