-- ============================================
-- 修复 Email Notifications 保存失败问题
-- 
-- 问题1: recipients 字段 NOT NULL 约束导致保存失败
--   Payload CMS 的 array 类型字段数据存储在关联表中，
--   主表的 recipients 列不应设置 NOT NULL 约束
-- 
-- 问题2: form_types 表列名不匹配
--   Payload v3 对 select(hasMany) 字段期望 "order" 列名（无下划线）
-- 
-- 使用方法：
-- PGPASSWORD=geMeii5ZvwwoXZbqTVdg psql -h localhost -U tianrui_user -d tianrui_payload -f scripts/fix-email-notifications-save-error.sql
-- ============================================

BEGIN;

-- 1. 移除 recipients 字段的 NOT NULL 约束
ALTER TABLE email_notifications ALTER COLUMN recipients DROP NOT NULL;

-- 2. 删除旧的 form_types 表（结构不符合 Payload v3 要求）
DROP TABLE IF EXISTS email_notifications_form_types CASCADE;

-- 3. 重新创建符合 Payload v3 要求的 form_types 表
-- Payload v3 的 select(hasMany) 字段期望关联表的 id 列有 UUID 默认值生成
CREATE TABLE email_notifications_form_types (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" integer NOT NULL,
  parent_id integer NOT NULL REFERENCES email_notifications(id) ON DELETE CASCADE,
  value varchar NOT NULL
);

CREATE INDEX email_notifications_form_types_order_idx ON email_notifications_form_types("order");
CREATE INDEX email_notifications_form_types_parent_id_idx ON email_notifications_form_types(parent_id);

COMMIT;

-- 验证结果
SELECT '✅ recipients NOT NULL constraint removed:' as info;
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'email_notifications' 
  AND column_name = 'recipients';

SELECT '✅ form_types column name:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'email_notifications_form_types' 
  AND column_name IN ('order', '_order')
ORDER BY ordinal_position;
