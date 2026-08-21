/**
 * 双语字段数据库迁移脚本
 * 用途：在 Payload CMS 迁移不可用时，直接通过 SQL 添加双语字段列
 * 使用方式：set -a && source .env && set +a && node scripts/migrate-bilingual-fields.cjs
 *
 * 所有 ALTER TABLE 均使用 IF NOT EXISTS，可安全重复执行
 */

const { Client } = require('pg');

// 从环境变量读取 DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('错误: 未找到 DATABASE_URL 环境变量');
  console.error('请先执行: set -a && source .env && set +a');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function runMigration() {
  try {
    await client.connect();
    console.log('已连接数据库');

    // ===== 第一批：News / Products 主表英文字段 =====
    console.log('\n--- 主表字段 ---');

    await client.query(`
      ALTER TABLE "news"
        ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "summary_en" text,
        ADD COLUMN IF NOT EXISTS "content_en" jsonb;
    `);
    console.log('✓ news 表: title_en, summary_en, content_en');

    await client.query(`
      ALTER TABLE "products"
        ADD COLUMN IF NOT EXISTS "name_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "description_en" text,
        ADD COLUMN IF NOT EXISTS "content_en" jsonb;
    `);
    console.log('✓ products 表: name_en, description_en, content_en');

    // ===== 第二批：News blocks 子表 =====
    console.log('\n--- News blocks 子表 ---');

    await client.query(`
      ALTER TABLE "news_blocks_image_text"
        ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "content_en" text;
    `);
    console.log('✓ news_blocks_image_text: title_en, content_en');

    await client.query(`
      ALTER TABLE "news_blocks_spec_table"
        ADD COLUMN IF NOT EXISTS "title_en" varchar(255);
    `);
    console.log('✓ news_blocks_spec_table: title_en');

    await client.query(`
      ALTER TABLE "news_blocks_spec_table_rows"
        ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "value_en" text;
    `);
    console.log('✓ news_blocks_spec_table_rows: label_en, value_en');

    await client.query(`
      ALTER TABLE "news_blocks_rich_text"
        ADD COLUMN IF NOT EXISTS "content_en" jsonb;
    `);
    console.log('✓ news_blocks_rich_text: content_en');

    // 修复 caption 列类型：从 varchar(255) 改为 text
    await client.query(`
      ALTER TABLE "news_blocks_gallery_images"
        ADD COLUMN IF NOT EXISTS "caption_en" text;
    `);
    await client.query(`
      ALTER TABLE "news_blocks_gallery_images"
        ALTER COLUMN "caption" TYPE text,
        ALTER COLUMN "caption_en" TYPE text;
    `);
    console.log('✓ news_blocks_gallery_images: caption_en (text), caption/caption_en 类型已修复为 text');

    // ===== 第三批：Products blocks 子表 =====
    console.log('\n--- Products blocks 子表 ---');

    await client.query(`
      ALTER TABLE "products_blocks_image_text"
        ADD COLUMN IF NOT EXISTS "title_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "content_en" text;
    `);
    console.log('✓ products_blocks_image_text: title_en, content_en');

    await client.query(`
      ALTER TABLE "products_blocks_spec_table"
        ADD COLUMN IF NOT EXISTS "title_en" varchar(255);
    `);
    console.log('✓ products_blocks_spec_table: title_en');

    await client.query(`
      ALTER TABLE "products_blocks_spec_table_rows"
        ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "value_en" text;
    `);
    console.log('✓ products_blocks_spec_table_rows: label_en, value_en');

    await client.query(`
      ALTER TABLE "products_blocks_rich_text"
        ADD COLUMN IF NOT EXISTS "content_en" jsonb;
    `);
    console.log('✓ products_blocks_rich_text: content_en');

    // 修复 caption 列类型：从 varchar(255) 改为 text
    await client.query(`
      ALTER TABLE "products_blocks_gallery_images"
        ADD COLUMN IF NOT EXISTS "caption_en" text;
    `);
    await client.query(`
      ALTER TABLE "products_blocks_gallery_images"
        ALTER COLUMN "caption" TYPE text,
        ALTER COLUMN "caption_en" TYPE text;
    `);
    console.log('✓ products_blocks_gallery_images: caption_en (text), caption/caption_en 类型已修复为 text');

    // ===== 第四批：Products attributes 子表 =====
    console.log('\n--- Products attributes 子表 ---');

    await client.query(`
      ALTER TABLE "products_attributes_specifications"
        ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "value_en" text;
    `);
    console.log('✓ products_attributes_specifications: label_en, value_en');

    await client.query(`
      ALTER TABLE "products_attributes_materials"
        ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
    `);
    console.log('✓ products_attributes_materials: item_en');

    await client.query(`
      ALTER TABLE "products_attributes_colors"
        ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
    `);
    console.log('✓ products_attributes_colors: item_en');

    await client.query(`
      ALTER TABLE "products_attributes_features"
        ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
    `);
    console.log('✓ products_attributes_features: item_en');

    await client.query(`
      ALTER TABLE "products_attributes_tech_params"
        ADD COLUMN IF NOT EXISTS "label_en" varchar(255),
        ADD COLUMN IF NOT EXISTS "value_en" text;
    `);
    console.log('✓ products_attributes_tech_params: label_en, value_en');

    await client.query(`
      ALTER TABLE "products_attributes_applications"
        ADD COLUMN IF NOT EXISTS "item_en" varchar(255);
    `);
    console.log('✓ products_attributes_applications: item_en');

    console.log('\n✅ 所有双语字段迁移完成！');
  } catch (err) {
    console.error('迁移失败:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
刚才