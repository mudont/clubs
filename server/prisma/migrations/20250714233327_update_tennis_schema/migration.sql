/*
  Warnings:

  - You are about to drop the column `away_player1_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `away_player2_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_player1_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_player2_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team_match_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `away_player_id` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_player_id` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team_match_id` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `team_league_point_systems` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `team_league_point_systems` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `team_league_team_matches` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `team_league_teams` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `team_leagues` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `team_leagues` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[team_league_id]` on the table `team_league_point_systems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `match_date` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team1_player1_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team1_player2_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2_player1_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2_player2_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_league_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_date` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player1_id` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player2_id` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_league_id` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_date` to the `team_league_team_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `captain_id` to the `team_league_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `team_league_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `team_leagues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `team_leagues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `team_leagues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_away_player1_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_away_player2_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_home_player1_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_home_player2_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_team_match_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_singles_matches" DROP CONSTRAINT "team_league_individual_singles_matches_away_player_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_singles_matches" DROP CONSTRAINT "team_league_individual_singles_matches_home_player_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_singles_matches" DROP CONSTRAINT "team_league_individual_singles_matches_team_match_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_teams" DROP CONSTRAINT "team_league_teams_group_id_fkey";

-- DropIndex
DROP INDEX "team_league_teams_team_league_id_group_id_key";

-- AlterTable
ALTER TABLE "team_league_individual_doubles_matches" DROP COLUMN "away_player1_id",
DROP COLUMN "away_player2_id",
DROP COLUMN "home_player1_id",
DROP COLUMN "home_player2_id",
DROP COLUMN "order",
DROP COLUMN "score",
DROP COLUMN "team_match_id",
DROP COLUMN "winner",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "match_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "team1Score" INTEGER,
ADD COLUMN     "team1_player1_id" TEXT NOT NULL,
ADD COLUMN     "team1_player2_id" TEXT NOT NULL,
ADD COLUMN     "team2Score" INTEGER,
ADD COLUMN     "team2_player1_id" TEXT NOT NULL,
ADD COLUMN     "team2_player2_id" TEXT NOT NULL,
ADD COLUMN     "team_league_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_league_individual_singles_matches" DROP COLUMN "away_player_id",
DROP COLUMN "home_player_id",
DROP COLUMN "order",
DROP COLUMN "score",
DROP COLUMN "team_match_id",
DROP COLUMN "winner",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "match_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "player1Score" INTEGER,
ADD COLUMN     "player1_id" TEXT NOT NULL,
ADD COLUMN     "player2Score" INTEGER,
ADD COLUMN     "player2_id" TEXT NOT NULL,
ADD COLUMN     "team_league_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_league_point_systems" DROP COLUMN "order",
DROP COLUMN "type",
ADD COLUMN     "default_draw_points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "default_loss_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "default_win_points" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "draw_points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "loss_points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "win_points" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "team_league_team_matches" DROP COLUMN "date",
ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "homeScore" INTEGER,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "match_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "team_league_teams" DROP COLUMN "group_id",
ADD COLUMN     "captain_id" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_leagues" DROP COLUMN "season",
DROP COLUMN "year",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "team_league_team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "team_league_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_league_team_members_team_id_user_id_key" ON "team_league_team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_league_point_systems_team_league_id_key" ON "team_league_point_systems"("team_league_id");

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_members" ADD CONSTRAINT "team_league_team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team_league_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_members" ADD CONSTRAINT "team_league_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_team_league_id_fkey" FOREIGN KEY ("team_league_id") REFERENCES "team_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team1_player1_id_fkey" FOREIGN KEY ("team1_player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team1_player2_id_fkey" FOREIGN KEY ("team1_player2_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team2_player1_id_fkey" FOREIGN KEY ("team2_player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team2_player2_id_fkey" FOREIGN KEY ("team2_player2_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team_league_id_fkey" FOREIGN KEY ("team_league_id") REFERENCES "team_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
