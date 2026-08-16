import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 form_submissions 表添加独立字段
 * 这些字段由 beforeChange hook 从 data JSON 中自动提取
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "form_submissions" 
      ADD COLUMN IF NOT EXISTS "customer_name" varchar,
      ADD COLUMN IF NOT EXISTS "email" varchar,
      ADD COLUMN IF NOT EXISTS "phone" varchar,
      ADD COLUMN IF NOT EXISTS "company_name" varchar,
      ADD COLUMN IF NOT EXISTS "product_name" varchar,
      ADD COLUMN IF NOT EXISTS "quantity" varchar,
      ADD COLUMN IF NOT EXISTS "message" text;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "form_submissions" 
      DROP COLUMN IF EXISTS "customer_name",
      DROP COLUMN IF EXISTS "email",
      DROP COLUMN IF EXISTS "phone",
      DROP COLUMN IF EXISTS "company_name",
      DROP COLUMN IF EXISTS "product_name",
      DROP COLUMN IF EXISTS "quantity",
      DROP COLUMN IF EXISTS "message";
  `)
}
