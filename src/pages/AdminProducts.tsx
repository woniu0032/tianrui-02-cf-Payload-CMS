import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductImageUploader } from '../components/ProductImageUploader';
import { ProductAttributes, ProductAttributesData } from '../components/ProductAttributes';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  logoutUser,
  isAuthenticated,
  Product 
} from '../services/api';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  attributes: ProductAttributesData;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    isActive: true,
    sortOrder: 0,
    attributes: {
      specifications: [],
      materials: [],
      colors: [],
      features: [],
      techParams: [],
      applications: []
    }
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts({ limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if ((error as any).message?.includes('Unauthorized')) {
        logoutUser();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      isActive: true,
      sortOrder: 0,
      attributes: {
        specifications: [],
        materials: [],
        colors: [],
        features: [],
        techParams: [],
        applications: []
      }
    });
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      category: product.category,
      images: product.images?.map((img: any) => 
        typeof img === 'string' ? img : img.image?.url
      ) || [],
      isActive: product.isActive,
      sortOrder: product.sortOrder || 0,
      attributes: product.attributes || {
        specifications: [],
        materials: [],
        colors: [],
        features: [],
        techParams: [],
        applications: []
      }
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        images: formData.images.map((url, index) => ({
          image: url,
          sortOrder: index
        }))
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('产品更新成功');
      } else {
        await createProduct(productData);
        alert('产品创建成功');
      }
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('操作失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;

    try {
      await deleteProduct(id);
      alert('产品已删除');
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('删除失败');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
          <div className="flex gap-4">
            <a
              href="#/admin/chat"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              客服工作台
            </a>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + 添加产品
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无产品，点击"添加产品"开始创建</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={typeof product.images[0] === 'string' 
                        ? product.images[0] 
                        : product.images[0].image?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      无图片
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">¥{product.price}</span>
                  <span className={`text-xs px-2 py-1 rounded ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? '已上架' : '已下架'}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? '编辑产品' : '添加产品'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">立即上架</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品图片</label>
                <ProductImageUploader
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品参数配置</label>
                <ProductAttributes
                  data={formData.attributes}
                  onChange={(attributes) => setFormData({ ...formData, attributes })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
