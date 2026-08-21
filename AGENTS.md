# AGENTS.md - Tianrui Textile Chat Interface Enhancement

## Dependencies

### Frontend (React + Webpack)
- `react` / `react-router-dom` — 路由与组件框架
- `framer-motion` — 动画效果
- `lucide-react` — 图标库
- `recharts` — 图表组件

## Architecture

- **前端**：Cloudflare Pages（`src/` 这套 React+Webpack，Hash 路由），调用 `https://api.hyfsad.com` 取数据
- **后端**：境外服务器 PM2（systemd 开机自启）跑 Payload CMS v3，Nginx 80→8080，Cloudflare Flexible SSL
- 数据集合：users / media / products / news / form-submissions / chat-sessions
- API 响应格式：`{ docs, totalDocs, page, totalPages }`；登录 `POST /api/users/login` 拿 JWT

## Patterns / Constraints

- 后端端口 8080；admin 登录 `admin@tianrui.com` / `admin123`
- 生产 `PAYLOAD_PUBLIC_SERVER_URL=https://api.hyfsad.com` 必须配，否则 admin cookie/链接域名错
- 前端引用上传文件一律用 `.assets_mapping` 的 CDN_URL，禁止本地路径
- 产品页 11 个一级分类，阻燃/三防/弹力带二级 subMenu；后台产品 `category` 填二级分类名（芳纶、后整理阻燃、防水面料、防油面料、易去污面料、T400面料、氨纶面料），前端按 category 分组匹配
- 客服工作台页面 `/admin/chat` 支持全局会话列表面板嵌入聊天窗口顶部，可折叠切换
- 首页二级菜单点击跳转需通过 URL 参数传递分类信息（`/products?category=xxx`），产品页面从 URL 读取并自动选中对应分类
- Payload CMS v3 自动将 camelCase 字段名转为 snake_case 数据库列名（如 `titleEn` → `title_en`），手写迁移文件必须用 snake_case 列名，否则 API 查询会报 "Something went wrong"
- 服务器 psql 用 Unix socket 连接时 peer 认证失败，需用 Node.js + pg 模块通过 `DATABASE_URL` 连接；`dotenv` 未安装时用 `DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d'=' -f2-) node -e "..."` 方式传入
- 服务器 `package.json` 含 `"type": "module"`，独立 Node.js 脚本必须用 `.cjs` 扩展名才能使用 `require()` 语法；gallery block 的 `caption` 字段必须用 `text` 类型而非 `varchar(255)`，否则长文本插入会报 `value too long` 错误
- LanguageContext 语言状态必须持久化到 localStorage，否则页面刷新后语言重置为中文，导致双语切换失效

## What Didn't Work

- ❌ Express + `payload.init({ express })` 跑 admin → v3 admin 是 Next.js 渲染，Express 只挂 `/api`，`/admin` 永远 404。改用 Next.js 自定义服务器 + `@payloadcms/next` 路由
- ❌ `payload start` / `payload build` 命令 → v3 不存在；scripts 用 `next build` / `next start`
- ❌ PostgreSQL `select` 字段建枚举冲突 → 全改 `text`
- ❌ `push: true` 在 `next start` 生产模式不自动建表 → 空库初始化须用 `npx payload migrate:create init` + `npx payload migrate`
- ❌ 字段类型变更后直接 `migrate:create` 可能生成 DROP COLUMN 破坏数据 → 涉及 json→blocks 等结构性变更时，手写迁移文件（CREATE TABLE + INSERT SELECT + UPDATE），`content` json→richText 底层仍为 jsonb 列无需 DDL
- ❌ `npx payload db:push` → v3 无此命令；`migrate --force` 无 migration 目录时无输出
- ❌ Next.js 16 Turbopack + 项目根有 `package.json`/`pnpm-lock.yaml` → workspace root 误判，`turbopack.root`/`outputFileTracingRoot` 均无效 → 删除根目录 lockfile + 手动 API route 文件后构建通过
- ❌ Next.js 16 + Payload CMS v3.86.0 → Admin 详情页全部空白（Server Action Reference ID 格式不兼容，`Received "x"` 错误），列表页正常但编辑页 hydration 崩溃 → 降级 Next.js 到 15.3.3 修复
- ❌ 新增 Payload 集合后 `payload_locked_documents_rels` 表缺少对应 `xxx_id` 列 → Document Locking 查询失败导致 Admin 详情页 SSR 报错 → 需手动写迁移 `ALTER TABLE payload_locked_documents_rels ADD COLUMN xxx_id integer`
- ❌ 手动创建 `api/[...slug]/route.ts` 等路由文件 → Payload v3.86.0 的 `@payloadcms/next/routes` 不再导出 `restHandler`/`graphQLHandler`，由 `withPayload` 自动挂载 → 删除手动路由文件
-  `payload.config.ts` 的 `meta.favicon`/`meta.ogImage` → v3.86.0 `MetaConfig` 类型不含这两个字段，TS 编译报错 → 只保留 `titleSuffix`
- ❌ 数据映射阶段使用 `itemEn: c.itemEn || c.item || ''` 导致英文字段被中文值预填充，渲染时 fallback 逻辑失效 → 改为 `itemEn: c.itemEn || ''`

## Lessons

- Payload v3 admin 必须 Next.js 承载，纯 Express 无 admin 路由（这是 `/admin` 404 的根因）
- Next.js 模式需 `payload generate:importmap`，否则 admin 组件映射缺失
- 沙箱 Write/Edit 若返回超时，文件可能未落盘，必须 Read 复核真实状态再交付
- 后端 `next build` 须在境外服务器跑（沙箱无其 PostgreSQL 连接）
- 架构迁移（Express→Next.js）不丢数据：数据在 PostgreSQL，`.env`/uploads 被 gitignore，`push:true` 只补表结构不清数据；只需更新代码+改 PM2 启动方式（`payload serve`→`next start`）
- 部署走「国内 push GitHub（增量，勿删库）+ 境外服务器 `update-deploy.sh` 拉取」；服务器直连 GitHub 比国内 push 稳
- Payload CMS v3.88.0 强制要求 Next.js 16（不再兼容 15.x），`pnpm install` 会自动解析为 Next.js 16.2.12
- `.env` 里 CORS 变量名是复数 `CORS_ORIGINS`/`CSRF_ORIGINS`（payload.config.ts 按此读取），写成单数 `CORS_ORIGIN` 不生效
- 境外服务器 1.6GB 内存无 swap 时 `next build` 会 OOM 卡死；加 4GB swap 后构建约 103s 完成
- Payload v3.86.0 的 API 路由由 `withPayload` 自动挂载，不要手动创建 `api/[...slug]/route.ts` 等文件
- `next.config.js` 只需 `withPayload({})` 即可，无需 `turbopack.root`/`outputFileTracingRoot`（删除根目录 lockfile 后 workspace 检测不再误判）
- `.env` 不在 git 中，服务器首次部署需手动创建；DB 用户 `tianrui_user`，库 `tianrui_payload`
- PM2 启动命令需带 `PORT=8080`：`PORT=8080 pm2 start pnpm --name tianrui-payload -- start`，否则默认监听 3000；必须用 `pnpm` 而非 `npx`（npx 在 fork 模式下路径解析不稳定导致反复崩溃）
- `nohup` 启动 Next.js 进程会在 shell 会话断开后退出（SIGHUP），必须用 PM2 守护进程管理；修改 PM2 进程配置后必须重新 `pm2 save` 更新 dump.pm2
- Payload CMS 未配置邮件适配器时，"忘记密码"功能不发邮件（只输出到控制台）；可通过 SQL 直接重置密码：`UPDATE users SET password='$2a$10$...' WHERE email='admin@tianrui.com'`
- 空库创建首个用户用 `POST /api/users/first-register`，默认 role=editor，需 SQL `UPDATE users SET role='admin'` 提权
- Cloudflare 代理（橙云）下 ping 域名返回 CF 边缘 IP 属正常；admin 浏览器登录须 https，Cloudflare 需开「Always Use HTTPS」，否则会话 Cookie 被浏览器丢弃、登录后跳回登录页
- 新服务器（4核8G）一键部署脚本 `server/auto-deploy.sh`；空库初始化顺序：migrate:create → migrate → first-register → SQL 提权
- 沙箱无法访问外部 API（api.hyfsad.com 超时），产品页在沙箱显示空态属预期；验证前端逻辑用临时测试数据注入 state，正式环境（Cloudflare Pages）可正常取数
- 前端是 Hash 路由，浏览器截图/直链须用 `/#/products` 形式，`/products` 会落回首页
- 客服工作台集成式会话列表：在聊天窗口顶部添加可折叠的全局会话列表面板（SessionListPanel），支持搜索、筛选、实时预览和快速切换，提升多任务处理效率
- 首页二级菜单跳转需通过 URL query 参数传递分类（如 `/products?category=芳纶`），产品页面使用 `useSearchParams` 读取并自动触发分类选中
- 双语数据映射禁止在 mapping 阶段做 fallback（如 `itemEn: c.itemEn || c.item`），否则英文字段被中文预填充，渲染时 `isZh ? zh : (en || zh)` 的 fallback 永远取到中文值
- LanguageContext 必须用 localStorage 持久化语言状态，否则页面刷新后语言重置为中文，双语切换失效
- `fetchProductById` 必须用 `data.doc || data` 解包（与 `createProduct`/`updateProduct` 一致），否则当 Payload v3 REST API 返回 `{ doc: {...} }` 格式时，`productData.attributes` 为 undefined，属性数组全部为空；News 的 `fetchNewsById` 同理需检查
