# 天睿纺织网站部署指南

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages (前端)                                    │
│  - 域名: https://tianrui-textile.pages.dev                  │
│  - 或自定义域名: https://www.tianrui-textile.com            │
│  - 静态文件托管，全球 CDN 加速                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API 请求
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  境外云服务器 (后端)                                        │
│  - 域名: https://api.tianrui-textile.com                    │
│  - Payload CMS + PostgreSQL                                 │
│  - Docker + Nginx 反向代理                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 一、前端部署 (Cloudflare Pages)

### 1.1 准备工作

1. **注册 Cloudflare 账号**
   - 访问 https://dash.cloudflare.com/sign-up
   - 完成邮箱验证

2. **准备 GitHub 仓库**
   ```bash
   # 初始化 Git 仓库（如果还没有）
   git init
   git add .
   git commit -m "Initial commit"
   
   # 推送到 GitHub
   git remote add origin https://github.com/yourusername/tianrui-textile.git
   git push -u origin main
   ```

### 1.2 创建 Cloudflare Pages 项目

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com
   - 点击左侧菜单 "Pages"

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权 Cloudflare 访问你的 GitHub 仓库
   - 选择 `tianrui-textile` 仓库

3. **配置构建设置**
   ```
   Project name: tianrui-textile
   Production branch: main
   
   Build settings:
   - Build command: pnpm run build
   - Build output directory: dist
   - Root directory: /
   ```

4. **添加环境变量**
   ```
   VITE_API_URL = https://api.tianrui-textile.com
   NODE_VERSION = 20
   ```

5. **保存并部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（约 2-3 分钟）

### 1.3 配置自定义域名（可选）

1. **添加域名**
   - 在 Pages 项目设置中，点击 "Custom domains"
   - 输入你的域名：`www.tianrui-textile.com`
   - 按照提示添加 DNS 记录

2. **DNS 配置**
   ```
   Type: CNAME
   Name: www
   Target: tianrui-textile.pages.dev
   TTL: Auto
   ```

3. **启用 HTTPS**
   - Cloudflare 会自动提供 SSL 证书
   - 在 "SSL/TLS" 设置中选择 "Full (strict)"

---

## 二、后端部署 (境外云服务器)

### 2.1 服务器准备

**推荐配置：**
- CPU: 2 核+
- 内存: 4GB+
- 存储: 50GB SSD+
- 系统: Ubuntu 22.04 LTS
- 位置: 香港、新加坡、日本等亚洲节点

**购买渠道：**
- Vultr: https://www.vultr.com
- DigitalOcean: https://www.digitalocean.com
- Linode: https://www.linode.com
- AWS Lightsail: https://lightsail.aws.amazon.com

### 2.2 服务器初始化

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装必要工具
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# 3. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装 pnpm
npm install -g pnpm pm2

# 5. 安装 Docker（可选）
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2.3 安装 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql <<EOF
CREATE DATABASE tianrui_payload;
CREATE USER tianrui_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tianrui_payload TO tianrui_user;
\q
EOF
```

### 2.4 部署后端代码

```bash
# 1. 创建应用目录
sudo mkdir -p /opt/tianrui-payload
sudo chown -R $USER:$USER /opt/tianrui-payload

# 2. 克隆代码（或上传代码）
cd /opt/tianrui-payload
git clone https://github.com/yourusername/tianrui-textile.git .

# 3. 进入 server 目录
cd server

# 4. 安装依赖
pnpm install

# 5. 设置环境变量
export DATABASE_URL="postgresql://tianrui_user:your_secure_password@localhost:5432/tianrui_payload"
export PAYLOAD_SECRET="your-random-secret-key-at-least-32-characters"
export PAYLOAD_PUBLIC_SERVER_URL="https://api.tianrui-textile.com"
export CORS_ORIGINS="https://tianrui-textile.pages.dev,https://www.tianrui-textile.com"
export CSRF_ORIGINS="https://tianrui-textile.pages.dev,https://www.tianrui-textile.com"

# 6. 运行数据库迁移
pnpm payload migrate

# 7. 创建初始管理员
pnpm seed

# 8. 构建应用
pnpm build
```

### 2.5 使用 PM2 启动服务

```bash
# 1. 创建 PM2 配置文件
cat > /opt/tianrui-payload/ecosystem.config.js << 'EOF'
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

# 2. 创建日志目录
sudo mkdir -p /var/log/tianrui-payload
sudo chown -R $USER:$USER /var/log/tianrui-payload

# 3. 启动应用
pm2 start ecosystem.config.js --env production
pm2 save

# 4. 设置开机自启
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 2.6 配置 Nginx 反向代理

```bash
# 1. 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/tianrui-payload << 'EOF'
server {
    listen 80;
    server_name api.tianrui-textile.com;
    
    client_max_body_size 20M;
    
    location /uploads {
        alias /opt/tianrui-payload/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
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
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
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

# 2. 启用站点
sudo ln -sf /etc/nginx/sites-available/tianrui-payload /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.7 配置 SSL 证书

```bash
# 使用 Certbot 自动获取 Let's Encrypt 证书
sudo certbot --nginx -d api.tianrui-textile.com

# 按照提示完成配置
# 证书会自动续期
```

---

## 三、环境变量配置

### 3.1 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_URL` | 后端 API 地址 | `https://api.tianrui-textile.com` |

### 3.2 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `PAYLOAD_SECRET` | Payload 加密密钥 | `random-string-32-chars` |
| `PAYLOAD_PUBLIC_SERVER_URL` | 服务器公网地址 | `https://api.tianrui-textile.com` |
| `CORS_ORIGINS` | 允许的跨域来源 | `https://domain1.com,https://domain2.com` |
| `CSRF_ORIGINS` | 允许的 CSRF 来源 | `https://domain1.com,https://domain2.com` |
| `PORT` | 服务端口 | `8080` |
| `NODE_ENV` | 环境模式 | `production` |

---

## 四、域名和 SSL 配置

### 4.1 域名购买

推荐域名注册商：
- Namecheap: https://www.namecheap.com
- Cloudflare Registrar: https://dash.cloudflare.com
- GoDaddy: https://www.godaddy.com

### 4.2 DNS 配置

在 Cloudflare 或其他 DNS 服务商配置：

```
# 前端域名
Type: CNAME
Name: www
Target: tianrui-textile.pages.dev

# 后端域名
Type: A
Name: api
Target: <你的服务器IP>

# 或者使用 CNAME 指向服务器域名
Type: CNAME
Name: api
Target: server.yourhost.com
```

### 4.3 SSL 证书

**Cloudflare Pages:**
- 自动提供 SSL 证书
- 无需手动配置

**后端服务器:**
- 使用 Let's Encrypt 免费证书
- 自动续期

---

## 五、前后端联调测试

### 5.1 测试后端 API

```bash
# 测试健康检查
curl https://api.tianrui-textile.com/api/health

# 测试产品列表
curl https://api.tianrui-textile.com/api/products

# 测试登录（使用创建的管理员账号）
curl -X POST https://api.tianrui-textile.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tianrui.com","password":"admin123"}'
```

### 5.2 测试前端访问

1. **打开前端网站**
   - 访问 `https://tianrui-textile.pages.dev`
   - 或自定义域名 `https://www.tianrui-textile.com`

2. **检查 API 请求**
   - 打开浏览器开发者工具 (F12)
   - 切换到 Network 标签
   - 刷新页面，检查 API 请求是否成功

3. **测试管理后台**
   - 访问 `/admin/login`
   - 使用管理员账号登录
   - 测试产品 CRUD 功能

### 5.3 常见问题排查

**CORS 错误：**
- 检查后端 `CORS_ORIGINS` 环境变量
- 确认包含前端域名

**API 404 错误：**
- 检查后端服务是否运行：`pm2 status`
- 检查 Nginx 配置是否正确

**图片上传失败：**
- 检查 `uploads` 目录权限
- 确认 Nginx `client_max_body_size` 设置

**数据库连接失败：**
- 检查 PostgreSQL 是否运行：`sudo systemctl status postgresql`
- 验证 `DATABASE_URL` 配置

---

## 六、自动化部署（可选）

### 6.1 GitHub Actions 自动部署前端

已配置 `.github/workflows/deploy.yml`，每次推送到 main 分支会自动部署到 Cloudflare Pages。

**需要配置的 Secrets：**
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账号 ID
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token

### 6.2 后端自动部署脚本

使用 `server/deploy.sh` 脚本一键部署：

```bash
# 在服务器上执行
cd /opt/tianrui-payload
export DATABASE_URL="..."
export PAYLOAD_SECRET="..."
bash server/deploy.sh
```

---

## 七、监控和维护

### 7.1 查看日志

```bash
# PM2 日志
pm2 logs tianrui-payload

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.2 备份数据

```bash
# 备份数据库
pg_dump -U tianrui_user tianrui_payload > backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/tianrui-payload/uploads
```

### 7.3 更新部署

```bash
# 前端：推送到 GitHub 自动部署
git add .
git commit -m "Update frontend"
git push origin main

# 后端：拉取代码并重启
cd /opt/tianrui-payload
git pull origin main
cd server
pnpm install
pnpm build
pm2 restart tianrui-payload
```

---

## 八、安全建议

1. **修改默认密码**
   - 登录后立即修改管理员密码
   - 使用强密码（12位以上，包含大小写、数字、符号）

2. **配置防火墙**
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

3. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **启用 Cloudflare 安全功能**
   - 开启 DDoS 防护
   - 配置 WAF 规则
   - 启用 Bot 管理

---

## 九、联系支持

部署过程中遇到问题：
1. 检查日志文件定位问题
2. 查看 Cloudflare 和服务器文档
3. 参考 Payload CMS 官方文档：https://payloadcms.com/docs

---

**部署完成！** 🎉

前端地址：https://tianrui-textile.pages.dev
后端地址：https://api.tianrui-textile.com
管理后台：https://api.tianrui-textile.com/admin
