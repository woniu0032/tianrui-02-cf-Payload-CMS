#!/bin/bash
# ============================================================
# 天睿纺织 Payload CMS 一键部署脚本
# 用法: bash deploy.sh
# 适用场景: 新服务器首次部署 / 代码更新后重新部署
# ============================================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  天睿纺织 Payload CMS 部署脚本"
echo "=========================================="

# 1. 进入 server 目录
cd "$(dirname "$0")"
echo ""
echo "[1/6] 当前目录: $(pwd)"

# 2. 安装依赖
echo ""
echo "[2/6] 安装依赖..."
pnpm install

# 3. 执行 Payload CMS 官方迁移
echo ""
echo "[3/6] 执行 Payload CMS 迁移..."
npx payload migrate || {
  echo "⚠️  Payload CMS 迁移失败，尝试使用备用迁移脚本..."
  set -a && source .env && set +a && node scripts/migrate-bilingual-fields.cjs || {
    echo " 备用迁移也失败了，请检查 DATABASE_URL 配置"
    exit 1
  }
}

# 4. 构建生产版本
echo ""
echo "[4/6] 构建生产版本..."
pnpm run build

# 5. 重启 PM2 服务
echo ""
echo "[5/6] 重启 PM2 服务..."
if pm2 describe tianrui-payload > /dev/null 2>&1; then
  pm2 restart tianrui-payload
  echo "✓ 已重启 tianrui-payload"
else
  PORT=8080 pm2 start pnpm --name tianrui-payload -- start
  echo "✓ 已启动 tianrui-payload (PORT=8080)"
fi
pm2 save

# 6. 验证服务
echo ""
echo "[6/6] 验证服务..."
sleep 3
NEWS_RESULT=$(curl -s http://localhost:8080/api/news?limit=1 2>/dev/null | head -c 100)
PRODUCTS_RESULT=$(curl -s http://localhost:8080/api/products?limit=1 2>/dev/null | head -c 100)

if echo "$NEWS_RESULT" | grep -q '"docs"'; then
  echo "✓ News API 正常"
else
  echo "⚠️  News API 异常: $NEWS_RESULT"
fi

if echo "$PRODUCTS_RESULT" | grep -q '"docs"'; then
  echo "✓ Products API 正常"
else
  echo "⚠️  Products API 异常: $PRODUCTS_RESULT"
fi

echo ""
echo "=========================================="
echo "  部署完成！"
echo "  Admin: https://api.hyfsad.com/admin"
echo "=========================================="
