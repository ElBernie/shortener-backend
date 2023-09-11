-- DropForeignKey
ALTER TABLE "Links" DROP CONSTRAINT "Links_userId_fkey";

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
