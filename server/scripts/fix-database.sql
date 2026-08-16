-- ============================================
-- 手动修复数据库迁移问题
-- 
-- 使用方法：
-- psql -U tianrui_user -d tianrui_payload -f scripts/fix-database.sql
-- ============================================

BEGIN;

-- 1. 为 form_submissions 表添加缺失字段
ALTER TABLE form_submissions 
  ADD COLUMN IF NOT EXISTS customer_name varchar,
  ADD COLUMN IF NOT EXISTS email varchar,
  ADD COLUMN IF NOT EXISTS phone varchar,
  ADD COLUMN IF NOT EXISTS company_name varchar,
  ADD COLUMN IF NOT EXISTS product_name varchar,
  ADD COLUMN IF NOT EXISTS quantity varchar,
  ADD COLUMN IF NOT EXISTS message text;

-- 2. 清理错误的迁移记录
DELETE FROM payload_migrations WHERE name IN (
  '20260812_120000_add_form_submissions_fields',
  '20260810_100000_products_content_layout_visual',
  '20260811_120000_news_content_layout_blocks'
);

-- 3. 创建 email_notifications 表
CREATE TABLE IF NOT EXISTS email_notifications (
  id serial PRIMARY KEY,
  name varchar NOT NULL UNIQUE,
  enabled boolean DEFAULT true,
  form_types varchar[],
  smtp_host varchar NOT NULL,
  smtp_port integer DEFAULT 465,
  smtp_secure boolean DEFAULT true,
  smtp_user varchar NOT NULL,
  smtp_pass varchar NOT NULL,
  smtp_from varchar,
  recipients jsonb NOT NULL,
  extra_recipients text,
  subject_template varchar DEFAULT '【{{typeLabel}}】{{customerName}} - {{productOrCompany}}',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS email_notifications_enabled_idx ON email_notifications USING btree (enabled);
CREATE INDEX IF NOT EXISTS email_notifications_form_types_idx ON email_notifications USING gin (form_types);

COMMIT;

-- 验证结果
SELECT '✅ form_submissions columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'form_submissions' 
ORDER BY ordinal_position;

SELECT '✅ email_notifications table exists:' as info;
SELECT COUNT(*) > 0 as exists FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'email_notifications';

SELECT '✅ Migration records cleaned:' as info;
SELECT name FROM payload_migrations ORDER BY created_at DESC LIMIT 5;
