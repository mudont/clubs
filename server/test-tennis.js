const { PrismaClient } = require('@prisma/client');

async function testTennisQuery() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing tennis leagues query...');

    // Test basic query
    const leagues = await prisma.teamLeague.findMany();
    console.log('Found leagues:', leagues.length);
    console.log('Leagues:', leagues);

    // Test with includes
    const leaguesWithIncludes = await prisma.teamLeague.findMany({
      include: {
        pointSystem: true,
        teams: {
          include: {
            captain: true,
            members: true,
          },
        },
        teamMatches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        individualSinglesMatches: {
          include: {
            player1: true,
            player2: true,
          },
        },
        individualDoublesMatches: {
          include: {
            team1Player1: true,
            team1Player2: true,
            team2Player1: true,
            team2Player2: true,
          },
        },
      },
    });

    console.log('Leagues with includes:', leaguesWithIncludes.length);
    console.log('First league structure:', JSON.stringify(leaguesWithIncludes[0], null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTennisQuery();
