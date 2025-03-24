/*
  Warnings:

  - A unique constraint covering the columns `[oauth_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "oauth_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_oauth_id_key" ON "users"("oauth_id");
