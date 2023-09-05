-- AlterTable
ALTER TABLE "User" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validationToken" TEXT;
