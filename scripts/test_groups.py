#!/usr/bin/env python3
"""
Test script for Group GraphQL operations
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def test_groups():
    """Test all Group-related GraphQL operations"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}👥 Testing Group GraphQL Operations")
    print(f"{Fore.CYAN}{'='*50}")

    # Check authentication
    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # Test 1: Get My Groups
    print(f"{Fore.YELLOW}1️⃣ Testing Get My Groups...")
    my_groups_query = """
    query GetMyGroups {
        myGroups {
            id
            name
            description
            isPublic
            createdAt
            memberships {
                id
                isAdmin
                user {
                    id
                    username
                    email
                }
            }
        }
    }
    """

    my_groups_result = client.query(my_groups_query)
    client.print_result(my_groups_result, "Get My Groups")

    # Test 2: Get Public Groups
    print(f"\n{Fore.YELLOW}2️⃣ Testing Get Public Groups...")
    public_groups_query = """
    query GetPublicGroups {
        publicGroups {
            id
            name
            description
            isPublic
            createdAt
            memberships {
                id
                isAdmin
                user {
                    id
                    username
                    email
                }
            }
        }
    }
    """

    public_groups_result = client.query(public_groups_query)
    client.print_result(public_groups_result, "Get Public Groups")

    # Test 3: Create Group
    print(f"\n{Fore.YELLOW}3️⃣ Testing Create Group...")
    create_group_mutation = """
    mutation CreateGroup($input: CreateGroupInput!) {
        createGroup(input: $input) {
            id
            name
            description
            isPublic
            createdAt
        }
    }
    """

    create_group_variables = {
        "input": {
            "name": "Python Test Group",
            "description": "A test group created by Python script",
            "isPublic": True,
        }
    }

    create_group_result = client.mutation(create_group_mutation, create_group_variables)
    client.print_result(create_group_result, "Create Group")

    if "errors" in create_group_result:
        print(f"{Fore.RED}❌ Group creation failed")
        return False

    group_id = create_group_result.get("data", {}).get("createGroup", {}).get("id")
    if not group_id:
        print(f"{Fore.RED}❌ No group ID returned")
        return False

    # Test 4: Get Group Details
    print(f"\n{Fore.YELLOW}4️⃣ Testing Get Group Details...")
    get_group_query = """
    query GetGroup($id: ID!) {
        group(id: $id) {
            id
            name
            description
            createdAt
            memberships {
                id
                isAdmin
                memberId
                user {
                    id
                    username
                    email
                }
            }
        }
    }
    """

    get_group_variables = {"id": group_id}
    get_group_result = client.query(get_group_query, get_group_variables)
    client.print_result(get_group_result, "Get Group Details")

    # Test 5: Get Group Members
    print(f"\n{Fore.YELLOW}5️⃣ Testing Get Group Members...")
    get_members_query = """
    query GetGroupMembers($groupId: ID!) {
        group(id: $groupId) {
            id
            name
            description
            isPublic
            memberships {
                id
                isAdmin
                memberId
                joinedAt
                user {
                    id
                    username
                    email
                    firstName
                    lastName
                }
            }
            blockedUsers {
                id
                blockedAt
                reason
                user {
                    id
                    username
                    email
                }
                blockedBy {
                    id
                    username
                }
            }
        }
    }
    """

    get_members_variables = {"groupId": group_id}
    get_members_result = client.query(get_members_query, get_members_variables)
    client.print_result(get_members_result, "Get Group Members")

    # Test 6: User Search
    print(f"\n{Fore.YELLOW}6️⃣ Testing User Search...")
    user_search_query = """
    query UserSearch($query: String!) {
        userSearch(query: $query) {
            id
            username
            email
            firstName
            lastName
        }
    }
    """

    user_search_variables = {"query": "test"}
    user_search_result = client.query(user_search_query, user_search_variables)
    client.print_result(user_search_result, "User Search")

    # Test 7: Group Search
    print(f"\n{Fore.YELLOW}7️⃣ Testing Group Search...")
    group_search_query = """
    query GroupSearch($query: String!) {
        publicGroups(query: $query) {
            id
            name
            description
        }
    }
    """

    group_search_variables = {"query": "test"}
    group_search_result = client.query(group_search_query, group_search_variables)
    client.print_result(group_search_result, "Group Search")

    # Test 8: Update Group
    print(f"\n{Fore.YELLOW}8️⃣ Testing Update Group...")
    update_group_mutation = """
    mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) {
        updateGroup(id: $id, input: $input) {
            id
            name
            description
            isPublic
        }
    }
    """

    update_group_variables = {
        "id": group_id,
        "input": {
            "name": "Updated Python Test Group",
            "description": "Updated description for the test group",
            "isPublic": False,
        },
    }

    update_group_result = client.mutation(update_group_mutation, update_group_variables)
    client.print_result(update_group_result, "Update Group")

    # Test 9: Leave Group (if not the only member)
    print(f"\n{Fore.YELLOW}9️⃣ Testing Leave Group...")
    leave_group_mutation = """
    mutation LeaveGroup($groupId: ID!) {
        leaveGroup(groupId: $groupId)
    }
    """

    leave_group_variables = {"groupId": group_id}
    leave_group_result = client.mutation(leave_group_mutation, leave_group_variables)
    client.print_result(leave_group_result, "Leave Group")

    # Test 10: Join Group (rejoin)
    print(f"\n{Fore.YELLOW}🔟 Testing Join Group...")
    join_group_mutation = """
    mutation JoinGroup($groupId: ID!) {
        joinGroup(groupId: $groupId) {
            id
            name
            description
            isPublic
            createdAt
        }
    }
    """

    join_group_variables = {"groupId": group_id}
    join_group_result = client.mutation(join_group_mutation, join_group_variables)
    client.print_result(join_group_result, "Join Group")

    # Test 11: Delete Group (cleanup)
    print(f"\n{Fore.YELLOW}1️⃣1️⃣ Testing Delete Group (cleanup)...")
    delete_group_mutation = """
    mutation DeleteGroup($id: ID!) {
        deleteGroup(id: $id)
    }
    """

    delete_group_variables = {"id": group_id}
    delete_group_result = client.mutation(delete_group_mutation, delete_group_variables)
    client.print_result(delete_group_result, "Delete Group")

    print(f"\n{Fore.GREEN}✅ All Group operations completed!")
    return True


if __name__ == "__main__":
    test_groups()
