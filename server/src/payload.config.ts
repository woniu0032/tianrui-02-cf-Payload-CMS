import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import path from 'path'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { News } from './collections/News'
import { FormSubmissions } from './collections/FormSubmissions'
import { ChatSessions } from './collections/ChatSessions'
import { EmailNotifications } from './collections/EmailNotifications'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Tianrui Admin',
    },
  },
  collections: [Users, Media, Products, News, FormSubmissions, ChatSessions, EmailNotifications],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'tianrui-payload-secret-key-2024',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false, // 生产环境关闭 push，使用 migration 管理 schema
  }),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8080',
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8080',
    'http://localhost:3000',
    // Cloudflare Pages 域名（需要替换为实际域名）
    'https://tianrui-textile.pages.dev',
    'https://tianrui-textile.com',
    'https://www.tianrui-textile.com',
    // 正式生产域名
    'https://www.hyfsad.com',
    'https://hyfsad.com',
    // 允许所有子域名（生产环境建议限制为具体域名）
    ...(process.env.CORS_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8080',
    'http://localhost:3000',
    'https://tianrui-textile.pages.dev',
    'https://tianrui-textile.com',
    'https://www.tianrui-textile.com',
    // 正式生产域名
    'https://www.hyfsad.com',
    'https://hyfsad.com',
    ...(process.env.CSRF_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
})
