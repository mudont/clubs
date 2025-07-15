/*
  Warnings:

  - You are about to drop the column `description` on the `team_league_teams` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `team_league_teams` table. All the data in the column will be lost.
  - Made the column `group_id` on table `team_league_teams` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "team_league_teams" DROP CONSTRAINT "team_league_teams_group_id_fkey";

-- AlterTable
ALTER TABLE "team_league_teams" DROP COLUMN "description",
DROP COLUMN "name",
ALTER COLUMN "group_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
