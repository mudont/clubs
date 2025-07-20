#!/usr/bin/env python3
"""
Test script for Message GraphQL operations
"""

import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def test_messages():
    """Test all Message-related GraphQL operations"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}💬 Testing Message GraphQL Operations")
    print(f"{Fore.CYAN}{'='*50}")

    # Check authentication
    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # First, get or create a group to use for messaging
    print(f"{Fore.BLUE}📋 Getting user's groups...")
    my_groups_query = """
    query GetMyGroups {
        myGroups {
            id
            name
            description
        }
    }
    """

    groups_result = client.query(my_groups_query)
    client.print_result(groups_result, "Get My Groups")

    if "errors" in groups_result:
        print(f"{Fore.RED}❌ Cannot proceed without groups")
        return False

    groups = groups_result.get("data", {}).get("myGroups", [])
    if not groups:
        print(f"{Fore.YELLOW}⚠️  No groups found. Creating a test group...")

        # Create a test group
        create_group_mutation = """
        mutation CreateGroup($input: CreateGroupInput!) {
            createGroup(input: $input) {
                id
                name
                description
            }
        }
        """

        group_variables = {
            "input": {
                "name": "Test Group for Messages",
                "description": "A test group for message operations",
                "isPublic": True,
            }
        }

        group_result = client.mutation(create_group_mutation, group_variables)
        client.print_result(group_result, "Create Test Group")

        if "errors" in group_result:
            print(f"{Fore.RED}❌ Cannot create test group")
            return False

        groups = [group_result.get("data", {}).get("createGroup", {})]

    group_id = groups[0]["id"]
    print(f"{Fore.GREEN}✅ Using group: {groups[0]['name']} (ID: {group_id})")

    # Test 1: Get Messages
    print(f"\n{Fore.YELLOW}1️⃣ Testing Get Messages...")
    get_messages_query = """
    query GetMessages($groupId: ID!) {
        messages(groupId: $groupId) {
            id
            content
            createdAt
            user {
                id
                username
                email
            }
        }
    }
    """

    get_messages_variables = {"groupId": group_id}
    get_messages_result = client.query(get_messages_query, get_messages_variables)
    client.print_result(get_messages_result, "Get Messages")

    # Test 2: Send Message
    print(f"\n{Fore.YELLOW}2️⃣ Testing Send Message...")
    send_message_mutation = """
    mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) {
            id
            content
            createdAt
            user {
                id
                username
                email
            }
        }
    }
    """

    send_message_variables = {
        "input": {"groupId": group_id, "content": "Hello from Python script! 🐍"}
    }

    send_message_result = client.mutation(send_message_mutation, send_message_variables)
    client.print_result(send_message_result, "Send Message")

    if "errors" in send_message_result:
        print(f"{Fore.RED}❌ Message sending failed")
        return False

    message_id = send_message_result.get("data", {}).get("sendMessage", {}).get("id")

    # Test 3: Send another message
    print(f"\n{Fore.YELLOW}3️⃣ Testing Send Another Message...")
    send_message_variables2 = {
        "input": {
            "groupId": group_id,
            "content": "This is a second message from the Python test script!",
        }
    }

    send_message_result2 = client.mutation(
        send_message_mutation, send_message_variables2
    )
    client.print_result(send_message_result2, "Send Second Message")

    # Test 4: Get Messages again to see the new messages
    print(f"\n{Fore.YELLOW}4️⃣ Testing Get Messages (after sending)...")
    get_messages_result2 = client.query(get_messages_query, get_messages_variables)
    client.print_result(get_messages_result2, "Get Messages (after sending)")

    # Test 5: Message Subscription (async)
    print(f"\n{Fore.YELLOW}5️⃣ Testing Message Subscription...")
    print(f"{Fore.BLUE}📡 Starting subscription (will listen for 10 seconds)...")

    async def run_subscription():
        subscription_query = """
        subscription OnMessageAdded($groupId: ID!) {
            messageAdded(groupId: $groupId) {
                id
                content
                createdAt
                user {
                    id
                    username
                    email
                }
            }
        }
        """

        subscription_variables = {"groupId": group_id}

        def message_callback(data):
            print(f"{Fore.GREEN}📨 New message received via subscription!")
            print(
                f"{Fore.GREEN}Content: {data.get('messageAdded', {}).get('content', 'N/A')}"
            )

        await client.subscription(
            subscription_query,
            subscription_variables,
            callback=message_callback,
            duration=10,
        )

    # Run the subscription
    try:
        asyncio.run(run_subscription())
    except Exception as e:
        print(f"{Fore.RED}❌ Subscription failed: {e}")

    print(f"\n{Fore.GREEN}✅ All Message operations completed!")
    return True


if __name__ == "__main__":
    test_messages()
