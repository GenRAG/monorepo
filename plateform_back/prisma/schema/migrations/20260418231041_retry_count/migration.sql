-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "indexError" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
