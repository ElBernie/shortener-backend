/*
  Warnings:

  - You are about to drop the column `url` on the `Links` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alias]` on the table `Links` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `URLId` to the `Links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alias` to the `Links` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Links" DROP CONSTRAINT "Links_userId_fkey";

-- AlterTable
ALTER TABLE "Links" DROP COLUMN "url",
ADD COLUMN     "URLId" TEXT NOT NULL,
ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "host" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "URL" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "host" TEXT,
    "protocol" TEXT DEFAULT 'https',
    "pathname" TEXT,
    "search" TEXT,
    "hash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "URL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "host" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "ageRestricted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("host")
);

-- CreateIndex
CREATE UNIQUE INDEX "URL_url_key" ON "URL"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "Domain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "Links_alias_key" ON "Links"("alias");

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_URLId_fkey" FOREIGN KEY ("URLId") REFERENCES "URL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_host_fkey" FOREIGN KEY ("host") REFERENCES "Domain"("host") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "URL" ADD CONSTRAINT "URL_host_fkey" FOREIGN KEY ("host") REFERENCES "Domain"("host") ON DELETE SET NULL ON UPDATE CASCADE;
