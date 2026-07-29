# Payload CMS 迁移计划

## 项目现状分析

### 当前技术栈
- **前端**: React 18 + TypeScript + Webpack + Tailwind CSS
- **后端**: Express.js + Prisma + PostgreSQL
- **部署**: Zeabur 云平台

### 现有数据模型
1. **Product** - 产品管理（名称、描述、价格、分类、图片、内容、布局等）
2. **News** - 新闻资讯（标题、摘要、内容、封面图、作者、分类、标签等）
3. **FormSubmission** - 表单提交（类型、数据、状态、IP等）
4. **ChatSession** - 客服对话（会话ID、消息、状态等）

### 现有 API 端点
- `/api/products` - 产品 CRUD
- `/api/news` - 新闻 CRUD
- `/api/forms` - 表单提交
- `/api/chat` - 客服对话
- `/api/admin` - 管理面板
- `/api/upload` - 文件上传

## Payload CMS 迁移方案

### 阶段一：Payload CMS 后端搭建

1. **创建 Payload CMS 项目结构**
   - 在 `server/` 目录下初始化 Payload CMS
   - 配置数据库连接（复用现有 PostgreSQL）
   - 设置认证系统

2. **定义 Payload Collections**
   - `Products` - 产品集合
   - `News` - 新闻集合
   - `FormSubmissions` - 表单提交集合
   - `ChatSessions` - 客服会话集合
   - `Users` - 管理员用户集合
   - `Media` - 文件上传集合

3. **配置 Payload 选项**
   - 数据库配置
   - 服务器端口（8080）
   - CORS 设置
   - 认证策略
   - 文件上传配置

### 阶段二：前端 API 适配

1. **更新 API 服务层**
   - 修改 `src/services/api.ts` 适配 Payload REST API 格式
   - 处理认证令牌（JWT）
   - 适配新的响应数据结构

2. **更新管理后台页面**
   - `AdminLogin.tsx` - 使用 Payload 认证
   - `AdminProducts.tsx` - 适配新的产品 API
   - `AdminNews.tsx` - 适配新的新闻 API
   - `AdminForms.tsx` - 适配新的表单 API
   - `AdminChat.tsx` - 适配新的客服 API

3. **更新前端展示页面**
   - `Products.tsx` - 从 Payload 获取产品数据
   - `ProductDetail.tsx` - 从 Payload 获取产品详情
   - `News.tsx` - 从 Payload 获取新闻列表
   - 其他表单提交页面

### 阶段三：数据迁移

1. **创建数据迁移脚本**
   - 从 Prisma 导出现有数据
   - 转换为 Payload 格式
   - 导入到 Payload 数据库

2. **验证数据完整性**
   - 检查所有记录是否正确迁移
   - 验证文件上传路径

### 阶段四：测试与部署

1. **功能测试**
   - 用户登录/登出
   - 产品 CRUD
   - 新闻 CRUD
   - 表单提交
   - 客服对话
   - 文件上传

2. **部署配置**
   - 更新 Dockerfile
   - 更新 docker-compose.yml
   - 配置环境变量

## 详细实施步骤

### 1. Payload CMS 项目初始化

```bash
# 在 server 目录下创建 Payload 项目
cd server
# 保留现有 uploads 目录
# 创建新的 Payload 结构
```

### 2. Collections 定义

**Products Collection:**
```typescript
{
  slug: 'products',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'number' },
    { name: 'category', type: 'text' },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    { name: 'content', type: 'json' },
    { name: 'layout', type: 'json' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ]
}
```

**News Collection:**
```typescript
{
  slug: 'news',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'content', type: 'json' },
    { name: 'layout', type: 'json' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'isPublished', type: 'checkbox', defaultValue: false },
    { name: 'publishedAt', type: 'date' },
    { name: 'viewCount', type: 'number', defaultValue: 0 },
  ]
}
```

**FormSubmissions Collection:**
```typescript
{
  slug: 'form-submissions',
  fields: [
    { name: 'formType', type: 'text', required: true },
    { name: 'data', type: 'json' },
    { name: 'status', type: 'select', options: ['pending', 'processed', 'archived'], defaultValue: 'pending' },
    { name: 'ipAddress', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ]
}
```

**ChatSessions Collection:**
```typescript
{
  slug: 'chat-sessions',
  fields: [
    { name: 'sessionId', type: 'text', required: true, unique: true },
    { name: 'userId', type: 'text' },
    { name: 'messages', type: 'json' },
    { name: 'status', type: 'select', options: ['active', 'closed', 'transferred'], defaultValue: 'active' },
    { name: 'metadata', type: 'json' },
    { name: 'lastMessageAt', type: 'date' },
  ]
}
```

### 3. API 适配映射

| 原端点 | Payload 端点 | 说明 |
|--------|-------------|------|
| GET /api/products | GET /api/products | 产品列表 |
| GET /api/products/:id | GET /api/products/:id | 单个产品 |
| POST /api/products | POST /api/products | 创建产品 |
| PUT /api/products/:id | PATCH /api/products/:id | 更新产品 |
| DELETE /api/products/:id | DELETE /api/products/:id | 删除产品 |
| GET /api/news | GET /api/news | 新闻列表 |
| POST /api/forms/submit | POST /api/form-submissions | 表单提交 |
| POST /api/chat/sessions | POST /api/chat-sessions | 创建会话 |

### 4. 认证适配

Payload 使用 JWT 认证，需要更新前端：
- 登录时调用 `/api/users/login`
- 存储返回的 token
- 请求时添加 `Authorization: Bearer <token>` 头

## 风险与注意事项

1. **数据兼容性**: Payload 使用不同的数据格式，需要仔细映射字段
2. **文件上传**: Payload 的媒体管理需要重新配置
3. **WebSocket**: 客服实时对话需要单独处理（Payload 不内置 WebSocket）
4. **自定义逻辑**: 邮件通知、统计等需要重新实现

## 预期结果

迁移完成后：
- 后端使用 Payload CMS 标准结构
- 前端保持原有视觉样式和功能
- 所有 CRUD 功能正常工作
- 管理后台使用 Payload 自带的管理界面或保持自定义界面
