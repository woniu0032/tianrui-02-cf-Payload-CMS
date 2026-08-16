import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { createChatSession, fetchChatSession, updateChatSession } from '../services/api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 生成或恢复 sessionId
  const getOrCreateSessionId = () => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('chat_session_id', sid);
    }
    return sid;
  };

  // 初始化会话
  const initSession = async () => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);

    try {
      const existing = await fetchChatSession(sid);
      if (existing && existing.messages?.length > 0) {
        setDocId(existing.id);
        setMessages(existing.messages);
      } else {
        // 创建新会话
        const newSession = await createChatSession(sid);
        if (newSession) {
          setDocId(newSession.id);
          setMessages(newSession.messages || []);
        }
      }
    } catch (err) {
      console.error('Failed to init chat session:', err);
    }
  };

  // 发送消息
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    // 先在前端显示用户消息
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 确保有会话
      let currentDocId = docId;
      if (!currentDocId) {
        const sid = getOrCreateSessionId();
        setSessionId(sid);
        const existing = await fetchChatSession(sid);
        if (existing) {
          currentDocId = existing.id;
          setDocId(currentDocId);
        } else {
          const newSession = await createChatSession(sid);
          if (newSession) {
            currentDocId = newSession.id;
            setDocId(currentDocId);
          }
        }
      }

      if (!currentDocId) {
        throw new Error('No session created');
      }

      // 获取当前所有消息，追加新消息
      const currentSession = await fetchChatSession(sessionId!);
      const allMessages = [...(currentSession?.messages || []), userMsg];

      // 更新会话
      await updateChatSession(currentDocId, {
        messages: allMessages,
        lastMessageAt: new Date().toISOString(),
        status: 'active',
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      // 发送失败时保留前端显示的消息
    } finally {
      setSending(false);
    }
  };

  // 轮询获取新消息（客服回复）
  const pollMessages = useCallback(async () => {
    if (!sessionId || !docId) return;

    try {
      const session = await fetchChatSession(sessionId);
      if (session && session.messages) {
        setMessages(prev => {
          // 只有消息数量变化时才更新
          if (session.messages.length !== prev.length) {
            return session.messages;
          }
          return prev;
        });
      }
    } catch (err) {
      // 静默处理轮询错误
    }
  }, [sessionId, docId]);

  // 打开聊天窗口时初始化
  useEffect(() => {
    if (isOpen && !sessionId) {
      initSession();
    }
  }, [isOpen]);

  // 打开后开始轮询，关闭后停止
  useEffect(() => {
    if (isOpen && sessionId && docId) {
      pollTimerRef.current = setInterval(pollMessages, 5000); // 每5秒轮询
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isOpen, sessionId, docId, pollMessages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 键盘回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{t('chat.title')}</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                {t('chat.placeholder')}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-700 shadow-sm rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              disabled={sending}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? '...' : t('chat.send')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          {/* 未读消息提示点 */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}
    </div>
  );
}
