/** @type {import('next').NextConfig} */
import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default withPayload({
  // 关键：显式指定 tracing root，避免 Turbopack workspace 检测问题
  outputFileTracingRoot: __dirname,
<<<<<<< HEAD
  // 禁用 Turbopack，使用传统 Webpack 构建
  turbopack: false,
  // Next.js 16 实验性配置
  experimental: {
    turbo: false,
  },
=======
>>>>>>> 72f554810aa6f64a32515ecc24c3de812901f885
})
