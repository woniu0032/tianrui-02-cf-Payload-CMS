import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchChatSessions, 
  updateChatSession,
  logoutUser,
  isAuthenticated,
  ChatSession 
} from '../services/api';

const AdminChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadSessions();
    const interval = setInterval(loadSessions, 5000); // 每5秒刷新
    return () => clearInterval(interval);
  }, [navigate]);

  const loadSessions = async () => {
    try {
      const response = await fetchChatSessions({ limit: 100 });
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
  };

  const handleTransfer = async (session: ChatSession) => {
    try {
      await updateChatSession(session.id, { 
        status: 'transferred',
        metadata: { ...session.metadata, transferredAt: new Date().toISOString() }
      });
      alert('会话已转接');
      loadSessions();
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('转接失败');
    }
  };

  const handleClose = async (session: ChatSession) => {
    if (!confirm('确定关闭此会话？')) return;
    try {
      await updateChatSession(session.id, { status: 'closed' });
      alert('会话已关闭');
      loadSessions();
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Close failed:', error);
      alert('关闭失败');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">加载中...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">客服对话监控</h1>
            <span className="text-xs text-gray-500">
              自动刷新中
            </span>
          </div>
          <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition">退出登录</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">暂无活跃会话</p></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition" onClick={() => setSelectedSession(session)}>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-sm">{session.sessionId.slice(0, 12)}...</span>
                  <span className={`text-xs px-2 py-1 rounded ${session.status === 'active' ? 'bg-green-100 text-green-700' : session.status === 'transferred' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {session.status === 'active' ? '活跃' : session.status === 'transferred' ? '已转接' : '已关闭'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">最后消息: {session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleString() : '无'}</p>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleTransfer(session); }} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm transition">转接</button>
                  <button onClick={(e) => { e.stopPropagation(); handleClose(session); }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm transition">关闭</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">会话详情</h2>
              <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {Array.isArray(selectedSession.messages) && selectedSession.messages.length > 0 ? selectedSession.messages.map((msg: any, idx: number) => (
                <div key={idx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-100 mr-8'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs text-gray-400">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                </div>
              )) : <p className="text-gray-500">无消息记录</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
