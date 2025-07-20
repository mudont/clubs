#!/usr/bin/env python3
"""
Test script for User GraphQL operations
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def test_users():
    """Test all User-related GraphQL operations"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}👤 Testing User GraphQL Operations")
    print(f"{Fore.CYAN}{'='*50}")

    # Check authentication
    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # Test 1: Get User Profile (Me)
    print(f"{Fore.YELLOW}1️⃣ Testing Get User Profile...")
    me_query = """
    query Me {
        me {
            id
            username
            email
            emailVerified
            phone
            photoUrl
            firstName
            lastName
        }
    }
    """

    me_result = client.query(me_query)
    client.print_result(me_result, "Get User Profile (Me)")

    if "errors" in me_result:
        print(f"{Fore.RED}❌ Cannot get user profile")
        return False

    user_data = me_result.get("data", {}).get("me", {})
    user_id = user_data.get("id")

    # Test 2: Get User Profile (detailed)
    print(f"\n{Fore.YELLOW}2️⃣ Testing Get User Profile (detailed)...")
    profile_query = """
    query GetUserProfile {
        me {
            id
            username
            email
            firstName
            lastName
            bio
            avatar
            createdAt
            emailVerified
        }
    }
    """

    profile_result = client.query(profile_query)
    client.print_result(profile_result, "Get User Profile (detailed)")

    # Test 3: Update Profile
    print(f"\n{Fore.YELLOW}3️⃣ Testing Update Profile...")
    update_profile_mutation = """
    mutation UpdateProfile($input: UpdateUserInput!) {
        updateProfile(input: $input) {
            id
            username
            email
            firstName
            lastName
            bio
            avatar
        }
    }
    """

    update_profile_variables = {
        "input": {
            "firstName": "Python",
            "lastName": "Tester",
            "bio": "Updated bio from Python script test",
        }
    }

    update_profile_result = client.mutation(
        update_profile_mutation, update_profile_variables
    )
    client.print_result(update_profile_result, "Update Profile")

    # Test 4: Change Password
    print(f"\n{Fore.YELLOW}4️⃣ Testing Change Password...")
    change_password_mutation = """
    mutation ChangePassword($input: ChangePasswordInput!) {
        changePassword(input: $input) {
            success
            message
        }
    }
    """

    # Note: This will fail if we don't know the current password
    # We'll test it but expect it to fail gracefully
    change_password_variables = {
        "input": {
            "currentPassword": "wrong_password",
            "newPassword": "new_password_123",
        }
    }

    change_password_result = client.mutation(
        change_password_mutation, change_password_variables
    )
    client.print_result(change_password_result, "Change Password")

    # Test 5: User Search
    print(f"\n{Fore.YELLOW}5️⃣ Testing User Search...")
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

    # Test 6: Delete User (will fail if not admin or trying to delete self)
    print(f"\n{Fore.YELLOW}6️⃣ Testing Delete User...")
    delete_user_mutation = """
    mutation DeleteUser($userId: ID!) {
        deleteUser(userId: $userId)
    }
    """

    # This will likely fail as users can't typically delete themselves
    delete_user_variables = {"userId": user_id}
    delete_user_result = client.mutation(delete_user_mutation, delete_user_variables)
    client.print_result(delete_user_result, "Delete User")

    print(f"\n{Fore.GREEN}✅ All User operations completed!")
    return True


if __name__ == "__main__":
    test_users()
