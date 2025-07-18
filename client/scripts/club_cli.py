#!/usr/bin/env python3
import argparse
import json
import sys

from club_api import ClubAPI


def pretty_print(data):
    print(json.dumps(data, indent=2, default=str))


def main():
    parser = argparse.ArgumentParser(description="Club Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Login
    login_parser = subparsers.add_parser("login", help="Login and store token")
    login_parser.add_argument("username", help="Username")
    login_parser.add_argument("password", help="Password")

    # User
    user_parser = subparsers.add_parser("me", help="Get current user profile")
    user_parser = subparsers.add_parser("user", help="Get user by ID")
    user_parser.add_argument("id", help="User ID")
    update_profile_parser = subparsers.add_parser(
        "update-profile", help="Update your profile"
    )
    update_profile_parser.add_argument("--username")
    update_profile_parser.add_argument("--email")
    update_profile_parser.add_argument("--firstName")
    update_profile_parser.add_argument("--lastName")
    update_profile_parser.add_argument("--bio")
    delete_user_parser = subparsers.add_parser(
        "delete-user", help="Delete your user account"
    )
    delete_user_parser.add_argument("userId", help="User ID")

    # Group
    groups_parser = subparsers.add_parser("groups", help="List all groups")
    group_parser = subparsers.add_parser("group", help="Get group by ID")
    group_parser.add_argument("id", help="Group ID")
    create_group_parser = subparsers.add_parser("create-group", help="Create a group")
    create_group_parser.add_argument("name")
    create_group_parser.add_argument("--description")
    create_group_parser.add_argument("--isPublic", action="store_true")
    update_group_parser = subparsers.add_parser("update-group", help="Update a group")
    update_group_parser.add_argument("id")
    update_group_parser.add_argument("--name")
    update_group_parser.add_argument("--description")
    update_group_parser.add_argument("--isPublic", action="store_true")
    delete_group_parser = subparsers.add_parser("delete-group", help="Delete a group")
    delete_group_parser.add_argument("id")

    # Event
    events_parser = subparsers.add_parser("events", help="List events for a group")
    events_parser.add_argument("groupId")
    event_parser = subparsers.add_parser("event", help="Get event by ID")
    event_parser.add_argument("id")
    create_event_parser = subparsers.add_parser("create-event", help="Create an event")
    create_event_parser.add_argument("groupId")
    create_event_parser.add_argument("date")
    create_event_parser.add_argument("description")
    update_event_parser = subparsers.add_parser("update-event", help="Update an event")
    update_event_parser.add_argument("id")
    update_event_parser.add_argument("--date")
    update_event_parser.add_argument("--description")
    delete_event_parser = subparsers.add_parser("delete-event", help="Delete an event")
    delete_event_parser.add_argument("id")

    # Message
    send_message_parser = subparsers.add_parser(
        "send-message", help="Send a message to a group"
    )
    send_message_parser.add_argument("groupId")
    send_message_parser.add_argument("content")

    # Tennis League
    tennis_leagues_parser = subparsers.add_parser(
        "tennis-leagues", help="List all tennis leagues"
    )
    tennis_league_parser = subparsers.add_parser(
        "tennis-league", help="Get tennis league by ID"
    )
    tennis_league_parser.add_argument("id")
    create_tennis_league_parser = subparsers.add_parser(
        "create-tennis-league", help="Create a tennis league"
    )
    create_tennis_league_parser.add_argument("name")
    create_tennis_league_parser.add_argument("startDate")
    create_tennis_league_parser.add_argument("endDate")
    create_tennis_league_parser.add_argument("--description")
    create_tennis_league_parser.add_argument("--isActive", action="store_true")
    delete_tennis_league_parser = subparsers.add_parser(
        "delete-tennis-league", help="Delete a tennis league"
    )
    delete_tennis_league_parser.add_argument("id")

    # Generic GraphQL
    graphql_parser = subparsers.add_parser(
        "graphql", help="Run a raw GraphQL query or mutation"
    )
    graphql_parser.add_argument(
        "query", help="GraphQL query string (use triple quotes or @file:path)"
    )
    graphql_parser.add_argument(
        "--variables", help="JSON string of variables", default=None
    )

    # REST endpoint
    rest_parser = subparsers.add_parser("rest", help="Call a raw REST endpoint")
    rest_parser.add_argument("method", choices=["get", "post", "put", "delete"])
    rest_parser.add_argument("endpoint", help="Endpoint path, e.g. /api/users/me")
    rest_parser.add_argument(
        "--data", help="JSON string for POST/PUT data", default=None
    )

    args = parser.parse_args()
    api = ClubAPI()

    # For demo: store token in memory only. For persistent CLI, use a config file.
    token = None
    if args.command == "login":
        token = api.get_login_token(args.username, args.password)
        if token:
            print("Login successful.")
        else:
            print("Login failed.")
        return
    else:
        # Prompt for login if not already logged in
        # For demo, ask for username/password each time
        username = input("Username: ")
        password = input("Password: ")
        token = api.get_login_token(username, password)
        if not token:
            print("Login failed.")
            sys.exit(1)

    # User
    if args.command == "me":
        pretty_print(api.api_get("/api/users/me"))
    elif args.command == "user":
        pretty_print(api.api_get(f"/api/users/{args.id}"))
    elif args.command == "update-profile":
        data = {
            k: v
            for k, v in vars(args).items()
            if k in ["username", "email", "firstName", "lastName", "bio"] and v
        }
        query = """
        mutation UpdateProfile($input: UpdateUserInput!) { updateProfile(input: $input) { id username email firstName lastName bio } }
        """
        pretty_print(api.graphql(query, {"input": data}))
    elif args.command == "delete-user":
        query = """
        mutation DeleteUser($userId: ID!) { deleteUser(userId: $userId) }
        """
        pretty_print(api.graphql(query, {"userId": args.userId}))

    # Group
    elif args.command == "groups":
        pretty_print(api.api_get("/api/groups"))
    elif args.command == "group":
        pretty_print(api.api_get(f"/api/groups/{args.id}"))
    elif args.command == "create-group":
        query = """
        mutation CreateGroup($input: CreateGroupInput!) { createGroup(input: $input) { id name description isPublic } }
        """
        input_data = {
            "name": args.name,
            "description": args.description,
            "isPublic": args.isPublic,
        }
        pretty_print(api.graphql(query, {"input": input_data}))
    elif args.command == "update-group":
        query = """
        mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) { updateGroup(id: $id, input: $input) { id name description isPublic } }
        """
        input_data = {
            k: v
            for k, v in vars(args).items()
            if k in ["name", "description", "isPublic"] and v
        }
        pretty_print(api.graphql(query, {"id": args.id, "input": input_data}))
    elif args.command == "delete-group":
        query = """
        mutation DeleteGroup($id: ID!) { deleteGroup(id: $id) }
        """
        pretty_print(api.graphql(query, {"id": args.id}))

    # Event
    elif args.command == "events":
        pretty_print(api.api_get(f"/api/groups/{args.groupId}/events"))
    elif args.command == "event":
        pretty_print(api.api_get(f"/api/events/{args.id}"))
    elif args.command == "create-event":
        query = """
        mutation CreateEvent($input: CreateEventInput!) { createEvent(input: $input) { id group { id name } date description } }
        """
        input_data = {
            "groupId": args.groupId,
            "date": args.date,
            "description": args.description,
        }
        pretty_print(api.graphql(query, {"input": input_data}))
    elif args.command == "update-event":
        query = """
        mutation UpdateEvent($id: ID!, $input: CreateEventInput!) { updateEvent(id: $id, input: $input) { id date description } }
        """
        input_data = {
            k: v for k, v in vars(args).items() if k in ["date", "description"] and v
        }
        pretty_print(api.graphql(query, {"id": args.id, "input": input_data}))
    elif args.command == "delete-event":
        query = """
        mutation DeleteEvent($id: ID!) { deleteEvent(id: $id) }
        """
        pretty_print(api.graphql(query, {"id": args.id}))

    # Message
    elif args.command == "send-message":
        query = """
        mutation SendMessage($input: SendMessageInput!) { sendMessage(input: $input) { id content user { id username } group { id name } } }
        """
        input_data = {"groupId": args.groupId, "content": args.content}
        pretty_print(api.graphql(query, {"input": input_data}))

    # Tennis League
    elif args.command == "tennis-leagues":
        query = """
        query { tennisLeagues { id name description startDate endDate isActive } }
        """
        pretty_print(api.graphql(query))
    elif args.command == "tennis-league":
        query = """
        query TennisLeague($id: ID!) { tennisLeague(id: $id) { id name description startDate endDate isActive } }
        """
        pretty_print(api.graphql(query, {"id": args.id}))
    elif args.command == "create-tennis-league":
        query = """
        mutation CreateTennisLeague($input: CreateTennisLeagueInput!) { createTennisLeague(input: $input) { id name description startDate endDate isActive } }
        """
        input_data = {
            "name": args.name,
            "startDate": args.startDate,
            "endDate": args.endDate,
            "description": args.description,
            "isActive": args.isActive,
        }
        pretty_print(api.graphql(query, {"input": input_data}))
    elif args.command == "delete-tennis-league":
        query = """
        mutation DeleteTennisLeague($id: ID!) { deleteTennisLeague(id: $id) }
        """
        pretty_print(api.graphql(query, {"id": args.id}))

    # Generic GraphQL
    elif args.command == "graphql":
        query_str = args.query
        if query_str.startswith("@file:"):
            with open(query_str[6:], "r") as f:
                query_str = f.read()
        variables = json.loads(args.variables) if args.variables else None
        pretty_print(api.graphql(query_str, variables))

    # REST endpoint
    elif args.command == "rest":
        method = args.method.lower()
        data = json.loads(args.data) if args.data else None
        if method == "get":
            pretty_print(api.api_get(args.endpoint))
        elif method == "post":
            pretty_print(api.api_post(args.endpoint, data or {}))
        elif method == "put":
            pretty_print(api.api_put(args.endpoint, data or {}))
        elif method == "delete":
            pretty_print(api.api_delete(args.endpoint))
        else:
            print(f"Unknown method: {method}")
            sys.exit(1)


if __name__ == "__main__":
    main()
