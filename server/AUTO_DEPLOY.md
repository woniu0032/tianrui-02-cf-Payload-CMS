# 天睿纺织后端自动部署指南

> 从 GitHub 自动部署 Payload CMS v3 后端到境外服务器 47.80.28.104

---

## 一、为什么服务器拉 GitHub 比国内 push 稳定

国内 push 到 GitHub 经常超时，根因是**国内 → GitHub 的国际出口带宽不稳定**，尤其在高峰期丢包严重。

而境外服务器（47.80.28.104）直连 GitHub 走的是**服务器所在地 → GitHub 的国际线路**，距离更近、链路更短，`git pull` 几乎不会超时。

所以整个链路的瓶颈只在**国内 push 那一跳**，服务器侧 pull 是可靠的。策略就是：国内想办法把代码推上去（多试几次），服务器拉取和部署交给脚本自动完成。

---

## 二、整体架构与两条自动部署线的关系

```
本地/沙箱改代码
       │
       ▼
git push → GitHub 仓库（国内推送，可能慢/需重试）
       │
       ├──────────────────────────────────┐
       ▼                                  ▼
  ① 前端 src/                        ② 后端 server/
  Cloudflare Pages                   境外服务器 47.80.28.104
  监听 GitHub 自动构建               执行 update-deploy.sh
  push 后几分钟自动上线              git pull → build → pm2 restart
  无需服务器参与                      最终 https://api.hyfsad.com/admin
```

**两条线互不影响：**
- 改前端代码 → push 后 Cloudflare Pages 自动部署，服务器无需任何操作
- 改后端代码 → push 后在服务器跑 `update-deploy.sh` 即可
- 都源自同一个 GitHub 仓库，但部署载体完全不同

---

## 三、前置条件

1. **服务器已是 git 仓库**：`/opt/tianrui-payload/server` 下有 `.git`，`remote origin` 指向 GitHub 仓库

   若服务器还没 clone 过：
   ```bash
   cd /opt/tianrui-payload
   git clone https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git server
   ```
   或者把现有目录关联 remote：
   ```bash
   cd /opt/tianrui-payload/server
   git init
   git remote add origin https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git
   git fetch origin
   git reset --hard origin/main
   ```

2. **服务器已装好运行环境**：Node.js 20、pnpm、PM2

3. **`.env` 文件已配置**（在 `/opt/tianrui-payload/server/.env`）：
   ```
   DATABASE_URL=postgresql://tianrui_user:xxx@localhost:5432/tianrui_payload
   PAYLOAD_SECRET=你的密钥
   PAYLOAD_PUBLIC_SERVER_URL=https://api.hyfsad.com
   PORT=8080
   ```

---

## 四、把沙箱/本地新代码 push 到 GitHub

```bash
# 1. 进入项目根目录
cd /home/project

# 2. 添加 GitHub remote（若已存在会报错，忽略即可）
git remote add github https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git

# 3. 暂存后端改动
git add server/

# 4. 提交
git commit -m "feat: backend migrate to next.js for payload v3 admin"

# 5. 推送到远程 main 分支
#    沙箱当前分支是 onedaybot-dev，推到远程 main：
git push github onedaybot-dev:main

#    如果你本地分支就是 main，则：
#    git push github main
```

**国内 push 超时的应对：**
- 直接重试 2-3 次，通常第二次就能成功
- 换网络环境（手机热点有时比宽带稳）
- 使用 GitHub Personal Access Token 代替密码认证
- 实在不行，把改动打成 patch 文件传到服务器，在服务器上 `git apply`

---

## 五、服务器侧一键更新部署

SSH 登录服务器后执行：

```bash
cd /opt/tianrui-payload/server
bash update-deploy.sh
# 或指定分支：
bash update-deploy.sh main
```

脚本会自动按顺序执行以下步骤：

| 步骤 | 命令 | 解决的问题 |
|------|------|-----------|
| 1 | `git fetch origin main` + `git reset --hard origin/main` | 强制对齐远程代码，避免本地残留改动冲突 |
| 2 | `tar` 备份当前代码 | 失败时可回滚 |
| 3 | 比较新旧 commit | 无更新则跳过构建，节省时间 |
| 4 | `pnpm install` | 安装/更新依赖 |
| 5 | `pnpm payload generate:importmap` | **v3 admin 必需**，生成组件映射表，缺失则 admin 白屏 |
| 6 | `pnpm payload generate:types` | 生成 TypeScript 类型定义 |
| 7 | `NODE_OPTIONS='--max-old-space-size=2048' pnpm build` | 即 `next build`，编译 admin 面板 + API 路由 |
| 8 | `pm2 restart tianrui-payload` | 重启服务加载新构建产物 |
| 9 | `curl` 健康检查 | 验证 `/admin` 和 `/api/users` 是否正常响应 |

任何一步失败，脚本会**自动回滚**到更新前的状态（见第七节）。

---

## 六、验证

```bash
# 1. 检查 admin 页面（应返回 200 或 302，不再是 404）
curl -I http://localhost:8080/admin

# 2. 检查 API（应返回 JSON）
curl http://localhost:8080/api/users

# 3. 查看 PM2 日志确认无报错
pm2 logs tianrui-payload --lines 30
```

浏览器访问 `https://api.hyfsad.com/admin`，使用以下账号登录：
- 邮箱：`admin@tianrui.com`
- 密码：`admin123`

---

## 七、失败回滚办法

### ① 脚本自动回滚

`update-deploy.sh` 在 `pnpm install`、`generate:importmap`、`generate:types`、`next build` 或健康检查失败时，会自动：
- `git reset --hard` 回到更新前的 commit
- 从备份 tar 恢复文件
- 重新 `pnpm install`
- `pm2 restart` 重启服务

服务会回到更新前的可用状态，无需人工干预。

### ② 手动回滚

```bash
cd /opt/tianrui-payload/server

# 查看最近 5 次提交，找到要回退的 commit
git log --oneline -5

# 回退到指定 commit（替换 <旧commit> 为实际 hash）
git reset --hard <旧commit>

# 重装依赖 + 重新构建
pnpm install
NODE_OPTIONS='--max-old-space-size=2048' pnpm build

# 重启服务
pm2 restart tianrui-payload
```

### ③ .next 缓存损坏

如果构建产物异常但代码没问题，清理缓存后重新构建：

```bash
cd /opt/tianrui-payload/server
rm -rf .next node_modules/.cache
NODE_OPTIONS='--max-old-space-size=2048' pnpm build
pm2 restart tianrui-payload
```

---

## 八、可选：push 后服务器自动拉（webhook / 轮询）

### 方案 A：GitHub Webhook

在 GitHub 仓库 Settings → Webhooks 添加一个 webhook，URL 指向服务器的接收端点，push 事件触发后服务器自动执行 `update-deploy.sh`。

**注意：** 接收端点必须验证 webhook secret，防止伪造请求触发部署。secret 不要硬编码在前端代码中。

### 方案 B：Cron 定时轮询（推荐，简单可靠）

脚本已内置「无更新则跳过」逻辑，天然幂等，用 cron 定时跑即可：

```bash
# 编辑 crontab
crontab -e

# 每 5 分钟检查一次（添加以下行）
*/5 * * * * cd /opt/tianrui-payload/server && /usr/bin/bash update-deploy.sh >> /var/log/tianrui-update.log 2>&1
```

查看执行日志：
```bash
tail -f /var/log/tianrui-update.log
```

---

## 九、常见坑

| 坑 | 说明 |
|----|------|
| **`payload serve` 不存在** | 旧 `deploy.sh` / `init-deploy.sh` 里 PM2 用的 `payload serve`，v3 已移除此命令。PM2 必须用 `next start`（即 `pnpm start`），否则进程起不来 |
| **`next build` 内存不足** | 构建 admin 面板内存消耗大，必须加 `NODE_OPTIONS='--max-old-space-size=2048'`，否则 OOM 被 kill |
| **`PAYLOAD_PUBLIC_SERVER_URL` 配错** | 必须是 `https://api.hyfsad.com`，否则 admin 的 cookie 域名不对，登录后立刻掉线 |
| **`git remote -v` 的 origin 不是 GitHub** | 服务器上确认 `git remote -v`，origin 必须指向 `https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git`，不能是 nas 或其他地址 |
| **缺少 `generate:importmap`** | v3 admin 依赖 importMap 做组件映射，跳过这步会导致 admin 页面白屏或组件加载失败 |
| **`.env` 未配置** | 服务器上的 `.env` 不在 git 仓库中（被 .gitignore 排除），首次部署必须手动创建 |
