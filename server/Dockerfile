FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建（Payload v3 必需先生成 importmap 和类型，否则 admin 白屏）
RUN pnpm payload generate:importmap && pnpm payload generate:types && pnpm build

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["pnpm", "start"]
