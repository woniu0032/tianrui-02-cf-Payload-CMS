#!/bin/bash

# 天睿纺织 Payload CMS - 全新服务器一键部署脚本
# 适用于重装系统后的首次部署
# 使用方法: bash init-deploy.sh

set -e

# ==================== 配置区域（请根据实际情况修改）====================
APP_NAME="tianrui-payload"
APP_DIR="/opt/tianrui-payload"
GITHUB_REPO="https://github.com/woniu0032/tianrui-02-cf-Payload-CMS.git"
BRANCH="main"
NODE_VERSION="20"
POSTGRES_USER="tianrui_user"
POSTGRES_DB="tianrui_payload"
SERVER_DOMAIN="api.hyfsad.com"
FRONTEND_DOMAIN="https://hyfsad.pages.dev"
PORT=8080

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "\n${BLUE}═══════════════════════════════════════${NC}"; echo -e "${BLUE}▶ $1${NC}"; echo "═══════════════════════════════════════\n"; }

# ==================== 步骤 1: 系统更新 ====================
step_system_update() {
    log_step "步骤 1/9: 更新系统"
    
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git
    
    log_info "✅ 系统更新完成"
}

# ==================== 步骤 2: 安装 Node.js ====================
step_install_nodejs() {
    log_step "步骤 2/9: 安装 Node.js ${NODE_VERSION}"

    if command -v node &> /dev/null; then
        NODE_VER=$(node -v)
        log_warn "Node.js 已安装: $NODE_VER"
        read -p "是否重新安装？(y/N): " REINSTALL
        if [[ ! "$REINSTALL" =~ ^[Yy]$ ]]; then
            log_info "跳过 Node.js 安装"
            return
        fi
    fi

    # Ubuntu 24.04 使用 nodesource 官方脚本
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - || {
        # 如果失败，尝试备用方法
        log_warn "nodesource 安装失败，使用备用方法..."
        sudo apt install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt update
    }

    sudo apt install -y nodejs

    log_info "✅ Node.js $(node -v) 安装完成"
}

# ==================== 步骤 3: 安装 pnpm 和 PM2 ====================
step_install_tools() {
    log_step "步骤 3/9: 安装 pnpm 和 PM2"
    
    npm install -g pnpm pm2
    
    log_info "✅ pnpm $(pnpm -v) 和 PM2 安装完成"
}

# ==================== 步骤 4: 安装 PostgreSQL ====================
step_install_postgres() {
    log_step "步骤 4/9: 安装 PostgreSQL"
    
    if command -v psql &> /dev/null; then
        log_warn "PostgreSQL 已安装"
        read -p "是否重新安装？(y/N): " REINSTALL
        if [[ ! "$REINSTALL" =~ ^[Yy]$ ]]; then
            log_info "跳过 PostgreSQL 安装"
            return
        fi
    fi
    
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    log_info "✅ PostgreSQL 安装完成"
}

# ==================== 步骤 5: 创建数据库和用户 ====================
step_create_database() {
    log_step "步骤 5/9: 创建数据库和用户"
    
    # 生成随机密码
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 20)
    
    log_info "数据库用户: $POSTGRES_USER"
    log_info "数据库名称: $POSTGRES_DB"
    log_warn "数据库密码: $DB_PASSWORD"
    log_warn "⚠️  请保存此密码！稍后需要配置到环境变量中"
    
    # 等待用户确认
    read -p "按回车继续..."
    
    sudo -u postgres psql <<EOF
CREATE DATABASE $POSTGRES_DB;
CREATE USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
ALTER USER $POSTGRES_USER CREATEDB;
\q
EOF
    
    # 保存密码到文件
    echo "# 数据库配置" > ~/db_credentials.txt
    echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${DB_PASSWORD}@localhost:5432/${POSTGRES_DB}" >> ~/db_credentials.txt
    chmod 600 ~/db_credentials.txt
    
    log_info "✅ 数据库创建完成，凭证已保存到 ~/db_credentials.txt"
}

# ==================== 步骤 6: 克隆代码 ====================
step_clone_code() {
    log_step "步骤 6/9: 克隆代码"
    
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    
    cd "$APP_DIR"
    
    if [ -d "server/.git" ]; then
        log_warn "代码已存在，拉取最新代码..."
        cd server
        git pull origin $BRANCH
    else
        log_info "克隆仓库..."
        git clone $GITHUB_REPO .
    fi
    
    log_info "✅ 代码克隆完成"
}

# ==================== 步骤 7: 安装依赖并构建 ====================
step_install_and_build() {
    log_step "步骤 7/9: 安装依赖并构建"
    
    cd "$APP_DIR/server"
    
    log_info "安装依赖..."
    pnpm install
    
    log_info "生成类型定义..."
    pnpm build
    
    log_info "✅ 依赖安装和构建完成"
}

# ==================== 步骤 8: 配置环境变量并启动 ====================
step_configure_and_start() {
    log_step "步骤 8/9: 配置环境变量并启动服务"
    
    # 读取数据库密码
    if [ -f ~/db_credentials.txt ]; then
        source ~/db_credentials.txt
    else
        log_error "未找到数据库凭证文件 ~/db_credentials.txt"
        exit 1
    fi
    
    # 生成 PAYLOAD_SECRET
    PAYLOAD_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
    
    log_info "PAYLOAD_SECRET: $PAYLOAD_SECRET"
    log_warn "⚠️  请保存此密钥！"
    
    # 设置环境变量
    export DATABASE_URL="$DATABASE_URL"
    export PAYLOAD_SECRET="$PAYLOAD_SECRET"
    export PAYLOAD_PUBLIC_SERVER_URL="https://${SERVER_DOMAIN}"
    export CORS_ORIGINS="${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}"
    export CSRF_ORIGINS="${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}"
    export PORT=$PORT
    
    # 运行数据库迁移
    log_info "运行数据库迁移..."
    cd "$APP_DIR/server"
    pnpm payload migrate
    
    # 创建初始管理员
    log_info "创建初始管理员..."
    pnpm seed || log_warn "管理员可能已存在"
    
    # 创建 PM2 配置
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    cwd: '${APP_DIR}/server',
    script: 'node_modules/.bin/payload',
    args: 'serve',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT},
      DATABASE_URL: '${DATABASE_URL}',
      PAYLOAD_SECRET: '${PAYLOAD_SECRET}',
      PAYLOAD_PUBLIC_SERVER_URL: 'https://${SERVER_DOMAIN}',
      CORS_ORIGINS: '${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}',
      CSRF_ORIGINS: '${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}'
    },
    error_file: '/var/log/${APP_NAME}/error.log',
    out_file: '/var/log/${APP_NAME}/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF
    
    # 创建日志目录
    sudo mkdir -p /var/log/$APP_NAME
    sudo chown -R $USER:$USER /var/log/$APP_NAME
    
    # 启动应用
    log_info "启动应用..."
    pm2 start ecosystem.config.js
    pm2 save
    
    # 设置开机自启
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
    
    # 保存环境变量到文件
    cat > ~/env_config.txt << EOF
# 环境变量配置
DATABASE_URL=${DATABASE_URL}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
PAYLOAD_PUBLIC_SERVER_URL=https://${SERVER_DOMAIN}
CORS_ORIGINS=${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}
CSRF_ORIGINS=${FRONTEND_DOMAIN},https://${SERVER_DOMAIN}
PORT=${PORT}
EOF
    chmod 600 ~/env_config.txt
    
    log_info "✅ 应用启动完成，配置已保存到 ~/env_config.txt"
}

# ==================== 步骤 9: 配置 Nginx ====================
step_setup_nginx() {
    log_step "步骤 9/9: 配置 Nginx"
    
    if ! command -v nginx &> /dev/null; then
        log_info "安装 Nginx..."
        sudo apt install -y nginx certbot python3-certbot-nginx
    fi
    
    # 创建 Nginx 配置
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name api.hyfsad.com;
    
    # 日志配置
    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log;
    
    # 上传文件大小限制
    client_max_body_size 20M;
    
    # 静态文件
    location /uploads {
        alias ${APP_DIR}/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS 头
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # 处理 OPTIONS 预检请求
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # 测试配置
    sudo nginx -t
    
    # 重载 Nginx
    sudo systemctl reload nginx
    
    log_info "✅ Nginx 配置完成"
    
    # SSL 证书配置提示
    log_warn ""
    log_warn "⚠️  SSL 证书配置："
    log_warn "   请先将域名 ${SERVER_DOMAIN} 解析到服务器 IP"
    log_warn "   然后运行: sudo certbot --nginx -d ${SERVER_DOMAIN}"
    log_warn ""
}

# ==================== 健康检查 ====================
health_check() {
    log_step "健康检查"
    
    sleep 5
    
    if curl -s http://localhost:${PORT}/api/health > /dev/null; then
        log_info "✅ 健康检查通过"
    else
        log_warn "⚠️  健康检查失败，请查看日志: pm2 logs $APP_NAME"
    fi
}

# ==================== 主函数 ====================
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║     天睿纺织 Payload CMS - 全新服务器一键部署          ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    log_warn "⚠️  此脚本将执行以下操作："
    log_warn "   1. 更新系统并安装必要软件"
    log_warn "   2. 安装 Node.js、pnpm、PM2"
    log_warn "   3. 安装 PostgreSQL 并创建数据库"
    log_warn "   4. 克隆代码并安装依赖"
    log_warn "   5. 配置环境变量并启动服务"
    log_warn "   6. 配置 Nginx 反向代理"
    log_warn ""
    log_warn "⚠️  请确保："
    log_warn "   - 这是全新的服务器或已备份重要数据"
    log_warn "   - 你有 root 或 sudo 权限"
    log_warn "   - 服务器可以访问 GitHub"
    log_warn ""
    
    read -p "确认继续？(yes/no): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "取消部署"
        exit 0
    fi
    
    step_system_update
    step_install_nodejs
    step_install_tools
    step_install_postgres
    step_create_database
    step_clone_code
    step_install_and_build
    step_configure_and_start
    step_setup_nginx
    health_check
    
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 部署完成！                              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"
    
    log_info "📋 重要信息："
    log_info "   应用地址: http://localhost:${PORT}"
    log_info "   管理后台: http://localhost:${PORT}/admin"
    log_info "   默认账号: admin@tianrui.com / admin123"
    log_info ""
    log_info "📁 配置文件位置："
    log_info "   数据库凭证: ~/db_credentials.txt"
    log_info "   环境变量: ~/env_config.txt"
    log_info ""
    log_info "🔧 常用命令："
    log_info "   查看日志: pm2 logs $APP_NAME"
    log_info "   重启应用: pm2 restart $APP_NAME"
    log_info "   停止应用: pm2 stop $APP_NAME"
    log_info "   查看状态: pm2 status"
    log_info ""
    log_warn "⚠️  下一步："
    log_warn "   1. 将域名 ${SERVER_DOMAIN} 解析到服务器 IP"
    log_warn "   2. 运行: sudo certbot --nginx -d ${SERVER_DOMAIN} 配置 SSL"
    log_warn "   3. 在 Cloudflare Pages 配置前端环境变量 VITE_API_URL"
    log_warn ""
}

# 执行主函数
main
