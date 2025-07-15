/*
  Warnings:

  - A unique constraint covering the columns `[team_league_id,match_type,order]` on the table `team_league_point_systems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `match_type` to the `team_league_point_systems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `team_league_point_systems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SINGLES', 'DOUBLES');

-- DropIndex
DROP INDEX "team_league_point_systems_team_league_id_key";

-- AlterTable
ALTER TABLE "team_league_point_systems" ADD COLUMN     "match_type" "MatchType" NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ALTER COLUMN "draw_points" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "team_league_point_systems_team_league_id_match_type_order_key" ON "team_league_point_systems"("team_league_id", "match_type", "order");
