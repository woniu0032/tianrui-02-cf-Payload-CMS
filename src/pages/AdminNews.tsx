import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNews, 
  createNews, 
  updateNews, 
  deleteNews,
  logoutUser,
  isAuthenticated,
  News 
} from '../services/api';

const AdminNews: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    author: '',
    category: '',
    tags: [] as string[],
    isPublished: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadNews();
  }, [navigate]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetchNews({ limit: 100 });
      setNewsList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      if ((error as any).message?.includes('Unauthorized')) {
        logoutUser();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      author: '',
      category: '',
      tags: [],
      isPublished: false,
    });
    setShowForm(true);
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      summary: news.summary || '',
      content: typeof news.content === 'string' ? news.content : JSON.stringify(news.content || ''),
      coverImage: news.coverImage?.url || '',
      author: news.author || '',
      category: news.category,
      tags: news.tags?.map((t: any) => typeof t === 'string' ? t : t.tag) || [],
      isPublished: news.isPublished,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newsData = {
        ...formData,
        tags: formData.tags.map(tag => ({ tag })),
        coverImage: formData.coverImage || undefined,
      };

      if (editingNews) {
        await updateNews(editingNews.id, newsData);
        alert('新闻更新成功');
      } else {
        await createNews(newsData);
        alert('新闻创建成功');
      }
      setShowForm(false);
      loadNews();
    } catch (error) {
      console.error('Failed to save news:', error);
      alert('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条新闻吗？')) return;
    try {
      await deleteNews(id);
      alert('已删除');
      loadNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('删除失败');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">新闻管理</h1>
          <div className="flex gap-4">
            <a
              href="#/admin/chat"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              客服工作台
            </a>
            <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ 添加新闻</button>
            <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition">退出登录</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {newsList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无新闻</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsList.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {item.coverImage?.url ? (
                    <img src={item.coverImage.url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">无封面</div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.summary}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isPublished ? '已发布' : '草稿'}
                  </span>
                  <span className="text-gray-400">{item.viewCount} 次浏览</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEdit(item)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition text-sm">编辑</button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition text-sm">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingNews ? '编辑新闻' : '添加新闻'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">摘要</label><textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">内容（富文本）</label><textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={6} placeholder="支持HTML格式" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">封面图URL</label><input type="text" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label><input type="text" value={formData.tags.join(',')} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').filter(Boolean) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">作者</label><input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div className="flex items-center"><input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="mr-2" /><label htmlFor="isPublished" className="text-sm font-medium text-gray-700">立即发布</label></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">取消</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
