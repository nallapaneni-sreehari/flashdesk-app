-- Rename organizations table to workspaces
ALTER TABLE "organizations" RENAME TO "workspaces";

-- Rename organizationId → workspaceId in users
ALTER TABLE "users" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in customers
ALTER TABLE "customers" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in tags
ALTER TABLE "tags" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in sla_policies
ALTER TABLE "sla_policies" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in canned_response_categories
ALTER TABLE "canned_response_categories" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in canned_responses
ALTER TABLE "canned_responses" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in kb_categories
ALTER TABLE "kb_categories" RENAME COLUMN "organizationId" TO "workspaceId";

-- Rename organizationId → workspaceId in kb_articles
ALTER TABLE "kb_articles" RENAME COLUMN "organizationId" TO "workspaceId";

-- Add workspaceId to tickets (was dropped in earlier migration, schema wants it back as optional)
ALTER TABLE "tickets" ADD COLUMN "workspaceId" TEXT;

-- Create companies table
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Add companyId to customers
ALTER TABLE "customers" ADD COLUMN "companyId" TEXT;

-- Drop old foreign key constraints (referencing old table/column names)
ALTER TABLE "users" DROP CONSTRAINT "users_organizationId_fkey";
ALTER TABLE "customers" DROP CONSTRAINT "customers_organizationId_fkey";
ALTER TABLE "tags" DROP CONSTRAINT "tags_organizationId_fkey";
ALTER TABLE "sla_policies" DROP CONSTRAINT "sla_policies_organizationId_fkey";
ALTER TABLE "canned_response_categories" DROP CONSTRAINT "canned_response_categories_organizationId_fkey";
ALTER TABLE "canned_responses" DROP CONSTRAINT "canned_responses_organizationId_fkey";
ALTER TABLE "kb_categories" DROP CONSTRAINT "kb_categories_organizationId_fkey";
ALTER TABLE "kb_articles" DROP CONSTRAINT "kb_articles_organizationId_fkey";

-- Drop old unique constraints and indexes (referencing old column names)
DROP INDEX IF EXISTS "organizations_slug_key";
DROP INDEX IF EXISTS "customers_organizationId_email_key";
DROP INDEX IF EXISTS "tags_organizationId_name_key";
DROP INDEX IF EXISTS "canned_response_categories_organizationId_name_key";
DROP INDEX IF EXISTS "canned_responses_organizationId_shortcut_key";
DROP INDEX IF EXISTS "kb_categories_organizationId_slug_key";
DROP INDEX IF EXISTS "kb_articles_organizationId_status_idx";
DROP INDEX IF EXISTS "kb_articles_organizationId_slug_key";

-- Create new unique constraint on workspaces
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- Create new foreign key constraints (referencing renamed table/columns)
ALTER TABLE "users" ADD CONSTRAINT "users_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sla_policies" ADD CONSTRAINT "sla_policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "canned_response_categories" ADD CONSTRAINT "canned_response_categories_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kb_categories" ADD CONSTRAINT "kb_categories_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create new indexes
CREATE UNIQUE INDEX "customers_workspaceId_email_key" ON "customers"("workspaceId", "email");
CREATE UNIQUE INDEX "tags_workspaceId_name_key" ON "tags"("workspaceId", "name");
CREATE UNIQUE INDEX "canned_response_categories_workspaceId_name_key" ON "canned_response_categories"("workspaceId", "name");
CREATE UNIQUE INDEX "canned_responses_workspaceId_shortcut_key" ON "canned_responses"("workspaceId", "shortcut");
CREATE UNIQUE INDEX "kb_categories_workspaceId_slug_key" ON "kb_categories"("workspaceId", "slug");
CREATE INDEX "kb_articles_workspaceId_status_idx" ON "kb_articles"("workspaceId", "status");
CREATE UNIQUE INDEX "kb_articles_workspaceId_slug_key" ON "kb_articles"("workspaceId", "slug");
CREATE INDEX "tickets_workspaceId_idx" ON "tickets"("workspaceId");
CREATE UNIQUE INDEX "companies_workspaceId_name_key" ON "companies"("workspaceId", "name");
CREATE INDEX "companies_workspaceId_idx" ON "companies"("workspaceId");
CREATE INDEX "customers_companyId_idx" ON "customers"("companyId");
