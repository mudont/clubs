-- CreateTable
CREATE TABLE "team_leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "season" TEXT NOT NULL,

    CONSTRAINT "team_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_league_point_systems" (
    "id" TEXT NOT NULL,
    "team_league_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "win_points" INTEGER NOT NULL,

    CONSTRAINT "team_league_point_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_league_teams" (
    "id" TEXT NOT NULL,
    "team_league_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "team_league_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_league_team_matches" (
    "id" TEXT NOT NULL,
    "team_league_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,

    CONSTRAINT "team_league_team_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_league_individual_singles_matches" (
    "id" TEXT NOT NULL,
    "team_match_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "home_player_id" TEXT NOT NULL,
    "away_player_id" TEXT NOT NULL,
    "score" TEXT,
    "winner" TEXT,

    CONSTRAINT "team_league_individual_singles_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_league_individual_doubles_matches" (
    "id" TEXT NOT NULL,
    "team_match_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "home_player1_id" TEXT NOT NULL,
    "home_player2_id" TEXT NOT NULL,
    "away_player1_id" TEXT NOT NULL,
    "away_player2_id" TEXT NOT NULL,
    "score" TEXT,
    "winner" TEXT,

    CONSTRAINT "team_league_individual_doubles_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_league_teams_team_league_id_group_id_key" ON "team_league_teams"("team_league_id", "group_id");

-- AddForeignKey
ALTER TABLE "team_league_point_systems" ADD CONSTRAINT "team_league_point_systems_team_league_id_fkey" FOREIGN KEY ("team_league_id") REFERENCES "team_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_team_league_id_fkey" FOREIGN KEY ("team_league_id") REFERENCES "team_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_teams" ADD CONSTRAINT "team_league_teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_matches" ADD CONSTRAINT "team_league_team_matches_team_league_id_fkey" FOREIGN KEY ("team_league_id") REFERENCES "team_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_matches" ADD CONSTRAINT "team_league_team_matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "team_league_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_team_matches" ADD CONSTRAINT "team_league_team_matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "team_league_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_team_match_id_fkey" FOREIGN KEY ("team_match_id") REFERENCES "team_league_team_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_home_player_id_fkey" FOREIGN KEY ("home_player_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_singles_matches" ADD CONSTRAINT "team_league_individual_singles_matches_away_player_id_fkey" FOREIGN KEY ("away_player_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_team_match_id_fkey" FOREIGN KEY ("team_match_id") REFERENCES "team_league_team_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_home_player1_id_fkey" FOREIGN KEY ("home_player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_home_player2_id_fkey" FOREIGN KEY ("home_player2_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_away_player1_id_fkey" FOREIGN KEY ("away_player1_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_league_individual_doubles_matches" ADD CONSTRAINT "team_league_individual_doubles_matches_away_player2_id_fkey" FOREIGN KEY ("away_player2_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
