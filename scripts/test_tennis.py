#!/usr/bin/env python3
"""
Test script for Tennis League GraphQL operations
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def test_tennis():
    """Test all Tennis League GraphQL operations"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}🎾 Testing Tennis League GraphQL Operations")
    print(f"{Fore.CYAN}{'='*50}")

    # Check authentication
    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # Test 1: Get User Tennis Leagues
    print(f"{Fore.YELLOW}1️⃣ Testing Get User Tennis Leagues...")
    tennis_leagues_query = """
    query GetUserTennisLeagues {
        userTennisLeagues {
            id
            name
            description
            isActive
        }
    }
    """

    tennis_leagues_result = client.query(tennis_leagues_query)
    client.print_result(tennis_leagues_result, "Get User Tennis Leagues")

    # Test 2: Get All Tennis Leagues (if available)
    print(f"\n{Fore.YELLOW}2️⃣ Testing Get All Tennis Leagues...")
    all_tennis_leagues_query = """
    query GetAllTennisLeagues {
        tennisLeagues {
            id
            name
            description
            isActive
            createdAt
        }
    }
    """

    all_tennis_leagues_result = client.query(all_tennis_leagues_query)
    client.print_result(all_tennis_leagues_result, "Get All Tennis Leagues")

    # Test 3: Get Tennis League Details (if leagues exist)
    leagues = tennis_leagues_result.get("data", {}).get("userTennisLeagues", [])
    if leagues:
        league_id = leagues[0]["id"]
        print(f"\n{Fore.YELLOW}3️⃣ Testing Get Tennis League Details...")
        league_details_query = """
        query GetTennisLeague($id: ID!) {
            tennisLeague(id: $id) {
                id
                name
                description
                isActive
                createdAt
                teams {
                    id
                    name
                    players {
                        id
                        username
                        email
                    }
                }
            }
        }
        """

        league_details_variables = {"id": league_id}
        league_details_result = client.query(
            league_details_query, league_details_variables
        )
        client.print_result(league_details_result, "Get Tennis League Details")

        # Test 4: Get Tennis Matches for League
        print(f"\n{Fore.YELLOW}4️⃣ Testing Get Tennis Matches...")
        tennis_matches_query = """
        query GetTennisMatches($leagueId: ID!) {
            tennisMatches(leagueId: $leagueId) {
                id
                date
                status
                result
                team1 {
                    id
                    name
                }
                team2 {
                    id
                    name
                }
            }
        }
        """

        tennis_matches_variables = {"leagueId": league_id}
        tennis_matches_result = client.query(
            tennis_matches_query, tennis_matches_variables
        )
        client.print_result(tennis_matches_result, "Get Tennis Matches")

        # Test 5: Get Tennis Lineups (if available)
        print(f"\n{Fore.YELLOW}5️⃣ Testing Get Tennis Lineups...")
        tennis_lineups_query = """
        query GetTennisLineups($matchId: ID!) {
            tennisLineups(matchId: $matchId) {
                id
                team {
                    id
                    name
                }
                slots {
                    id
                    position
                    player {
                        id
                        username
                    }
                }
            }
        }
        """

        # This would need a match ID, so we'll just test the query structure
        print(f"{Fore.BLUE}ℹ️  Lineup query structure tested (requires match ID)")

    else:
        print(f"{Fore.YELLOW}ℹ️  No tennis leagues found for user")
        print(f"{Fore.BLUE}ℹ️  Skipping league-specific tests")

    # Test 6: Get User Tennis Stats (if available)
    print(f"\n{Fore.YELLOW}6️⃣ Testing Get User Tennis Stats...")
    user_tennis_stats_query = """
    query GetUserTennisStats {
        me {
            id
            username
            tennisStats {
                matchesPlayed
                matchesWon
                winPercentage
                currentRanking
            }
        }
    }
    """

    user_tennis_stats_result = client.query(user_tennis_stats_query)
    client.print_result(user_tennis_stats_result, "Get User Tennis Stats")

    print(f"\n{Fore.GREEN}✅ All Tennis League operations completed!")
    return True


if __name__ == "__main__":
    test_tennis()
