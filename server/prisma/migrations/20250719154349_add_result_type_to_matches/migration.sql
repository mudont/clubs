-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('C', 'TM', 'D', 'NONE');

-- AlterTable
ALTER TABLE "team_league_individual_doubles_matches" ADD COLUMN     "result_type" "ResultType" DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "team_league_individual_singles_matches" ADD COLUMN     "result_type" "ResultType" DEFAULT 'NONE';
