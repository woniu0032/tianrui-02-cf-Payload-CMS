按# AGENTS.md - Tianrui Textile Payload CMS Migration

## Dependencies

### Backend (Payload CMS v3, 部署在香港服务器 149.30.230.99，SSH 端口 27822；旧服务器 47.80.28.104 已弃用)
- `payload` / `@payloadcms/db-postgres` / `@payloadcms/richtext-lexical` / `@payloadcms/payload-cloud`
- `@payloadcms/next` + `next` 16.2.12 — **v3 admin 面板与 API 的运行载体**
- `sharp` 0.32.6 — 图片处理；`uuid` — 聊天会话 ID

### Frontend (Cloudflare Pages)
- react / react-router-dom / framer-motion / lucide-react / recharts

## Architecture

- **前端**：Cloudflare Pages（`src/` 这套 React+Webpack，Hash 路由），调用 `https://api.hyfsad.com` 取数据
- **后端**：境外服务器 PM2 跑 Payload CMS，Nginx 80→8080，Cloudflare Flexible SSL
- **后端运行模型**：Next.js 自定义服务器（`src/server.ts`）+ App Router 路由文件（`src/app/(payload)/...`），admin 与 REST/GraphQL API 同进程
- 数据集合：users / media / products / news / form-submissions / chat-sessions
- API 响应格式：`{ docs, totalDocs, page, totalPages }`；登录 `POST /api/users/login` 拿 JWT

## Patterns / Constraints

- 后端端口 8080；admin 登录 `admin@tianrui.com` / `admin123`
- 生产 `PAYLOAD_PUBLIC_SERVER_URL=https://api.hyfsad.com` 必须配，否则 admin cookie/链接域名错
- 前端引用上传文件一律用 `.assets_mapping` 的 CDN_URL，禁止本地路径
- 产品页 11 个一级分类，阻燃/三防/弹力带二级 subMenu；后台产品 `category` 填二级分类名（芳纶、后整理阻燃、防水面料、防油面料、易去污面料、T400面料、氨纶面料），前端按 category 分组匹配

## What Didn't Work

- ❌ Express + `payload.init({ express })` 跑 admin → v3 admin 是 Next.js 渲染，Express 只挂 `/api`，`/admin` 永远 404。改用 Next.js 自定义服务器 + `@payloadcms/next` 路由
- ❌ `payload start` / `payload build` 命令 → v3 不存在；scripts 用 `next build` / `next start`
- ❌ PostgreSQL `select` 字段建枚举冲突 → 全改 `text`
- ❌ `push: true` 在 `next start` 生产模式不自动建表 → 空库初始化须用 `npx payload migrate:create init` + `npx payload migrate`
- ❌ 字段类型变更后直接 `migrate:create` 可能生成 DROP COLUMN 破坏数据 → 涉及 json→blocks 等结构性变更时，手写迁移文件（CREATE TABLE + INSERT SELECT + UPDATE），`content` json→richText 底层仍为 jsonb 列无需 DDL
- ❌ `npx payload db:push` → v3 无此命令；`migrate --force` 无 migration 目录时无输出
- ❌ Next.js 16 Turbopack + 项目根有 `package.json`/`pnpm-lock.yaml` → workspace root 误判，`turbopack.root`/`outputFileTracingRoot` 均无效 → 删除根目录 lockfile + 手动 API route 文件后构建通过
- ❌ 手动创建 `api/[...slug]/route.ts` 等路由文件 → Payload v3.86.0 的 `@payloadcms/next/routes` 不再导出 `restHandler`/`graphQLHandler`，由 `withPayload` 自动挂载 → 删除手动路由文件
- ❌ `payload.config.ts` 的 `meta.favicon`/`meta.ogImage` → v3.86.0 `MetaConfig` 类型不含这两个字段，TS 编译报错 → 只保留 `titleSuffix`

## Lessons

- Payload v3 admin 必须 Next.js 承载，纯 Express 无 admin 路由（这是 `/admin` 404 的根因）
- Next.js 模式需 `payload generate:importmap`，否则 admin 组件映射缺失
- 沙箱 Write/Edit 若返回超时，文件可能未落盘，必须 Read 复核真实状态再交付
- 后端 `next build` 须在境外服务器跑（沙箱无其 PostgreSQL 连接）
- 架构迁移（Express→Next.js）不丢数据：数据在 PostgreSQL，`.env`/uploads 被 gitignore，`push:true` 只补表结构不清数据；只需更新代码+改 PM2 启动方式（`payload serve`→`next start`）
- 部署走「国内 push GitHub（增量，勿删库）+ 境外服务器 `update-deploy.sh` 拉取」；服务器直连 GitHub 比国内 push 稳
- `package.json` 的 next 版本须与 `pnpm-lock.yaml` 实际解析一致（lockfile 解析到 next@16.2.12，写 `^15` 会导致服务器 `pnpm install` 重装/版本漂移）
- `.env` 里 CORS 变量名是复数 `CORS_ORIGINS`/`CSRF_ORIGINS`（payload.config.ts 按此读取），写成单数 `CORS_ORIGIN` 不生效
- 境外服务器 1.6GB 内存无 swap 时 `next build` 会 OOM 卡死；加 4GB swap 后构建约 103s 完成
- Payload v3.86.0 的 API 路由由 `withPayload` 自动挂载，不要手动创建 `api/[...slug]/route.ts` 等文件
- `next.config.js` 只需 `withPayload({})` 即可，无需 `turbopack.root`/`outputFileTracingRoot`（删除根目录 lockfile 后 workspace 检测不再误判）
- `.env` 不在 git 中，服务器首次部署需手动创建；DB 用户 `tianrui_user`，库 `tianrui_payload`
- PM2 启动命令需带 `PORT=8080`：`PORT=8080 pm2 start pnpm --name tianrui-payload -- start`，否则默认监听 3000
- 空库创建首个用户用 `POST /api/users/first-register`，默认 role=editor，需 SQL `UPDATE users SET role='admin'` 提权
- Cloudflare 代理（橙云）下 ping 域名返回 CF 边缘 IP 属正常；admin 浏览器登录须 https，Cloudflare 需开「Always Use HTTPS」，否则会话 Cookie 被浏览器丢弃、登录后跳回登录页
- 新服务器（4核8G）一键部署脚本 `server/auto-deploy.sh`；空库初始化顺序：migrate:create → migrate → first-register → SQL 提权
- 沙箱无法访问外部 API（api.hyfsad.com 超时），产品页在沙箱显示空态属预期；验证前端逻辑用临时测试数据注入 state，正式环境（Cloudflare Pages）可正常取数
- 前端是 Hash 路由，浏览器截图/直链须用 `/#/products` 形式，`/products` 会落回首页
