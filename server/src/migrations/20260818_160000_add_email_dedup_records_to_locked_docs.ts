import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "email_dedup_records_id" integer;
    
    CREATE INDEX IF NOT EXISTS "idx_pldr_email_dedup_records" 
      ON "payload_locked_documents_rels" ("email_dedup_records_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "idx_pldr_email_dedup_records";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "email_dedup_records_id";
  `)
}
