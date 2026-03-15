/*
  Warnings:

  - You are about to drop the column `organizationId` on the `tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_organizationId_fkey";

-- DropIndex
DROP INDEX "tickets_organizationId_status_idx";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "organizationId";

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
