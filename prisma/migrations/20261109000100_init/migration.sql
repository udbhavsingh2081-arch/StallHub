-- FoodStallHub Complete Multi-Tenant Database Schema

-- Enums
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'STALL_OWNER', 'STALL_MANAGER', 'STALL_STAFF', 'SHOP_ADMIN');
CREATE TYPE "StallStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE "MenuStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "FoodType" AS ENUM ('VEG', 'NON_VEG', 'EGG');
CREATE TYPE "StallMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');
CREATE TYPE "ThemeTemplate" AS ENUM ('LUXURY', 'MINIMAL', 'STREET_FOOD', 'FRESH');
CREATE TYPE "LayoutType" AS ENUM ('GRID', 'LIST', 'COMPACT');
CREATE TYPE "AnalyticsEventType" AS ENUM ('MENU_VIEW', 'QR_SCAN', 'CATEGORY_VIEW', 'ITEM_VIEW');

-- Stall (Multi-Tenant Core)
CREATE TABLE "Stall" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "tagline" TEXT,
  "cuisineType" TEXT,
  "logoUrl" TEXT,
  "coverUrl" TEXT,
  "address" TEXT,
  "city" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "status" "StallStatus" NOT NULL DEFAULT 'ACTIVE',
  "menuStatus" "MenuStatus" NOT NULL DEFAULT 'DRAFT',
  "primaryColor" TEXT NOT NULL DEFAULT '#142235',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Stall_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Stall_slug_key" ON "Stall"("slug");
CREATE INDEX "Stall_status_idx" ON "Stall"("status");
CREATE INDEX "Stall_slug_idx" ON "Stall"("slug");

-- User (Platform and Stall Users)
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'STALL_OWNER',
  "phone" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "stallId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_stallId_idx" ON "User"("stallId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_email_idx" ON "User"("email");
ALTER TABLE "User" ADD CONSTRAINT "User_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Stall Member (Granular RBAC)
CREATE TABLE "StallMember" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "StallMemberRole" NOT NULL DEFAULT 'STAFF',
  "canAddItems" BOOLEAN NOT NULL DEFAULT true,
  "canEditPrices" BOOLEAN NOT NULL DEFAULT false,
  "canManageCategories" BOOLEAN NOT NULL DEFAULT false,
  "canCustomizeMenu" BOOLEAN NOT NULL DEFAULT false,
  "canManageStaff" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StallMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StallMember_stallId_userId_key" ON "StallMember"("stallId", "userId");
CREATE INDEX "StallMember_stallId_idx" ON "StallMember"("stallId");
CREATE INDEX "StallMember_userId_idx" ON "StallMember"("userId");
ALTER TABLE "StallMember" ADD CONSTRAINT "StallMember_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StallMember" ADD CONSTRAINT "StallMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Category
CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_stallId_name_key" ON "Category"("stallId", "name");
CREATE UNIQUE INDEX "Category_id_stallId_key" ON "Category"("id", "stallId");
CREATE INDEX "Category_stallId_sortOrder_idx" ON "Category"("stallId", "sortOrder");
ALTER TABLE "Category" ADD CONSTRAINT "Category_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FoodItem
CREATE TABLE "FoodItem" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "foodType" "FoodType" NOT NULL DEFAULT 'VEG',
  "basePriceMinor" INTEGER NOT NULL,
  "discountPriceMinor" INTEGER,
  "currencyCode" TEXT NOT NULL DEFAULT 'INR',
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "prepTimeMinutes" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FoodItem_stallId_categoryId_idx" ON "FoodItem"("stallId", "categoryId");
CREATE INDEX "FoodItem_stallId_isAvailable_idx" ON "FoodItem"("stallId", "isAvailable");
CREATE INDEX "FoodItem_stallId_foodType_idx" ON "FoodItem"("stallId", "foodType");
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_categoryId_stallId_fkey" FOREIGN KEY ("categoryId", "stallId") REFERENCES "Category"("id", "stallId") ON DELETE CASCADE ON UPDATE CASCADE;

-- FoodVariant
CREATE TABLE "FoodVariant" (
  "id" TEXT NOT NULL,
  "foodItemId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "priceMinor" INTEGER NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodVariant_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FoodVariant_foodItemId_idx" ON "FoodVariant"("foodItemId");
ALTER TABLE "FoodVariant" ADD CONSTRAINT "FoodVariant_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- StallTheme (Customization Engine)
CREATE TABLE "StallTheme" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "templateId" "ThemeTemplate" NOT NULL DEFAULT 'MINIMAL',
  "primaryColor" TEXT NOT NULL DEFAULT '#142235',
  "secondaryColor" TEXT NOT NULL DEFAULT '#E8A64A',
  "backgroundColor" TEXT NOT NULL DEFAULT '#F5F7FA',
  "accentColor" TEXT NOT NULL DEFAULT '#27364A',
  "fontHeading" TEXT NOT NULL DEFAULT 'Manrope',
  "fontBody" TEXT NOT NULL DEFAULT 'DM Sans',
  "layoutType" "LayoutType" NOT NULL DEFAULT 'GRID',
  "categoryStyle" TEXT NOT NULL DEFAULT 'TABS',
  "cardStyle" TEXT NOT NULL DEFAULT 'COMPACT',
  "isHeaderSticky" BOOLEAN NOT NULL DEFAULT true,
  "showCoverBanner" BOOLEAN NOT NULL DEFAULT true,
  "bannerHeight" INTEGER NOT NULL DEFAULT 220,
  "socialLinks" JSONB,
  "customSettings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StallTheme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StallTheme_stallId_key" ON "StallTheme"("stallId");
ALTER TABLE "StallTheme" ADD CONSTRAINT "StallTheme_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MenuPublication (Snapshot Engine for Draft & Published isolation)
CREATE TABLE "MenuPublication" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "snapshot" JSONB NOT NULL,
  "publishedByUserId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MenuPublication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MenuPublication_stallId_isActive_idx" ON "MenuPublication"("stallId", "isActive");
CREATE INDEX "MenuPublication_stallId_version_idx" ON "MenuPublication"("stallId", "version");
ALTER TABLE "MenuPublication" ADD CONSTRAINT "MenuPublication_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuPublication" ADD CONSTRAINT "MenuPublication_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- QRCode Management
CREATE TABLE "QRCode" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "qrUrl" TEXT NOT NULL,
  "foregroundColor" TEXT NOT NULL DEFAULT '#000000',
  "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
  "includeLogo" BOOLEAN NOT NULL DEFAULT true,
  "scanCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QRCode_stallId_key" ON "QRCode"("stallId");
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AnalyticsEvent
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "stallId" TEXT NOT NULL,
  "eventType" "AnalyticsEventType" NOT NULL DEFAULT 'MENU_VIEW',
  "entityId" TEXT,
  "visitorHash" TEXT,
  "userAgent" TEXT,
  "referrer" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnalyticsEvent_stallId_eventType_createdAt_idx" ON "AnalyticsEvent"("stallId", "eventType", "createdAt");
CREATE INDEX "AnalyticsEvent_stallId_visitorHash_idx" ON "AnalyticsEvent"("stallId", "visitorHash");
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "details" JSONB,
  "actorId" TEXT,
  "stallId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_stallId_createdAt_idx" ON "AuditLog"("stallId", "createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PostgreSQL Session Table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
