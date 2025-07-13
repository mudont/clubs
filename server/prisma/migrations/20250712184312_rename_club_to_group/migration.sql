/*
  Warnings:

  - You are about to drop the column `club_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `club_id` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `club_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `clubs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[group_id,member_id]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,group_id]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_id` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_club_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_club_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_club_id_fkey";

-- DropIndex
DROP INDEX "memberships_club_id_member_id_key";

-- DropIndex
DROP INDEX "memberships_user_id_club_id_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "club_id",
ADD COLUMN     "group_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "club_id",
ADD COLUMN     "group_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "club_id",
ADD COLUMN     "group_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "clubs";

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memberships_group_id_member_id_key" ON "memberships"("group_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_group_id_key" ON "memberships"("user_id", "group_id");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
