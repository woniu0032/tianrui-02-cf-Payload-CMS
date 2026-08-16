-- ============================================
-- 修复 email_notifications 集合的关联表
-- 
-- Payload CMS 为 select(hasMany) 和 array 字段自动创建关联表
-- 这些表在手动创建主表时没有被创建
-- 
-- 使用方法：
-- PGPASSWORD=geMeii5ZvwwoXZbqTVdg psql -h localhost -U tianrui_user -d tianrui_payload -f scripts/fix-email-notifications-tables.sql
-- ============================================

BEGIN;

-- 1. 创建 formTypes 关联表（select hasMany 字段）
-- 注意：Payload v3 对 select(hasMany) 字段的关联表使用 "order" 列名（无下划线）
-- 而 array 字段使用 "_order"（有下划线）
CREATE TABLE IF NOT EXISTS "email_notifications_form_types" (
  "order" integer NOT NULL,
  "parent_id" integer NOT NULL,
  "value" varchar NOT NULL,
  CONSTRAINT "email_notifications_form_types_pkey" PRIMARY KEY ("order", "parent_id")
);

CREATE INDEX IF NOT EXISTS "email_notifications_form_types_order_idx" ON "email_notifications_form_types" USING btree ("order");
CREATE INDEX IF NOT EXISTS "email_notifications_form_types_parent_id_idx" ON "email_notifications_form_types" USING btree ("parent_id");

ALTER TABLE "email_notifications_form_types" 
  ADD CONSTRAINT "email_notifications_form_types_parent_fk" 
  FOREIGN KEY ("parent_id") REFERENCES "email_notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 2. 创建 recipients 关联表（array 字段）
CREATE TABLE IF NOT EXISTS "email_notifications_recipients" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "email" varchar NOT NULL,
  "name" varchar
);

CREATE INDEX IF NOT EXISTS "email_notifications_recipients_order_idx" ON "email_notifications_recipients" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "email_notifications_recipients_parent_id_idx" ON "email_notifications_recipients" USING btree ("_parent_id");

ALTER TABLE "email_notifications_recipients" 
  ADD CONSTRAINT "email_notifications_recipients_parent_fk" 
  FOREIGN KEY ("_parent_id") REFERENCES "email_notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 3. 为 payload_locked_documents_rels 表添加 email_notifications_id 列
-- Payload 使用这个表来跟踪文档锁定状态
ALTER TABLE "payload_locked_documents_rels" 
  ADD COLUMN IF NOT EXISTS "email_notifications_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_notifications_idx" 
  ON "payload_locked_documents_rels" USING btree ("email_notifications_id");

ALTER TABLE "payload_locked_documents_rels" 
  ADD CONSTRAINT "payload_locked_documents_rels_email_notifications_fk" 
  FOREIGN KEY ("email_notifications_id") REFERENCES "email_notifications"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;

-- 验证结果
SELECT '✅ Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'email_notifications%'
ORDER BY table_name;

SELECT '✅ payload_locked_documents_rels columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payload_locked_documents_rels' 
  AND column_name LIKE '%email%'
ORDER BY ordinal_position;
