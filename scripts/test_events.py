#!/usr/bin/env python3
"""
Test script for Event GraphQL operations
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def test_events():
    """Test all Event-related GraphQL operations"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}🎯 Testing Event GraphQL Operations")
    print(f"{Fore.CYAN}{'='*50}")

    # Check authentication
    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # First, get user's groups to use for testing
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
                "name": "Test Group for Events",
                "description": "A test group for event operations",
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

    # Test 1: Create Event
    print(f"\n{Fore.YELLOW}1️⃣ Testing Create Event...")
    create_event_mutation = """
    mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) {
            id
            date
            description
            createdBy {
                id
                username
            }
        }
    }
    """

    event_variables = {
        "input": {
            "groupId": group_id,
            "date": "2024-12-25T18:00:00Z",
            "description": "Christmas Party 2024",
        }
    }

    create_result = client.mutation(create_event_mutation, event_variables)
    client.print_result(create_result, "Create Event")

    if "errors" in create_result:
        print(f"{Fore.RED}❌ Event creation failed")
        return False

    event_id = create_result.get("data", {}).get("createEvent", {}).get("id")
    if not event_id:
        print(f"{Fore.RED}❌ No event ID returned")
        return False

    # Test 2: Get Events
    print(f"\n{Fore.YELLOW}2️⃣ Testing Get Events...")
    get_events_query = """
    query GetEvents($groupId: ID!) {
        events(groupId: $groupId) {
            id
            date
            description
            createdBy {
                id
                username
            }
            rsvps {
                id
                status
                user {
                    id
                    username
                }
            }
        }
    }
    """

    get_events_variables = {"groupId": group_id}
    get_events_result = client.query(get_events_query, get_events_variables)
    client.print_result(get_events_result, "Get Events")

    # Test 3: Create RSVP
    print(f"\n{Fore.YELLOW}3️⃣ Testing Create RSVP...")
    create_rsvp_mutation = """
    mutation CreateRSVP($input: CreateRSVPInput!) {
        createRSVP(input: $input) {
            id
            status
            note
            event {
                id
            }
        }
    }
    """

    rsvp_variables = {
        "input": {
            "eventId": event_id,
            "status": "GOING",
            "note": "Looking forward to it!",
        }
    }

    rsvp_result = client.mutation(create_rsvp_mutation, rsvp_variables)
    client.print_result(rsvp_result, "Create RSVP")

    if "errors" not in rsvp_result:
        rsvp_id = rsvp_result.get("data", {}).get("createRSVP", {}).get("id")

        # Test 4: Update RSVP
        print(f"\n{Fore.YELLOW}4️⃣ Testing Update RSVP...")
        update_rsvp_mutation = """
        mutation UpdateRSVP($id: ID!, $status: RSVPStatus!, $note: String) {
            updateRSVP(id: $id, status: $status, note: $note) {
                id
                status
                note
            }
        }
        """

        update_rsvp_variables = {
            "id": rsvp_id,
            "status": "MAYBE",
            "note": "Updated note - might be able to make it",
        }

        update_rsvp_result = client.mutation(
            update_rsvp_mutation, update_rsvp_variables
        )
        client.print_result(update_rsvp_result, "Update RSVP")

    # Test 5: Update Event
    print(f"\n{Fore.YELLOW}5️⃣ Testing Update Event...")
    update_event_mutation = """
    mutation UpdateEvent($id: ID!, $input: CreateEventInput!) {
        updateEvent(id: $id, input: $input) {
            id
            date
            description
        }
    }
    """

    update_event_variables = {
        "id": event_id,
        "input": {
            "groupId": group_id,
            "date": "2024-12-25T19:00:00Z",
            "description": "Updated Christmas Party 2024 - Extended hours!",
        },
    }

    update_event_result = client.mutation(update_event_mutation, update_event_variables)
    client.print_result(update_event_result, "Update Event")

    # Test 6: Get User Pending Events
    print(f"\n{Fore.YELLOW}6️⃣ Testing Get User Pending Events...")
    pending_events_query = """
    query GetUserPendingEvents {
        userPendingEvents {
            id
            date
            description
            group {
                id
                name
            }
            createdBy {
                id
                username
            }
        }
    }
    """

    pending_result = client.query(pending_events_query)
    client.print_result(pending_result, "Get User Pending Events")

    # Test 7: Delete Event (cleanup)
    print(f"\n{Fore.YELLOW}7️⃣ Testing Delete Event (cleanup)...")
    delete_event_mutation = """
    mutation DeleteEvent($id: ID!) {
        deleteEvent(id: $id)
    }
    """

    delete_variables = {"id": event_id}
    delete_result = client.mutation(delete_event_mutation, delete_variables)
    client.print_result(delete_result, "Delete Event")

    print(f"\n{Fore.GREEN}✅ All Event operations completed!")
    return True


if __name__ == "__main__":
    test_events()
