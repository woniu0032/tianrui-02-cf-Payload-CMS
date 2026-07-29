-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "images" JSONB,
    "content" JSONB,
    "layout" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create news table
CREATE TABLE IF NOT EXISTS "news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB,
    "layout" JSONB,
    "coverImage" TEXT,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS "form_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "messages" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "news_isPublished_idx" ON "news"("isPublished");
CREATE INDEX "news_category_idx" ON "news"("category");
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");
CREATE INDEX "form_submissions_formType_idx" ON "form_submissions"("formType");
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");
CREATE INDEX "chat_sessions_sessionId_idx" ON "chat_sessions"("sessionId");
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");
