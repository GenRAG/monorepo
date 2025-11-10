-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetLastSentAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" INTEGER;
