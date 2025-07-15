/*
  Warnings:

  - You are about to drop the column `team1Score` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team2Score` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `player1Score` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `player2Score` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `awayScore` on the `team_league_team_matches` table. All the data in the column will be lost.
  - You are about to drop the column `homeScore` on the `team_league_team_matches` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `team_league_teams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_league_teams" DROP CONSTRAINT "team_league_teams_groupId_fkey";

-- AlterTable
ALTER TABLE "team_league_individual_doubles_matches" DROP COLUMN "team1Score",
DROP COLUMN "team2Score",
ADD COLUMN     "team1_score" INTEGER,
ADD COLUMN     "team2_score" INTEGER;

-- AlterTable
ALTER TABLE "team_league_individual_singles_matches" DROP COLUMN "player1Score",
DROP COLUMN "player2Score",
ADD COLUMN     "player1_score" INTEGER,
ADD COLUMN     "player2_score" INTEGER;

-- AlterTable
ALTER TABLE "team_league_team_matches" DROP COLUMN "awayScore",
DROP COLUMN "homeScore",
ADD COLUMN     "away_score" INTEGER,
ADD COLUMN     "home_score" INTEGER;

-- AlterTable
ALTER TABLE "team_league_teams" DROP COLUMN "groupId",
ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
