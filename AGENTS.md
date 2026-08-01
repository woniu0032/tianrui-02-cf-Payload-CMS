# AGENTS.md - Tianrui Textile Payload CMS Migration

## Dependencies

### Backend (Payload CMS v3, 部署在境外服务器 47.80.28.104)
- `payload` / `@payloadcms/db-postgres` / `@payloadcms/richtext-lexical` / `@payloadcms/payload-cloud`
- `@payloadcms/next` + `next` ^15 — **v3 admin 面板与 API 的运行载体**
- `sharp` 0.32.6 — 图片处理；`uuid` — 聊天会话 ID

### Frontend (Cloudflare Pages)
- react / react-router-dom / framer-motion / lucide-react / recharts

## Architecture

- **前端**：Cloudflare Pages（`src/` 这套 React+Webpack），调用 `https://api.hyfsad.com` 取数据
- **后端**：境外服务器 PM2 跑 Payload CMS，Nginx 80→8080，Cloudflare Flexible SSL
- **后端运行模型**：Next.js 自定义服务器（`src/server.ts`）+ App Router 路由文件（`src/app/(payload)/...`），admin 与 REST/GraphQL API 同进程
- 数据集合：users / media / products / news / form-submissions / chat-sessions
- API 响应格式：`{ docs, totalDocs, page, totalPages }`；登录 `POST /api/users/login` 拿 JWT

## Patterns / Constraints

- 后端端口 8080；admin 登录 `admin@tianrui.com` / `admin123`
- 生产 `PAYLOAD_PUBLIC_SERVER_URL=https://api.hyfsad.com` 必须配，否则 admin cookie/链接域名错
- 前端引用上传文件一律用 `.assets_mapping` 的 CDN_URL，禁止本地路径

## What Didn't Work

- ❌ Express + `payload.init({ express })` 跑 admin → v3 admin 是 Next.js 渲染，Express 只挂 `/api`，`/admin` 永远 404。改用 Next.js 自定义服务器 + `@payloadcms/next` 路由
- ❌ `payload start` / `payload build` 命令 → v3 不存在；scripts 用 `next build` / `next start`
- ❌ PostgreSQL `select` 字段建枚举冲突 → 全改 `text`
- ❌ `push: false` 不建表 → 首次用 `push: true`

## Lessons

- Payload v3 admin 必须 Next.js 承载，纯 Express 无 admin 路由（这是 `/admin` 404 的根因）
- Next.js 模式需 `payload generate:importmap`，否则 admin 组件映射缺失
- 沙箱 Write/Edit 若返回超时，文件可能未落盘，必须 Read 复核真实状态再交付
- 后端 `next build` 须在境外服务器跑（沙箱无其 PostgreSQL 连接）
- 架构迁移（Express→Next.js）不丢数据：数据在 PostgreSQL，`.env`/uploads 被 gitignore，`push:true` 只补表结构不清数据；只需更新代码+改 PM2 启动方式（`payload serve`→`next start`）
- 部署走「国内 push GitHub（增量，勿删库）+ 境外服务器 `update-deploy.sh` 拉取」；服务器直连 GitHub 比国内 push 稳
- `package.json` 的 next 版本须与 `pnpm-lock.yaml` 实际解析一致（lockfile 解析到 next@16.2.12，写 `^15` 会导致服务器 `pnpm install` 重装/版本漂移）
- `.env` 里 CORS 变量名是复数 `CORS_ORIGINS`/`CSRF_ORIGINS`（payload.config.ts 按此读取），写成单数 `CORS_ORIGIN` 不生效
