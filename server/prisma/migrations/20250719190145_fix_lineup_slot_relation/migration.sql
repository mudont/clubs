/*
  Warnings:

  - You are about to drop the column `teamMatchLineupId` on the `team_match_lineup_slots` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_match_lineup_slots" DROP CONSTRAINT "team_match_lineup_slots_teamMatchLineupId_fkey";

-- AlterTable
ALTER TABLE "team_match_lineup_slots" DROP COLUMN "teamMatchLineupId";

-- AddForeignKey
ALTER TABLE "team_match_lineup_slots" ADD CONSTRAINT "team_match_lineup_slots_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "team_match_lineups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
