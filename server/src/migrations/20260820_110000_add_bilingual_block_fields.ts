import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 News 和 Products 的 blocks / attributes 子表添加英文字段列
 * Payload CMS v3 自动将 camelCase 字段名转为 snake_case 列名
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ===== News blocks =====

  // news_blocks_image_text: title_en, content_en
  await db.execute(sql`
    ALTER TABLE "news_blocks_image_text"
      ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "content_en" text;
  `)

  // news_blocks_spec_table: title_en
  await db.execute(sql`
    ALTER TABLE "news_blocks_spec_table"
      ADD COLUMN IF NOT EXISTS "title_en" varchar(255);
  `)

  // news_blocks_spec_table_rows: label_en, value_en
  await db.execute(sql`
    ALTER TABLE "news_blocks_spec_table_rows"
      ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "value_en" text;
  `)

  // news_blocks_rich_text: content_en
  await db.execute(sql`
    ALTER TABLE "news_blocks_rich_text"
      ADD COLUMN IF NOT EXISTS "content_en" jsonb;
  `)

  // news_blocks_gallery_images: caption_en
  await db.execute(sql`
    ALTER TABLE "news_blocks_gallery_images"
      ADD COLUMN IF NOT EXISTS "caption_en" varchar(255);
  `)

  // ===== Products blocks =====

  // products_blocks_image_text: title_en, content_en
  await db.execute(sql`
    ALTER TABLE "products_blocks_image_text"
      ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "content_en" text;
  `)

  // products_blocks_spec_table: title_en
  await db.execute(sql`
    ALTER TABLE "products_blocks_spec_table"
      ADD COLUMN IF NOT EXISTS "title_en" varchar(255);
  `)

  // products_blocks_spec_table_rows: label_en, value_en
  await db.execute(sql`
    ALTER TABLE "products_blocks_spec_table_rows"
      ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "value_en" text;
  `)

  // products_blocks_rich_text: content_en
  await db.execute(sql`
    ALTER TABLE "products_blocks_rich_text"
      ADD COLUMN IF NOT EXISTS "content_en" jsonb;
  `)

  // products_blocks_gallery_images: caption_en
  await db.execute(sql`
    ALTER TABLE "products_blocks_gallery_images"
      ADD COLUMN IF NOT EXISTS "caption_en" varchar(255);
  `)

  // ===== Products attributes (group > array) =====

  // products_attributes_specifications: label_en, value_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_specifications"
      ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "value_en" text;
  `)

  // products_attributes_materials: item_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_materials"
      ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
  `)

  // products_attributes_colors: item_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_colors"
      ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
  `)

  // products_attributes_features: item_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_features"
      ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
  `)

  // products_attributes_tech_params: label_en, value_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_tech_params"
      ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
      ADD COLUMN IF NOT EXISTS "value_en" text;
  `)

  // products_attributes_applications: item_en
  await db.execute(sql`
    ALTER TABLE "products_attributes_applications"
      ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // ===== News blocks =====
  await db.execute(sql`
    ALTER TABLE "news_blocks_image_text"
      DROP COLUMN IF EXISTS "title_en",
      DROP COLUMN IF EXISTS "content_en";
  `)
  await db.execute(sql`
    ALTER TABLE "news_blocks_spec_table"
      DROP COLUMN IF EXISTS "title_en";
  `)
  await db.execute(sql`
    ALTER TABLE "news_blocks_spec_table_rows"
      DROP COLUMN IF EXISTS "label_en",
      DROP COLUMN IF EXISTS "value_en";
  `)
  await db.execute(sql`
    ALTER TABLE "news_blocks_rich_text"
      DROP COLUMN IF EXISTS "content_en";
  `)
  await db.execute(sql`
    ALTER TABLE "news_blocks_gallery_images"
      DROP COLUMN IF EXISTS "caption_en";
  `)

  // ===== Products blocks =====
  await db.execute(sql`
    ALTER TABLE "products_blocks_image_text"
      DROP COLUMN IF EXISTS "title_en",
      DROP COLUMN IF EXISTS "content_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_blocks_spec_table"
      DROP COLUMN IF EXISTS "title_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_blocks_spec_table_rows"
      DROP COLUMN IF EXISTS "label_en",
      DROP COLUMN IF EXISTS "value_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_blocks_rich_text"
      DROP COLUMN IF EXISTS "content_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_blocks_gallery_images"
      DROP COLUMN IF EXISTS "caption_en";
  `)

  // ===== Products attributes =====
  await db.execute(sql`
    ALTER TABLE "products_attributes_specifications"
      DROP COLUMN IF EXISTS "label_en",
      DROP COLUMN IF EXISTS "value_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_attributes_materials"
      DROP COLUMN IF EXISTS "item_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_attributes_colors"
      DROP COLUMN IF EXISTS "item_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_attributes_features"
      DROP COLUMN IF EXISTS "item_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_attributes_tech_params"
      DROP COLUMN IF EXISTS "label_en",
      DROP COLUMN IF EXISTS "value_en";
  `)
  await db.execute(sql`
    ALTER TABLE "products_attributes_applications"
      DROP COLUMN IF EXISTS "item_en";
  `)
}
