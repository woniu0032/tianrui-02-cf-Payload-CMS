/**
 * 手动修复迁移记录与实际数据库状态不一致的问题
 * 
 * 使用方法：
 * cd /opt/tianrui-payload/server
 * npx ts-node scripts/fix-migrations.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function fixMigrations() {
  console.log('🔧 Starting migration fix...\n')
  
  const payload = await getPayload({ config })
  
  // 1. 检查 form_submissions 表的字段
  console.log('📋 Checking form_submissions columns...')
  const columnsResult = await payload.db.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'form_submissions'"
  )
  const existingCols = (columnsResult as any[]).map((row: any) => row.column_name)
  console.log('Existing columns:', existingCols.join(', '))
  
  // 2. 添加缺失的字段
  const fieldsToAdd = [
    { name: 'customer_name', type: 'varchar' },
    { name: 'email', type: 'varchar' },
    { name: 'phone', type: 'varchar' },
    { name: 'company_name', type: 'varchar' },
    { name: 'product_name', type: 'varchar' },
    { name: 'quantity', type: 'varchar' },
    { name: 'message', type: 'text' },
  ]
  
  let addedCount = 0
  for (const field of fieldsToAdd) {
    if (!existingCols.includes(field.name)) {
      console.log(`➕ Adding column: ${field.name} (${field.type})`)
      await payload.db.execute(
        `ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS "${field.name}" ${field.type}`
      )
      addedCount++
    } else {
      console.log(`✅ Column already exists: ${field.name}`)
    }
  }
  console.log(`\n✨ Added ${addedCount} new columns\n`)
  
  // 3. 清理错误的迁移记录
  console.log('🗑️ Cleaning up migration records...')
  const migrationsToDelete = [
    '20260812_120000_add_form_submissions_fields',
    '20260810_100000_products_content_layout_visual',
    '20260811_120000_news_content_layout_blocks',
  ]
  
  for (const migrationName of migrationsToDelete) {
    const result = await payload.db.execute(
      `DELETE FROM payload_migrations WHERE name = '${migrationName}'`
    )
    console.log(`Deleted migration record: ${migrationName} (${result.rowCount} rows)`)
  }
  
  // 4. 检查 email_notifications 表是否存在
  console.log('\n📋 Checking email_notifications table...')
  const tablesResult = await payload.db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_notifications'"
  )
  const tableExists = (tablesResult as any[]).length > 0
  
  if (!tableExists) {
    console.log('⚠️  email_notifications table does not exist, creating...')
    
    // 创建 email_notifications 表
    await payload.db.execute(`
      CREATE TABLE IF NOT EXISTS "email_notifications" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL UNIQUE,
        "enabled" boolean DEFAULT true,
        "form_types" varchar[],
        "smtp_host" varchar NOT NULL,
        "smtp_port" integer DEFAULT 465,
        "smtp_secure" boolean DEFAULT true,
        "smtp_user" varchar NOT NULL,
        "smtp_pass" varchar NOT NULL,
        "smtp_from" varchar,
        "recipients" jsonb NOT NULL,
        "extra_recipients" text,
        "subject_template" varchar DEFAULT '【{{typeLabel}}】{{customerName}} - {{productOrCompany}}',
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now(),
        "updated_at" timestamp with time zone DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS "email_notifications_enabled_idx" ON "email_notifications" USING btree ("enabled");
      CREATE INDEX IF NOT EXISTS "email_notifications_form_types_idx" ON "email_notifications" USING gin ("form_types");
    `)
    
    console.log('✅ email_notifications table created')
  } else {
    console.log('✅ email_notifications table already exists')
  }
  
  console.log('\n🎉 Migration fix completed successfully!')
  console.log('\nNext steps:')
  console.log('1. Restart PM2: pm2 restart tianrui-payload')
  console.log('2. Check logs: pm2 logs tianrui-payload --lines 30')
  console.log('3. Test by submitting a form in the frontend')
  
  process.exit(0)
}

fixMigrations().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
