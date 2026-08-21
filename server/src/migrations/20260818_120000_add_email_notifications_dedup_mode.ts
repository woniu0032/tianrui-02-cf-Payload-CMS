import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 email_notifications 表添加 dedupMode 字段
 * 用于配置邮件通知去重模式：ip_per_day / session_once / none
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_notifications"
      ADD COLUMN IF NOT EXISTS "dedup_mode" varchar(50) DEFAULT 'ip_per_day';

    COMMENT ON COLUMN "email_notifications"."dedup_mode" IS '去重模式: ip_per_day=同一IP同一天只发一次, session_once=同一会话只发一次, none=每次都发';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_notifications"
      DROP COLUMN IF EXISTS "dedup_mode";
  `)
}
