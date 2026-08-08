#!/bin/bash
# ============================================================
# Tianrui Payload CMS 一键自动化部署脚本
# 目标服务器：香港 4核8G Ubuntu 22.04 (SSH 27822)
# 用法：bash auto-deploy.sh
# ============================================================
set -e

# ---------- 配置区（按需修改） ----------
DB_NAME="tianrui_payload"
DB_USER="tianrui_user"
DB_PASS="geMeii5ZvwwoXZbqTVdg"
APP_DIR="/opt/tianrui-payload"
GIT_REPO="https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git"
SERVER_URL="https://api.hyfsad.com"
CORS="https://hyfsad.pages.dev,https://api.hyfsad.com"
APP_PORT=8080
# ----------------------------------------

echo "==> [1/9] 更新系统软件包"
apt update -y
DEBIAN_FRONTEND=noninteractive apt upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
apt autoremove -y

echo "==> [2/9] 安装基础依赖 (Git/Nginx/PostgreSQL/curl)"
apt install -y git nginx postgresql postgresql-contrib curl build-essential

echo "==> [3/9] 安装 Node.js 20"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v

echo "==> [4/9] 安装 pnpm 和 PM2"
npm install -g pnpm pm2
pnpm -v
pm2 -v

echo "==> [5/9] 配置 PostgreSQL 数据库"
systemctl enable postgresql
systemctl start postgresql
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;
SQL
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
echo "数据库 ${DB_NAME} / 用户 ${DB_USER} 就绪"

echo "==> [6/9] 克隆项目代码"
rm -rf ${APP_DIR}
git clone ${GIT_REPO} ${APP_DIR}
cd ${APP_DIR}/server

echo "==> [7/9] 创建 .env 配置文件"
cat > .env <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
PAYLOAD_SECRET=tianrui-payload-secret-key-2024-production
PAYLOAD_PUBLIC_SERVER_URL=${SERVER_URL}
CORS_ORIGINS=${CORS}
CSRF_ORIGINS=${CORS}
EOF

echo "==> [8/9] 安装依赖并构建"
pnpm install
pnpm approve-builds <<EOF2
a
y
EOF2
pnpm generate:importmap
pnpm generate:types
NODE_OPTIONS="--max-old-space-size=6144" pnpm build

echo "==> [9/9] 配置 Nginx 反向代理并用 PM2 启动"
cat > /etc/nginx/sites-available/tianrui <<'NGINX'
server {
    listen 80;
    server_name api.hyfsad.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/tianrui /etc/nginx/sites-enabled/tianrui
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

pm2 stop tianrui-payload 2>/dev/null || true
pm2 delete tianrui-payload 2>/dev/null || true
cd ${APP_DIR}/server
PORT=${APP_PORT} pm2 start "pnpm start" --name tianrui-payload
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "============================================================"
echo "部署完成！"
echo "  Admin 面板: ${SERVER_URL}/admin"
echo "  登录账号:   admin@tianrui.com / admin123"
echo "  服务状态:   pm2 show tianrui-payload"
echo "============================================================"
