/*
  Warnings:

  - A unique constraint covering the columns `[home_team_event_id]` on the table `team_league_team_matches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[away_team_event_id]` on the table `team_league_team_matches` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "team_league_team_matches" ADD COLUMN     "away_team_event_id" TEXT,
ADD COLUMN     "home_team_event_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "team_league_team_matches_home_team_event_id_key" ON "team_league_team_matches"("home_team_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_league_team_matches_away_team_event_id_key" ON "team_league_team_matches"("away_team_event_id");

-- AddForeignKey
ALTER TABLE "team_league_team_matches" ADD CONSTRAINT "team_league_team_matches_home_team_event_id_fkey" FOREIGN KEY ("home_team_event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_matches" ADD CONSTRAINT "team_league_team_matches_away_team_event_id_fkey" FOREIGN KEY ("away_team_event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
