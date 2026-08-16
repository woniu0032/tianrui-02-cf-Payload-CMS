// API 服务工具 - 用于与 Payload CMS 后端通信
// 生产环境使用境外云服务器地址，开发环境使用 localhost
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.VITE_API_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://api.hyfsad.com');

// 获取存储的 token
const getToken = () => localStorage.getItem('admin_token');

// 通用请求头
export const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: { image: { url: string; id: string }; sortOrder: number }[] | null;
  content?: any;
  layout?: any;
  attributes?: {
    specifications?: { label: string; value: string }[];
    materials?: { item: string }[];
    colors?: { item: string }[];
    features?: { item: string }[];
    techParams?: { label: string; value: string }[];
    applications?: { item: string }[];
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content?: any;
  layout?: any;
  coverImage: { url: string; id: string } | null;
  author: string;
  category: string;
  tags: { tag: string }[] | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formType: string;
  data: any;
  status: 'pending' | 'processed' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  userId?: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: string }[];
  status: 'active' | 'closed' | 'transferred';
  metadata?: any;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payload 响应格式转换
const transformPayloadResponse = (doc: any): any => {
  if (!doc) return null;
  return {
    ...doc,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  };
};

// 获取产品列表
export const fetchProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  // depth=2 让 images 关联的 media 返回完整对象（含 url），否则只返回 ID
  queryParams.set('depth', '2');
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.category) queryParams.set('where[category][equals]', params.category);
  if (params?.isActive !== undefined) queryParams.set('where[isActive][equals]', params.isActive.toString());
  if (params?.search) {
    queryParams.set('where[name][contains]', params.search);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/products?${queryParams}`, {
      headers: getHeaders(false),
    });
    if (!response.ok) {
      console.warn('Products API not available, using default data');
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
    const data = await response.json();
    return {
      data: data.docs.map(transformPayloadResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.totalDocs,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.warn('Products API request failed, using default data');
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

// 获取单个产品
export const fetchProductById = async (id: string) => {
  // depth=2 让 content(richText) 和 layout(blocks) 中的 media 关联返回完整对象
  const response = await fetch(`${API_BASE_URL}/api/products/${id}?depth=2`, {
    headers: getHeaders(false),
  });
  if (!response.ok) throw new Error('Failed to fetch product');
  const data = await response.json();
  return transformPayloadResponse(data);
};

// 创建产品
export const createProduct = async (productData: Partial<Product>) => {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 更新产品
export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 删除产品
export const deleteProduct = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }
  return true;
};

// 获取新闻列表
export const fetchNews = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  isPublished?: boolean;
  search?: string;
  tag?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('where[category][equals]', params.category);
    if (params?.isPublished !== undefined) queryParams.set('where[isPublished][equals]', params.isPublished.toString());
    if (params?.search) {
      queryParams.set('where[title][contains]', params.search);
    }

    const response = await fetch(`${API_BASE_URL}/api/news?${queryParams}`, {
      headers: getHeaders(false),
    });
    if (!response.ok) {
      console.warn('News API not available, using default data');
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
    const data = await response.json();
    return {
      data: data.docs.map(transformPayloadResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.totalDocs,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.warn('News API request failed, using default data');
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

// 获取单篇新闻
export const fetchNewsById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
    headers: getHeaders(false),
  });
  if (!response.ok) throw new Error('Failed to fetch news');
  const data = await response.json();
  return transformPayloadResponse(data);
};

// 创建新闻
export const createNews = async (newsData: Partial<News>) => {
  const response = await fetch(`${API_BASE_URL}/api/news`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(newsData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create news');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 更新新闻
export const updateNews = async (id: string, newsData: Partial<News>) => {
  const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(newsData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update news');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 删除新闻
export const deleteNews = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete news');
  }
  return true;
};

// 提交表单
export const submitForm = async (formData: { formType: string; data: any }) => {
  const response = await fetch(`${API_BASE_URL}/api/form-submissions`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit form');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 获取表单列表
export const fetchForms = async (params?: {
  page?: number;
  limit?: number;
  formType?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.formType) queryParams.set('where[formType][equals]', params.formType);
  if (params?.status) queryParams.set('where[status][equals]', params.status);

  const response = await fetch(`${API_BASE_URL}/api/form-submissions?${queryParams}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch forms');
  const data = await response.json();
  return {
    data: data.docs.map(transformPayloadResponse),
    pagination: {
      page: data.page,
      limit: data.limit,
      total: data.totalDocs,
      totalPages: data.totalPages,
    },
  };
};

// 更新表单状态
export const updateFormStatus = async (id: string, status: string, notes?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/form-submissions/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update form status');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 删除表单
export const deleteForm = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/form-submissions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete form');
  }
  return true;
};

// 创建聊天会话
export const createChatSession = async (sessionId: string, userId?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat-sessions`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ sessionId, userId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || error.message || 'Failed to create chat session');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 获取聊天会话
export const fetchChatSession = async (sessionId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat-sessions?where[sessionId][equals]=${sessionId}`, {
    headers: getHeaders(false),
  });
  if (!response.ok) throw new Error('Failed to fetch chat session');
  const data = await response.json();
  return data.docs.length > 0 ? transformPayloadResponse(data.docs[0]) : null;
};

// 更新聊天会话
export const updateChatSession = async (id: string, sessionData: Partial<ChatSession>) => {
  const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(sessionData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update chat session');
  }
  const data = await response.json();
  return transformPayloadResponse(data.doc);
};

// 获取所有聊天会话
export const fetchChatSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('where[status][equals]', params.status);

  const response = await fetch(`${API_BASE_URL}/api/chat-sessions?${queryParams}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch chat sessions');
  const data = await response.json();
  return {
    data: data.docs.map(transformPayloadResponse),
    pagination: {
      page: data.page,
      limit: data.limit,
      total: data.totalDocs,
      totalPages: data.totalPages,
    },
  };
};

// 上传图片
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken() || ''}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.doc;
};

// 上传多张图片
export const uploadImages = async (files: File[]) => {
  const results = [];
  for (const file of files) {
    const result = await uploadImage(file);
    results.push(result);
  }
  return results;
};

// 删除图片
export const deleteImage = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete failed');
  }

  return true;
};

// 用户登录
export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
  }
  return data;
};

// 用户登出
export const logoutUser = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

// 获取当前用户
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('admin_user');
  return userStr ? JSON.parse(userStr) : null;
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('admin_token');
};

// 获取仪表盘统计数据
export const fetchDashboardStats = async () => {
  const [products, news, forms, sessions] = await Promise.all([
    fetch(`${API_BASE_URL}/api/products?limit=1`, { headers: getHeaders() }).then(r => r.json()),
    fetch(`${API_BASE_URL}/api/news?limit=1`, { headers: getHeaders() }).then(r => r.json()),
    fetch(`${API_BASE_URL}/api/form-submissions?limit=1`, { headers: getHeaders() }).then(r => r.json()),
    fetch(`${API_BASE_URL}/api/chat-sessions?limit=1`, { headers: getHeaders() }).then(r => r.json()),
  ]);

  return {
    products: { total: products.totalDocs, active: products.totalDocs },
    news: { total: news.totalDocs, published: news.totalDocs },
    forms: { total: forms.totalDocs, pending: forms.totalDocs },
    chat: { total: sessions.totalDocs, active: sessions.totalDocs },
  };
};
