/*
  Warnings:

  - You are about to drop the `team_league_team_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_league_team_members" DROP CONSTRAINT "team_league_team_members_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_team_members" DROP CONSTRAINT "team_league_team_members_user_id_fkey";

-- DropTable
DROP TABLE "team_league_team_members";
