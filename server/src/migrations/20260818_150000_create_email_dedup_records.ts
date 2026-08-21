import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 创建 email_dedup_records 表，用于持久化邮件去重记录
 * 避免 PM2 重启后内存缓存丢失导致去重失效
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "email_dedup_records" (
      "id" serial PRIMARY KEY,
      "dedup_key" varchar(255) NOT NULL UNIQUE,
      "dedup_mode" varchar(50) NOT NULL,
      "client_ip" varchar(255),
      "session_id" varchar(255),
      "sent_at" timestamp NOT NULL DEFAULT NOW(),
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS "email_dedup_records_key_idx" ON "email_dedup_records" USING btree ("dedup_key");
    CREATE INDEX IF NOT EXISTS "email_dedup_records_expires_idx" ON "email_dedup_records" USING btree ("expires_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "email_dedup_records_expires_idx";
    DROP INDEX IF EXISTS "email_dedup_records_key_idx";
    DROP TABLE IF EXISTS "email_dedup_records";
  `)
}
