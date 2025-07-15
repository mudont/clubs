/*
  Warnings:

  - You are about to drop the column `is_completed` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team1_score` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team2_score` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `player1_score` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `player2_score` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `away_score` on the `team_league_team_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_score` on the `team_league_team_matches` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `team_league_team_matches` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[team_match_id,order]` on the table `team_league_individual_doubles_matches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_match_id,order]` on the table `team_league_individual_singles_matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Winner" AS ENUM ('HOME', 'AWAY');

-- AlterTable
ALTER TABLE "team_league_individual_doubles_matches" DROP COLUMN "is_completed",
DROP COLUMN "team1_score",
DROP COLUMN "team2_score",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "score" TEXT NOT NULL,
ADD COLUMN     "winner" "Winner";

-- AlterTable
ALTER TABLE "team_league_individual_singles_matches" DROP COLUMN "is_completed",
DROP COLUMN "player1_score",
DROP COLUMN "player2_score",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "score" TEXT NOT NULL,
ADD COLUMN     "winner" "Winner";

-- AlterTable
ALTER TABLE "team_league_team_matches" DROP COLUMN "away_score",
DROP COLUMN "home_score",
DROP COLUMN "is_completed";

-- CreateIndex
CREATE UNIQUE INDEX "team_league_individual_doubles_matches_team_match_id_order_key" ON "team_league_individual_doubles_matches"("team_match_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "team_league_individual_singles_matches_team_match_id_order_key" ON "team_league_individual_singles_matches"("team_match_id", "order");
