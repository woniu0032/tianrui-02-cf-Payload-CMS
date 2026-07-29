# 单阶段构建 - 包含 OpenSSL 依赖
FROM node:18-alpine

# 安装 OpenSSL 和 Prisma 引擎所需的系统库
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json ./

# 安装所有依赖（包括 devDependencies）
RUN pnpm install

# 复制源代码和 Prisma schema
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建 TypeScript
RUN pnpm build

# 创建日志和上传目录并设置权限
RUN mkdir -p logs uploads && chmod 755 logs uploads

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 启动应用（先执行数据库迁移和种子数据，再启动服务）
CMD sh -c "echo '=== Running Prisma Migrate Deploy ===' && npx prisma migrate deploy && echo '=== Migration completed ===' && echo '=== Seeding Data ===' && npx tsx prisma/seed.ts && echo '=== Seed completed ===' && echo '=== Starting Server ===' && node dist/index.js"
