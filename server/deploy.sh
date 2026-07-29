#!/bin/bash

# 天睿纺织 Payload CMS 后端部署脚本
# 用于在境外云服务器上部署

set -e

echo "🚀 开始部署 Payload CMS 后端..."

# 配置
APP_NAME="tianrui-payload"
APP_DIR="/opt/tianrui-payload"
BACKUP_DIR="/opt/backups/tianrui-payload"
NODE_VERSION="20"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL 环境变量未设置"
        exit 1
    fi
    
    if [ -z "$PAYLOAD_SECRET" ]; then
        log_error "PAYLOAD_SECRET 环境变量未设置"
        exit 1
    fi
    
    log_info "环境变量检查通过"
}

# 创建目录结构
setup_directories() {
    log_info "创建目录结构..."
    
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$APP_DIR/uploads"
    
    sudo chown -R $USER:$USER "$APP_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"
    
    log_info "目录结构创建完成"
}

# 备份当前版本
backup_current() {
    if [ -d "$APP_DIR/server" ]; then
        log_info "备份当前版本..."
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$APP_DIR" server 2>/dev/null || true
        log_info "备份完成: $BACKUP_NAME"
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    
    cd "$APP_DIR/server"
    
    # 使用 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "安装 pnpm..."
        npm install -g pnpm
    fi
    
    pnpm install --frozen-lockfile
    
    log_info "依赖安装完成"
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    cd "$APP_DIR/server"
    pnpm payload migrate
    
    log_info "数据库迁移完成"
}

# 创建初始管理员
create_admin() {
    log_info "检查是否需要创建初始管理员..."
    
    cd "$APP_DIR/server"
    pnpm seed || log_warn "管理员可能已存在或创建失败"
}

# 构建应用
build_app() {
    log_info "构建应用..."
    
    cd "$APP_DIR/server"
    pnpm build
    
    log_info "构建完成"
}

# 配置 PM2
setup_pm2() {
    log_info "配置 PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        log_info "安装 PM2..."
        npm install -g pm2
    fi
    
    # 创建 PM2 配置文件
    cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'tianrui-payload',
    cwd: '/opt/tianrui-payload/server',
    script: 'node_modules/.bin/payload',
    args: 'serve',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/tianrui-payload/error.log',
    out_file: '/var/log/tianrui-payload/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF
    
    # 创建日志目录
    sudo mkdir -p /var/log/tianrui-payload
    sudo chown -R $USER:$USER /var/log/tianrui-payload
    
    log_info "PM2 配置完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    if ! command -v nginx &> /dev/null; then
        log_warn "Nginx 未安装，跳过 Nginx 配置"
        return
    fi
    
    # 创建 Nginx 配置
    sudo tee /etc/nginx/sites-available/tianrui-payload << 'EOF'
server {
    listen 80;
    server_name api.tianrui-textile.com;
    
    # 日志配置
    access_log /var/log/nginx/tianrui-payload-access.log;
    error_log /var/log/nginx/tianrui-payload-error.log;
    
    # 上传文件大小限制
    client_max_body_size 20M;
    
    # 静态文件
    location /uploads {
        alias /opt/tianrui-payload/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS 头
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
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
    sudo ln -sf /etc/nginx/sites-available/tianrui-payload /etc/nginx/sites-enabled/
    
    # 测试配置
    sudo nginx -t
    
    # 重载 Nginx
    sudo systemctl reload nginx
    
    log_info "Nginx 配置完成"
}

# 启动应用
start_app() {
    log_info "启动应用..."
    
    cd "$APP_DIR"
    
    # 使用 PM2 启动
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    # 设置开机自启
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
    
    log_info "应用启动完成"
}

# 健康检查
health_check() {
    log_info "进行健康检查..."
    
    sleep 5
    
    if curl -s http://localhost:8080/api/health > /dev/null; then
        log_info "✅ 健康检查通过"
    else
        log_warn "⚠️ 健康检查失败，请检查应用日志"
    fi
}

# 主函数
main() {
    log_info "开始部署流程..."
    
    check_env
    setup_directories
    backup_current
    
    # 复制新代码（假设代码已通过 CI/CD 或手动复制到服务器）
    log_info "请确保代码已复制到 $APP_DIR/server"
    
    install_dependencies
    run_migrations
    create_admin
    build_app
    setup_pm2
    setup_nginx
    start_app
    health_check
    
    log_info "🎉 部署完成！"
    log_info ""
    log_info "应用地址: http://localhost:8080"
    log_info "管理后台: http://localhost:8080/admin"
    log_info ""
    log_info "查看日志: pm2 logs tianrui-payload"
    log_info "重启应用: pm2 restart tianrui-payload"
}

# 执行主函数
main
