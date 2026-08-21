import React, { useState, useEffect } from 'react';
import { ChatSession } from '../services/api';

interface SessionListPanelProps {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelectSession: (id: string) => void;
  onClose: () => void;
}

const SessionListPanel: React.FC<SessionListPanelProps> = ({
  sessions,
  selectedId,
  onSelectSession,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤会话列表
  const filteredSessions = sessions.filter((session) => {
    if (filter !== 'all' && session.status !== filter) return false;
    if (searchQuery) {
      const lastMsg = session.messages?.[session.messages.length - 1];
      const content = lastMsg?.content || '';
      const sessionId = session.sessionId || '';
      return (
        content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sessionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // 统计
  const activeCount = sessions.filter(s => s.status === 'active').length;
  const closedCount = sessions.filter(s => s.status === 'closed').length;

  // 获取最后一条消息预览
  const getMessagePreview = (session: ChatSession) => {
    const messages = session.messages || [];
    if (messages.length === 0) return '暂无消息';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.content.length > 50 
      ? lastMsg.content.substring(0, 50) + '...' 
      : lastMsg.content;
  };

  // 格式化时间
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    return date.toLocaleString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white border-b shadow-sm">
      {/* 面板头部 */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">全局会话列表</h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">活跃 {activeCount}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">已关闭 {closedCount}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="收起列表"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="px-4 py-3 border-b space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索会话内容或ID..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          {(['all', 'active', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已关闭'}
            </button>
          ))}
        </div>
      </div>

      {/* 会话列表 */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchQuery ? '未找到匹配的会话' : '暂无会话'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = selectedId === session.id;
            const preview = getMessagePreview(session);
            
            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                className={`p-4 border-b cursor-pointer transition hover:bg-blue-50 ${
                  isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm text-gray-900 truncate flex-1 mr-2">
                    {session.sessionId.slice(0, 16)}...
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      session.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : session.status === 'transferred'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {session.status === 'active'
                      ? '活跃'
                      : session.status === 'transferred'
                      ? '已转接'
                      : '已关闭'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">{preview}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {formatTime(session.lastMessageAt)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session.messages?.length || 0} 条消息
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionListPanel;
