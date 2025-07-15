/*
  Warnings:

  - You are about to drop the column `team_league_id` on the `team_league_individual_doubles_matches` table. All the data in the column will be lost.
  - You are about to drop the column `team_league_id` on the `team_league_individual_singles_matches` table. All the data in the column will be lost.
  - Added the required column `team_match_id` to the `team_league_individual_doubles_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_match_id` to the `team_league_individual_singles_matches` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "team_league_individual_doubles_matches" DROP CONSTRAINT "team_league_individual_doubles_matches_team_league_id_fkey";

-- DropForeignKey
ALTER TABLE "team_league_individual_singles_matches" DROP CONSTRAINT "team_league_individual_singles_matches_team_league_id_fkey";

-- AlterTable
ALTER TABLE "team_league_individual_doubles_matches" DROP COLUMN "team_league_id",
ADD COLUMN     "team_match_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_league_individual_singles_matches" DROP COLUMN "team_league_id",
ADD COLUMN     "team_match_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_team_match_id_fkey" FOREIGN KEY ("team_match_id") REFERENCES "team_league_team_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team_match_id_fkey" FOREIGN KEY ("team_match_id") REFERENCES "team_league_team_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
