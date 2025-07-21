#!/usr/bin/env python3
"""
Test script for the expenses module
"""

import json
import os
import sys
from datetime import datetime

import requests

# Add the parent directory to the path to import the graphql client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.graphql_client import GraphQLClient


def test_expenses_module():
    """Test the expenses module functionality"""

    # Initialize the GraphQL client
    client = GraphQLClient()

    # Check if we have a token
    if not client.load_token():
        print("❌ No authentication token found. Please run login.py first.")
        return False

    print("🔐 Using authentication token")

    # Test 1: Get groups to find a test group
    print("\n📋 Testing: Get user's groups")
    try:
        groups_query = """
        query {
            myGroups {
                id
                name
                description
                memberships {
                    user {
                        id
                        username
                        firstName
                        lastName
                    }
                    isAdmin
                }
            }
        }
        """

        result = client.query(groups_query)
        groups = result.get("data", {}).get("myGroups", [])

        if not groups:
            print("❌ No groups found. Please create a group first.")
            return False

        test_group = groups[0]
        print(f"✅ Found test group: {test_group['name']} (ID: {test_group['id']})")

    except Exception as e:
        print(f"❌ Error getting groups: {e}")
        return False

    # Test 2: Get group expenses (should be empty initially)
    print("\n💰 Testing: Get group expenses")
    try:
        expenses_query = """
        query GetGroupExpenses($groupId: ID!) {
            groupExpenses(groupId: $groupId, limit: 10) {
                id
                description
                amount
                currency
                category
                date
                splitType
                paidBy {
                    id
                    username
                    firstName
                    lastName
                }
                splits {
                    id
                    amount
                    percentage
                    shares
                    user {
                        id
                        username
                        firstName
                        lastName
                    }
                }
            }
        }
        """

        result = client.query(expenses_query, {"groupId": test_group["id"]})
        expenses = result.get("data", {}).get("groupExpenses", [])
        print(f"✅ Found {len(expenses)} expenses in group")

    except Exception as e:
        print(f"❌ Error getting expenses: {e}")
        return False

    # Test 3: Get debt summary
    print("\n📊 Testing: Get debt summary")
    try:
        debt_query = """
        query GetGroupDebtSummary($groupId: ID!) {
            groupDebtSummary(groupId: $groupId) {
                user {
                    id
                    username
                    firstName
                    lastName
                }
                totalOwed
                totalOwedTo
                netAmount
                debts {
                    toUser {
                        id
                        username
                        firstName
                        lastName
                    }
                    amount
                    currency
                }
            }
        }
        """

        result = client.query(debt_query, {"groupId": test_group["id"]})
        debt_summary = result.get("data", {}).get("groupDebtSummary", [])
        print(f"✅ Found debt summary for {len(debt_summary)} members")

        # Show debt summary
        for debt in debt_summary:
            user = debt["user"]
            print(
                f"   {user['firstName']} {user['lastName']}: ${debt['netAmount']:.2f}"
            )

    except Exception as e:
        print(f"❌ Error getting debt summary: {e}")
        return False

    # Test 4: Get group settlements
    print("\n💸 Testing: Get group settlements")
    try:
        settlements_query = """
        query GetGroupSettlements($groupId: ID!) {
            groupSettlements(groupId: $groupId) {
                id
                amount
                currency
                status
                paymentMethod
                notes
                paidAt
                fromUser {
                    id
                    username
                    firstName
                    lastName
                }
                toUser {
                    id
                    username
                    firstName
                    lastName
                }
            }
        }
        """

        result = client.query(settlements_query, {"groupId": test_group["id"]})
        settlements = result.get("data", {}).get("groupSettlements", [])
        print(f"✅ Found {len(settlements)} settlements in group")

    except Exception as e:
        print(f"❌ Error getting settlements: {e}")
        return False

    # Test 5: Get group settings
    print("\n⚙️ Testing: Get group settings")
    try:
        settings_query = """
        query GetGroupSettings($groupId: ID!) {
            groupSettings(groupId: $groupId) {
                id
                defaultCurrency
                allowExpenses
                expenseLimit
                requireApproval
                autoSettle
            }
        }
        """

        result = client.query(settings_query, {"groupId": test_group["id"]})
        settings = result.get("data", {}).get("groupSettings")

        if settings:
            print(f"✅ Group settings found:")
            print(f"   Default currency: {settings['defaultCurrency']}")
            print(f"   Allow expenses: {settings['allowExpenses']}")
            print(f"   Auto settle: {settings['autoSettle']}")
        else:
            print("ℹ️ No group settings found (will be created automatically)")

    except Exception as e:
        print(f"❌ Error getting group settings: {e}")
        return False

    # Test 6: Create a test expense (if there are at least 2 members)
    if len(test_group["memberships"]) >= 2:
        print("\n➕ Testing: Create test expense")
        try:
            # Get first two members for the expense
            member1 = test_group["memberships"][0]["user"]
            member2 = test_group["memberships"][1]["user"]

            create_expense_mutation = """
            mutation CreateExpense($input: CreateExpenseInput!) {
                createExpense(input: $input) {
                    id
                    description
                    amount
                    currency
                    category
                    date
                    splitType
                    paidBy {
                        id
                        username
                        firstName
                        lastName
                    }
                    splits {
                        id
                        amount
                        percentage
                        shares
                        user {
                            id
                            username
                            firstName
                            lastName
                        }
                    }
                }
            }
            """

            expense_input = {
                "groupId": test_group["id"],
                "description": "Test expense for lunch",
                "amount": 50.00,
                "currency": "USD",
                "category": "Food & Dining",
                "date": datetime.now().isoformat(),
                "splitType": "EQUAL",
                "splits": [
                    {
                        "userId": member1["id"],
                        "amount": 25.00,
                        "percentage": 50.0,
                        "shares": 1,
                    },
                    {
                        "userId": member2["id"],
                        "amount": 25.00,
                        "percentage": 50.0,
                        "shares": 1,
                    },
                ],
            }

            result = client.mutate(create_expense_mutation, {"input": expense_input})
            expense = result.get("data", {}).get("createExpense")

            if expense:
                print(
                    f"✅ Created test expense: {expense['description']} - ${expense['amount']}"
                )
                print(
                    f"   Paid by: {expense['paidBy']['firstName']} {expense['paidBy']['lastName']}"
                )
                print(f"   Split between {len(expense['splits'])} members")

                # Test 7: Get optimal settlements
                print("\n🎯 Testing: Generate optimal settlements")
                try:
                    optimal_query = """
                    query GetOptimalSettlements($groupId: ID!) {
                        optimalSettlements(groupId: $groupId) {
                            id
                            amount
                            currency
                            status
                            fromUser {
                                id
                                username
                                firstName
                                lastName
                            }
                            toUser {
                                id
                                username
                                firstName
                                lastName
                            }
                        }
                    }
                    """

                    result = client.query(optimal_query, {"groupId": test_group["id"]})
                    optimal_settlements = result.get("data", {}).get(
                        "optimalSettlements", []
                    )
                    print(
                        f"✅ Generated {len(optimal_settlements)} optimal settlements"
                    )

                    for settlement in optimal_settlements:
                        from_user = settlement["fromUser"]
                        to_user = settlement["toUser"]
                        print(
                            f"   {from_user['firstName']} → {to_user['firstName']}: ${settlement['amount']}"
                        )

                except Exception as e:
                    print(f"❌ Error generating optimal settlements: {e}")
                    return False

            else:
                print("❌ Failed to create test expense")
                return False

        except Exception as e:
            print(f"❌ Error creating test expense: {e}")
            return False
    else:
        print("ℹ️ Skipping expense creation test (need at least 2 group members)")

    print("\n🎉 All expenses module tests completed successfully!")
    return True


if __name__ == "__main__":
    success = test_expenses_module()
    sys.exit(0 if success else 1)
