# News Blocks 功能部署指南

## 问题诊断

API `/api/news` 返回 `{"errors":[{"message":"Something went wrong."}]}` 错误。

**根因**：News collection schema 已更新为 RichText + Blocks，但数据库中缺少对应的 blocks 表结构。

## 解决方案

已在 `server/src/migrations/20260811_120000_news_content_layout_blocks.ts` 创建迁移文件，为 news collection 添加以下 blocks 表：
- `news_blocks_image_text` - 图文混排区块
- `news_blocks_video` - 视频嵌入区块
- `news_blocks_spec_table` + `news_blocks_spec_table_rows` - 参数表格区块
- `news_blocks_rich_text` - 富文本区块
- `news_blocks_gallery` + `news_blocks_gallery_images` - 图片画廊区块

## 部署步骤（在香港服务器执行）

```bash
# 1. 进入项目目录（根据之前记录，实际路径是 /opt/tianrui-payload）
cd /opt/tianrui-payload

# 2. 拉取最新代码
git pull origin main

# 3. 进入 server 目录
cd server

# 4. 安装依赖
pnpm install

# 5. 生成 importmap（Payload v3 admin 必需）
npx payload generate:importmap

# 6. 执行数据库迁移（创建 news blocks 表）
npx payload migrate

# 7. 构建 Next.js 应用
pnpm run build

# 8. 重启 PM2 进程（确保 PORT=8080）
PORT=8080 pm2 restart tianrui-payload

# 9. 等待启动完成（约 10-15 秒）
sleep 15

# 10. 验证 API 是否正常
curl -s http://localhost:8080/api/news?limit=1 | head -c 200

# 11. 检查 PM2 状态
pm2 status tianrui-payload
```

## 验证要点

1. **PM2 状态**：`status` 应为 `online`，`restarts` 应为 0 或较小数字
2. **API 响应**：应返回正常的 JSON 数据，不再出现 `"Something went wrong"` 错误
3. **前端页面**：访问 Cloudflare Pages 的 `/news` 页面，应能正常显示新闻列表
4. **新闻详情**：点击新闻卡片应能跳转到详情页 `/news/:id`

## 注意事项

- ⚠️ 必须在 `server/` 目录下执行所有 Payload CLI 命令
- ⚠️ PM2 启动时必须指定 `PORT=8080` 环境变量
- ⚠️ 如果迁移失败，检查 PostgreSQL 连接配置（`.env` 文件）
- ⚠️ 构建可能需要较长时间（100-150 秒），请耐心等待
