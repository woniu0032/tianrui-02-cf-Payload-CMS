import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 chat_sessions 表添加 pinnedAt 字段，支持会话置顶功能
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "chat_sessions" 
      ADD COLUMN IF NOT EXISTS "pinned_at" timestamp;
    
    CREATE INDEX IF NOT EXISTS "chat_sessions_pinned_at_idx" ON "chat_sessions" USING btree ("pinned_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "chat_sessions_pinned_at_idx";
    ALTER TABLE "chat_sessions" 
      DROP COLUMN IF EXISTS "pinned_at";
  `)
}
