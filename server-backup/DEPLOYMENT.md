# Zeabur 部署指南

## 问题诊断

之前的构建错误 `dockerfile parse error on line 1: unknown instruction: Dockerfile` 是因为在 Zeabur 配置界面的"Dockerfile"输入框中填写了文本 "Dockerfile"，Zeabur 将其当作 Dockerfile 指令解析而非文件名。

## 正确的 Zeabur 配置步骤

### 1. 服务配置（关键！）

在 Zeabur 服务配置页面：

- **构建命令**：留空（不填）
- **启动命令**：留空（不填）
- **Dockerfile**：**留空（不填）** ← 这是关键！

让 Zeabur 自动检测 `server/Dockerfile` 文件。

### 2. 添加 PostgreSQL 数据库

1. 点击"添加服务" → 选择"PostgreSQL"
2. 等待数据库初始化完成
3. 复制数据库连接字符串（DATABASE_URL）

### 3. 配置环境变量

在服务的环境变量中添加：

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# 应用配置
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*

# 邮件通知（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
ADMIN_EMAIL=admin@example.com
```

### 4. 执行数据库迁移

部署成功后，打开 Zeabur Terminal：

```bash
cd server
npx prisma migrate deploy
```

### 5. 验证部署

访问健康检查端点：
```
https://your-app.zeabur.app/health
```

应返回：`{"status":"ok","timestamp":"..."}`

## 常见问题

### Q: 构建失败，提示找不到 Dockerfile？
A: 确保 Dockerfile 字段留空，不要填写任何内容。Zeabur 会自动检测 `server/Dockerfile`。

### Q: 运行时提示数据库连接失败？
A: 检查 DATABASE_URL 环境变量是否正确配置，并确保已添加 PostgreSQL 服务。

### Q: 图片上传后重启丢失？
A: 本地 uploads 目录在容器重启后会清空。生产环境建议集成云存储（阿里云 OSS / 七牛云）。

### Q: 邮件发送失败？
A: 检查 SMTP 配置是否正确，特别是 SMTP_HOST、SMTP_USER、SMTP_PASS。

## 项目结构

```
server/
├── Dockerfile              # 多阶段构建配置
├── package.json            # 依赖和脚本
├── prisma/
│   ── schema.prisma       # 数据库模型
├── src/
│   ├── index.ts            # Express 应用入口
│   ├── routes/             # API 路由
│   │   ├── products.ts     # 产品管理
│   │   ├── news.ts         # 新闻资讯
│   │   ├── forms.ts        # 表单提交 + 邮件通知
│   │   ├── chat.ts         # 客服机器人
│   │   ├── admin.ts        # 后台管理
│   │   └── upload.ts       # 图片上传
│   └── utils/
│       ├── email.ts        # 邮件服务
│       ├── websocket.ts    # WebSocket 服务
│       └── logger.ts       # 日志工具
└── .env.example            # 环境变量模板
```

## 技术栈

- **框架**: Express.js + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **文件上传**: Multer
- **邮件**: Nodemailer (SMTP)
- **实时通信**: WebSocket (ws)
- **日志**: Winston
- **验证**: Zod
- **安全**: Helmet, CORS, Rate Limiting
