import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchForms, 
  updateFormStatus,
  deleteForm,
  logoutUser,
  isAuthenticated,
  FormSubmission 
} from '../services/api';

const AdminForms: React.FC = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadSubmissions();
  }, [navigate]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetchForms({ limit: 100 });
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      if ((error as any).message?.includes('Unauthorized')) {
        logoutUser();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateFormStatus(id, status);
      loadSubmissions();
      if (selectedForm?.id === id) {
        setSelectedForm({ ...selectedForm, status } as FormSubmission);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条表单记录吗？')) return;
    try {
      await deleteForm(id);
      loadSubmissions();
      if (selectedForm?.id === id) {
        setSelectedForm(null);
      }
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('删除失败');
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterType !== 'all' && s.formType !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">表单提交管理</h1>
          <div className="flex gap-4">
            <a
              href="#/admin/chat"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              客服工作台
            </a>
            <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition">退出登录</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">所有类型</option>
            <option value="contact">联系表单</option>
            <option value="inquiry">询价表单</option>
            <option value="feedback">反馈表单</option>
            <option value="message">留言表单</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">所有状态</option>
            <option value="pending">待处理</option>
            <option value="processed">已处理</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无表单提交</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提交时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{s.formType}</td>
                    <td className="px-6 py-4">{new Date(s.createdAt).toLocaleString('zh-CN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : s.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.status === 'pending' ? '待处理' : s.status === 'processed' ? '已处理' : '已归档'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedForm(s)} className="text-blue-600 hover:text-blue-800 mr-3">查看</button>
                      {s.status === 'pending' && <button onClick={() => updateStatus(s.id, 'processed')} className="text-green-600 hover:text-green-800 mr-3">标记已处理</button>}
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">表单详情</h2>
              <button onClick={() => setSelectedForm(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div><strong>类型：</strong>{selectedForm.formType}</div>
              <div><strong>提交时间：</strong>{new Date(selectedForm.createdAt).toLocaleString('zh-CN')}</div>
              <div><strong>IP地址：</strong>{selectedForm.ipAddress || '未知'}</div>
              <div><strong>状态：</strong>
                <select value={selectedForm.status} onChange={(e) => updateStatus(selectedForm.id, e.target.value)} className="ml-2 px-2 py-1 border rounded">
                  <option value="pending">待处理</option>
                  <option value="processed">已处理</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <strong>表单数据：</strong>
                <pre className="mt-2 text-sm overflow-x-auto">{JSON.stringify(selectedForm.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
