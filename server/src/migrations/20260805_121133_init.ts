import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) with time zone,
        "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar,
        "role" varchar DEFAULT 'editor' NOT NULL,
        "avatar_id" integer,
        "is_active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "email" varchar NOT NULL,
        "reset_password_token" varchar,
        "reset_password_expiration" timestamp(3) with time zone,
        "salt" varchar,
        "hash" varchar,
        "login_attempts" numeric DEFAULT 0,
        "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
        "id" serial PRIMARY KEY NOT NULL,
        "alt" varchar,
        "caption" varchar,
        "category" varchar DEFAULT 'other',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "url" varchar,
        "thumbnail_u_r_l" varchar,
        "filename" varchar,
        "mime_type" varchar,
        "filesize" numeric,
        "width" numeric,
        "height" numeric,
        "focal_x" numeric,
        "focal_y" numeric,
        "sizes_thumbnail_url" varchar,
        "sizes_thumbnail_width" numeric,
        "sizes_thumbnail_height" numeric,
        "sizes_thumbnail_mime_type" varchar,
        "sizes_thumbnail_filesize" numeric,
        "sizes_thumbnail_filename" varchar,
        "sizes_card_url" varchar,
        "sizes_card_width" numeric,
        "sizes_card_height" numeric,
        "sizes_card_mime_type" varchar,
        "sizes_card_filesize" numeric,
        "sizes_card_filename" varchar,
        "sizes_tablet_url" varchar,
        "sizes_tablet_width" numeric,
        "sizes_tablet_height" numeric,
        "sizes_tablet_mime_type" varchar,
        "sizes_tablet_filesize" numeric,
        "sizes_tablet_filename" varchar
  );

  CREATE TABLE "products_images" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "image_id" integer NOT NULL,
        "sort_order" numeric DEFAULT 0
  );

  CREATE TABLE "products_attributes_specifications" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "label" varchar,
        "value" varchar
  );

  CREATE TABLE "products_attributes_materials" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "item" varchar
  );

  CREATE TABLE "products_attributes_colors" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "item" varchar
  );

  CREATE TABLE "products_attributes_features" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "item" varchar
  );

  CREATE TABLE "products_attributes_tech_params" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "label" varchar,
        "value" varchar
  );

  CREATE TABLE "products_attributes_applications" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "item" varchar
  );

  CREATE TABLE "products" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "description" varchar,
        "price" numeric DEFAULT 0,
        "category" varchar NOT NULL,
        "content" jsonb,
        "layout" jsonb,
        "is_active" boolean DEFAULT true,
        "sort_order" numeric DEFAULT 0,
        "meta_title" varchar,
        "meta_description" varchar,
        "meta_keywords" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "news_tags" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "tag" varchar
  );

  CREATE TABLE "news" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "summary" varchar,
        "content" jsonb,
        "layout" jsonb,
        "cover_image_id" integer,
        "author" varchar DEFAULT '管理员',
        "category" varchar NOT NULL,
        "is_published" boolean DEFAULT false,
        "published_at" timestamp(3) with time zone,
        "view_count" numeric DEFAULT 0,
        "meta_title" varchar,
        "meta_description" varchar,
        "meta_keywords" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "form_submissions" (
        "id" serial PRIMARY KEY NOT NULL,
        "form_type" varchar NOT NULL,
        "data" jsonb,
        "status" varchar DEFAULT 'pending',
        "ip_address" varchar,
        "user_agent" varchar,
        "notes" varchar,
        "processed_by_id" integer,
        "processed_at" timestamp(3) with time zone,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "chat_sessions_messages" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "role" varchar NOT NULL,
        "content" varchar NOT NULL,
        "timestamp" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "chat_sessions" (
        "id" serial PRIMARY KEY NOT NULL,
        "session_id" varchar NOT NULL,
        "user_id" varchar,
        "status" varchar DEFAULT 'active',
        "metadata" jsonb,
        "last_message_at" timestamp(3) with time zone,
        "transferred_to_id" integer,
        "transferred_at" timestamp(3) with time zone,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" varchar NOT NULL,
        "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
        "id" serial PRIMARY KEY NOT NULL,
        "global_slug" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "users_id" integer,
        "media_id" integer,
        "products_id" integer,
        "news_id" integer,
        "form_submissions_id" integer,
        "chat_sessions_id" integer
  );

  CREATE TABLE "payload_preferences" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" varchar,
        "value" jsonb,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_specifications" ADD CONSTRAINT "products_attributes_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_materials" ADD CONSTRAINT "products_attributes_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_colors" ADD CONSTRAINT "products_attributes_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_features" ADD CONSTRAINT "products_attributes_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_tech_params" ADD CONSTRAINT "products_attributes_tech_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_applications" ADD CONSTRAINT "products_attributes_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_sessions_messages" ADD CONSTRAINT "chat_sessions_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_transferred_to_id_users_id_fk" FOREIGN KEY ("transferred_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_sessions_fk" FOREIGN KEY ("chat_sessions_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_attributes_specifications_order_idx" ON "products_attributes_specifications" USING btree ("_order");
  CREATE INDEX "products_attributes_specifications_parent_id_idx" ON "products_attributes_specifications" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_materials_order_idx" ON "products_attributes_materials" USING btree ("_order");
  CREATE INDEX "products_attributes_materials_parent_id_idx" ON "products_attributes_materials" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_colors_order_idx" ON "products_attributes_colors" USING btree ("_order");
  CREATE INDEX "products_attributes_colors_parent_id_idx" ON "products_attributes_colors" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_features_order_idx" ON "products_attributes_features" USING btree ("_order");
  CREATE INDEX "products_attributes_features_parent_id_idx" ON "products_attributes_features" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_tech_params_order_idx" ON "products_attributes_tech_params" USING btree ("_order");
  CREATE INDEX "products_attributes_tech_params_parent_id_idx" ON "products_attributes_tech_params" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_applications_order_idx" ON "products_attributes_applications" USING btree ("_order");
  CREATE INDEX "products_attributes_applications_parent_id_idx" ON "products_attributes_applications" USING btree ("_parent_id");
  CREATE INDEX "products_name_idx" ON "products" USING btree ("name");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category");
  CREATE INDEX "products_is_active_idx" ON "products" USING btree ("is_active");
  CREATE INDEX "products_sort_order_idx" ON "products" USING btree ("sort_order");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "news_tags_order_idx" ON "news_tags" USING btree ("_order");
  CREATE INDEX "news_tags_parent_id_idx" ON "news_tags" USING btree ("_parent_id");
  CREATE INDEX "news_title_idx" ON "news" USING btree ("title");
  CREATE INDEX "news_cover_image_idx" ON "news" USING btree ("cover_image_id");
  CREATE INDEX "news_category_idx" ON "news" USING btree ("category");
  CREATE INDEX "news_is_published_idx" ON "news" USING btree ("is_published");
  CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "form_submissions_form_type_idx" ON "form_submissions" USING btree ("form_type");
  CREATE INDEX "form_submissions_status_idx" ON "form_submissions" USING btree ("status");
  CREATE INDEX "form_submissions_processed_by_idx" ON "form_submissions" USING btree ("processed_by_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "chat_sessions_messages_order_idx" ON "chat_sessions_messages" USING btree ("_order");
  CREATE INDEX "chat_sessions_messages_parent_id_idx" ON "chat_sessions_messages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "chat_sessions_session_id_idx" ON "chat_sessions" USING btree ("session_id");
  CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions" USING btree ("status");
  CREATE INDEX "chat_sessions_last_message_at_idx" ON "chat_sessions" USING btree ("last_message_at");
  CREATE INDEX "chat_sessions_transferred_to_idx" ON "chat_sessions" USING btree ("transferred_to_id");
  CREATE INDEX "chat_sessions_updated_at_idx" ON "chat_sessions" USING btree ("updated_at");
  CREATE INDEX "chat_sessions_created_at_idx" ON "chat_sessions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_chat_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_sessions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_attributes_specifications" CASCADE;
  DROP TABLE "products_attributes_materials" CASCADE;
  DROP TABLE "products_attributes_colors" CASCADE;
  DROP TABLE "products_attributes_features" CASCADE;
  DROP TABLE "products_attributes_tech_params" CASCADE;
  DROP TABLE "products_attributes_applications" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "news_tags" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "chat_sessions_messages" CASCADE;
  DROP TABLE "chat_sessions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;`)
}