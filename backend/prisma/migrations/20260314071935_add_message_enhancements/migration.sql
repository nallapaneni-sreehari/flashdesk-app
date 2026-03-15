-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "contentHtml" TEXT,
ADD COLUMN     "emailMessageId" TEXT;

-- AlterTable
ALTER TABLE "workspaces" RENAME CONSTRAINT "organizations_pkey" TO "workspaces_pkey";

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_attachments_messageId_idx" ON "message_attachments"("messageId");

-- CreateIndex
CREATE INDEX "messages_emailMessageId_idx" ON "messages"("emailMessageId");

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
