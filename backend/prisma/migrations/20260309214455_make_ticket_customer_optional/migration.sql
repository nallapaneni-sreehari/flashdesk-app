-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_customerId_fkey";

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
