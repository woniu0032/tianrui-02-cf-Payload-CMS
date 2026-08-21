import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 News 和 Products 集合添加双语支持字段
 * Payload CMS v3 自动将 camelCase 字段名转为 snake_case 列名
 * - News: titleEn → title_en, summaryEn → summary_en, contentEn → content_en
 * - Products: nameEn → name_en, descriptionEn → description_en, contentEn → content_en
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // News 表新增英文字段（snake_case）
  await db.execute(sql`
    ALTER TABLE "news"
      ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "summary_en" text,
      ADD COLUMN IF NOT EXISTS "content_en" jsonb;
  `)

  // Products 表新增英文字段（snake_case）
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "name_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "description_en" text,
      ADD COLUMN IF NOT EXISTS "content_en" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // 回滚 News 表字段
  await db.execute(sql`
    ALTER TABLE "news"
      DROP COLUMN IF EXISTS "title_en",
      DROP COLUMN IF EXISTS "summary_en",
      DROP COLUMN IF EXISTS "content_en";
  `)

  // 回滚 Products 表字段
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "name_en",
      DROP COLUMN IF EXISTS "description_en",
      DROP COLUMN IF EXISTS "content_en";
  `)
}
