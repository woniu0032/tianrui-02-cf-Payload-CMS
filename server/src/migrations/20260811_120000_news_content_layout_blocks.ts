import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 为 news collection 添加 layout blocks 支持
 * 
 * Payload v3 blocks 字段会自动创建以下表：
 * - news_blocks_image_text
 * - news_blocks_video  
 * - news_blocks_spec_table (+ news_blocks_spec_table_rows)
 * - news_blocks_rich_text
 * - news_blocks_gallery (+ news_blocks_gallery_images)
 * 
 * content 字段从 json → richText (Lexical)，底层仍为 jsonb，无需 DDL
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ============================================
    -- 1. 创建 imageText block 表
    -- ============================================
    CREATE TABLE IF NOT EXISTS "news_blocks_image_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "image_id" integer,
      "title" varchar,
      "content" varchar,
      "image_position" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_image_text_order_idx" ON "news_blocks_image_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_image_text_parent_id_idx" ON "news_blocks_image_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "news_blocks_image_text_image_idx" ON "news_blocks_image_text" USING btree ("image_id");
    ALTER TABLE "news_blocks_image_text" ADD CONSTRAINT "news_blocks_image_text_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "news_blocks_image_text" ADD CONSTRAINT "news_blocks_image_text_image_media_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    -- ============================================
    -- 2. 创建 video block 表
    -- ============================================
    CREATE TABLE IF NOT EXISTS "news_blocks_video" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "video_url" varchar,
      "title" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_video_order_idx" ON "news_blocks_video" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_video_parent_id_idx" ON "news_blocks_video" USING btree ("_parent_id");
    ALTER TABLE "news_blocks_video" ADD CONSTRAINT "news_blocks_video_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;

    -- ============================================
    -- 3. 创建 specTable block 表 + rows 子表
    -- ============================================
    CREATE TABLE IF NOT EXISTS "news_blocks_spec_table" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "title" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_spec_table_order_idx" ON "news_blocks_spec_table" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_spec_table_parent_id_idx" ON "news_blocks_spec_table" USING btree ("_parent_id");
    ALTER TABLE "news_blocks_spec_table" ADD CONSTRAINT "news_blocks_spec_table_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;

    CREATE TABLE IF NOT EXISTS "news_blocks_spec_table_rows" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "value" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_spec_table_rows_order_idx" ON "news_blocks_spec_table_rows" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_spec_table_rows_parent_id_idx" ON "news_blocks_spec_table_rows" USING btree ("_parent_id");
    ALTER TABLE "news_blocks_spec_table_rows" ADD CONSTRAINT "news_blocks_spec_table_rows_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_blocks_spec_table"("id") ON DELETE cascade ON UPDATE no action;

    -- ============================================
    -- 4. 创建 richText block 表
    -- ============================================
    CREATE TABLE IF NOT EXISTS "news_blocks_rich_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "content" jsonb
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_rich_text_order_idx" ON "news_blocks_rich_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_rich_text_parent_id_idx" ON "news_blocks_rich_text" USING btree ("_parent_id");
    ALTER TABLE "news_blocks_rich_text" ADD CONSTRAINT "news_blocks_rich_text_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;

    -- ============================================
    -- 5. 创建 gallery block 表 + images 子表
    -- ============================================
    CREATE TABLE IF NOT EXISTS "news_blocks_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_gallery_order_idx" ON "news_blocks_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_gallery_parent_id_idx" ON "news_blocks_gallery" USING btree ("_parent_id");
    ALTER TABLE "news_blocks_gallery" ADD CONSTRAINT "news_blocks_gallery_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;

    CREATE TABLE IF NOT EXISTS "news_blocks_gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );
    CREATE INDEX IF NOT EXISTS "news_blocks_gallery_images_order_idx" ON "news_blocks_gallery_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "news_blocks_gallery_images_parent_id_idx" ON "news_blocks_gallery_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "news_blocks_gallery_images_image_idx" ON "news_blocks_gallery_images" USING btree ("image_id");
    ALTER TABLE "news_blocks_gallery_images" ADD CONSTRAINT "news_blocks_gallery_images_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "news_blocks_gallery_images" ADD CONSTRAINT "news_blocks_gallery_images_image_media_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "news_blocks_gallery_images" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_gallery" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_rich_text" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_spec_table_rows" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_spec_table" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_video" CASCADE;
    DROP TABLE IF EXISTS "news_blocks_image_text" CASCADE;
  `)
}
