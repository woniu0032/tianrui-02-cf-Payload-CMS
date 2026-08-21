#!/bin/bash
set -euo pipefail

# ============================================================
# 天睿纺织 Payload CMS v3 - 增量更新 + 自动部署脚本
# 在境外服务器（47.80.28.104）上运行，从 GitHub 拉取最新
# server 代码并部署 Next.js 架构的 Payload CMS 后端。
# 用法: bash update-deploy.sh [分支名]   （默认 main）
# ============================================================

# -------------------- 配置区 --------------------
APP_DIR="/opt/tianrui-payload/server"
BRANCH="${1:-main}"
REPO_URL="https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git"
PM2_NAME="tianrui-payload"
BACKUP_TAG="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="/tmp/tianrui-server-${BACKUP_TAG}.tar.gz"
OLD_COMMIT=""

# -------------------- 颜色 --------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -------------------- 回滚函数 --------------------
rollback() {
  log_error "部署失败，开始回滚到 ${OLD_COMMIT} ..."
  cd "$APP_DIR"
  git reset --hard "$OLD_COMMIT" || true
  if [ -f "$BACKUP_FILE" ]; then
    tar -xzf "$BACKUP_FILE" -C /opt/tianrui-payload || true
  fi
  pnpm install || true
  pm2 restart "$PM2_NAME" || true
  log_error "已回滚到 ${OLD_COMMIT}，服务恢复到更新前状态。"
  exit 1
}

# -------------------- 步骤 1: 进入目录并校验 git 仓库 --------------------
cd "$APP_DIR"
if [ ! -d .git ]; then
  log_error "当前目录不是 git 仓库，请先用 init-deploy.sh 或 git clone 初始化"
  exit 1
fi

# -------------------- 步骤 2: 记录更新前 commit --------------------
OLD_COMMIT="$(git rev-parse HEAD)"
log_info "更新前 commit: ${OLD_COMMIT}"

# -------------------- 步骤 3: 备份当前代码 --------------------
tar -czf "$BACKUP_FILE" --exclude=node_modules --exclude=.next --exclude=uploads -C /opt/tianrui-payload server
log_info "已备份到: ${BACKUP_FILE}"

# -------------------- 步骤 4: 配置 sparse checkout（只拉取 server/ 目录）--------------------
git config core.sparseCheckout true
echo "server/*" > .git/info/sparse-checkout

# -------------------- 步骤 5: 拉取并强制对齐远程 --------------------
git fetch origin "$BRANCH"
git read-tree -mu HEAD
git reset --hard "origin/${BRANCH}"
log_info "已对齐到远程 ${BRANCH} (sparse checkout: server/*)"

# -------------------- 步骤 5.5: 将 server/ 子目录内容移到当前目录 --------------------
if [ -d "server" ]; then
  log_info "迁移 server/ 子目录内容到当前目录..."
  # 删除当前目录的旧文件（保留 .git 和 .env）
  find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '.env' -not -name 'node_modules' -exec rm -rf {} +
  # 移动 server/ 内容
  mv server/* .
  mv server/.* . 2>/dev/null || true
  rmdir server/ 2>/dev/null || true
  log_info "server/ 目录内容已迁移"
fi

# -------------------- 步骤 6: 判断是否有更新 --------------------
NEW_COMMIT="$(git rev-parse HEAD)"
if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
  log_info "代码无更新，跳过构建"
  pm2 restart "$PM2_NAME"
  exit 0
fi
log_info "检测到新 commit: ${NEW_COMMIT}"

# -------------------- 步骤 7: 安装依赖 --------------------
log_info "安装依赖 (pnpm install)..."
pnpm install || { log_error "pnpm install 失败"; rollback; }

# -------------------- 步骤 8: 生成 admin 组件映射（v3 必需）--------------------
log_info "生成 importmap (payload generate:importmap)..."
pnpm payload generate:importmap || { log_error "generate:importmap 失败"; rollback; }

# -------------------- 步骤 9: 生成类型定义 --------------------
log_info "生成类型 (payload generate:types)..."
pnpm payload generate:types || { log_error "generate:types 失败"; rollback; }

# -------------------- 步骤 10: 构建（next build）--------------------
log_info "构建应用 (next build)..."
NODE_OPTIONS='--max-old-space-size=2048 --no-deprecation' pnpm build || { log_error "next build 失败"; rollback; }

# -------------------- 步骤 11: 重启 PM2 --------------------
log_info "重启 PM2 进程 ${PM2_NAME}..."
pm2 restart "$PM2_NAME"

# -------------------- 步骤 12: 健康检查 --------------------
log_info "等待服务启动..."
sleep 6
ADMIN_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/admin || echo 000)"
API_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/users || echo 000)"
log_info "健康检查: /admin=${ADMIN_CODE}  /api/users=${API_CODE}"

if [ "$ADMIN_CODE" = "404" ] || [ "$ADMIN_CODE" = "000" ]; then
  log_error "/admin 健康检查失败 (状态码 ${ADMIN_CODE})"
  rollback
fi

# -------------------- 成功横幅 --------------------
echo ""
echo "============================================================"
log_info "🎉 部署成功！"
log_info "管理后台: https://api.hyfsad.com/admin"
log_info "登录账号: admin@tianrui.com / admin123"
log_info "当前 commit: ${NEW_COMMIT}"
echo "============================================================"
