-- CreateEnum
CREATE TYPE "LineupVisibility" AS ENUM ('PRIVATE', 'TEAM', 'ALL');

-- CreateEnum
CREATE TYPE "LineupSlotType" AS ENUM ('SINGLES', 'DOUBLES');

-- CreateTable
CREATE TABLE "team_match_lineups" (
    "id" TEXT NOT NULL,
    "team_match_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "visibility" "LineupVisibility" NOT NULL DEFAULT 'PRIVATE',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_match_lineup_slots" (
    "id" TEXT NOT NULL,
    "lineup_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "LineupSlotType" NOT NULL,
    "player1_id" TEXT NOT NULL,
    "player2_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamMatchLineupId" TEXT,

    CONSTRAINT "team_match_lineup_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_match_lineups_team_match_id_team_id_key" ON "team_match_lineups"("team_match_id", "team_id");

-- AddForeignKey
ALTER TABLE "team_match_lineup_slots" ADD CONSTRAINT "team_match_lineup_slots_teamMatchLineupId_fkey" FOREIGN KEY ("teamMatchLineupId") REFERENCES "team_match_lineups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
