#!/usr/bin/env python3
"""
Login script for the clubs application using GraphQL
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style
from graphql_client import GraphQLClient


def login(username=None, password=None):
    """Login with username/password and save JWT token using GraphQL"""
    client = GraphQLClient()
    print(f"{Fore.CYAN}🔐 Clubs Application Login (GraphQL)")
    print(f"{Fore.CYAN}{'='*40}")

    # Get credentials from arguments or prompt
    if not username:
        username = input(f"{Fore.YELLOW}Username: ").strip()
    if not password:
        password = input(f"{Fore.YELLOW}Password: ").strip()

    if not username or not password:
        print(f"{Fore.RED}❌ Username and password are required")
        return False

    # Login mutation using GraphQL
    login_mutation = """
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            token
            user {
                id
                username
                email
                firstName
                lastName
            }
        }
    }
    """

    variables = {"input": {"username": username, "password": password}}

    print(f"{Fore.BLUE}🔄 Logging in via GraphQL...")
    result = client.query(login_mutation, variables)

    if "errors" in result:
        print(f"{Fore.RED}❌ Login failed:")
        for error in result["errors"]:
            print(f"  {error.get('message', 'Unknown error')}")
        return False

    data = result.get("data", {})
    login_data = data.get("login", {})

    if login_data and login_data.get("token"):
        token = login_data["token"]
        user = login_data.get("user", {})

        # Save token
        client._save_token(token)

        print(f"{Fore.GREEN}✅ Login successful!")
        print(
            f"{Fore.GREEN}👤 Welcome, {user.get('firstName', user.get('username', 'User'))}!"
        )
        print(f"{Fore.GREEN}📧 Email: {user.get('email', 'N/A')}")
        print(f"{Fore.GREEN}🆔 User ID: {user.get('id', 'N/A')}")

        return True
    else:
        print(f"{Fore.RED}❌ Login failed: No token received")
        return False


def signup():
    """Signup with user details and save JWT token using GraphQL"""
    client = GraphQLClient()

    print(f"{Fore.CYAN}📝 Clubs Application Signup (GraphQL)")
    print(f"{Fore.CYAN}{'='*40}")

    # Get user details
    username = input(f"{Fore.YELLOW}Username: ").strip()
    email = input(f"{Fore.YELLOW}Email: ").strip()
    password = input(f"{Fore.YELLOW}Password: ").strip()
    firstName = input(f"{Fore.YELLOW}First Name (optional): ").strip()
    lastName = input(f"{Fore.YELLOW}Last Name (optional): ").strip()

    if not username or not email or not password:
        print(f"{Fore.RED}❌ Username, email, and password are required")
        return False

    # Signup mutation using GraphQL
    signup_mutation = """
    mutation Signup($input: SignupInput!) {
        signup(input: $input) {
            token
            user {
                id
                username
                email
                firstName
                lastName
            }
        }
    }
    """

    variables = {
        "input": {
            "username": username,
            "email": email,
            "password": password,
            "firstName": firstName if firstName else None,
            "lastName": lastName if lastName else None,
        }
    }

    print(f"{Fore.BLUE}🔄 Creating account via GraphQL...")
    result = client.query(signup_mutation, variables)

    if "errors" in result:
        print(f"{Fore.RED}❌ Signup failed:")
        for error in result["errors"]:
            print(f"  {error.get('message', 'Unknown error')}")
        return False

    data = result.get("data", {})
    signup_data = data.get("signup", {})

    if signup_data and signup_data.get("token"):
        token = signup_data["token"]
        user = signup_data.get("user", {})

        # Save token
        client._save_token(token)

        print(f"{Fore.GREEN}✅ Signup successful!")
        print(
            f"{Fore.GREEN}👤 Welcome, {user.get('firstName', user.get('username', 'User'))}!"
        )
        print(f"{Fore.GREEN}📧 Email: {user.get('email', 'N/A')}")
        print(f"{Fore.GREEN}🆔 User ID: {user.get('id', 'N/A')}")

        return True
    else:
        print(f"{Fore.RED}❌ Signup failed: No token received")
        return False


def logout():
    """Remove stored token"""
    client = GraphQLClient()

    if os.path.exists(client.token_file):
        os.remove(client.token_file)
        print(f"{Fore.GREEN}✅ Logged out successfully")
    else:
        print(f"{Fore.YELLOW}ℹ️  No token found to remove")


def check_auth():
    """Check if user is authenticated"""
    client = GraphQLClient()

    if not client.token:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first.")
        return False

    # Test token with a simple query
    me_query = """
    query Me {
        me {
            id
            username
            email
            firstName
            lastName
        }
    }
    """

    result = client.query(me_query)

    if "errors" in result:
        print(f"{Fore.RED}❌ Token is invalid or expired")
        return False

    user = result.get("data", {}).get("me", {})
    print(f"{Fore.GREEN}✅ Authenticated as: {user.get('username', 'Unknown')}")
    return True


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "logout":
            logout()
        elif command == "check":
            check_auth()
        elif command == "login":
            # Check if username and password are provided as arguments
            if len(sys.argv) >= 4:
                username = sys.argv[2]
                password = sys.argv[3]
                login(username, password)
            else:
                # Interactive login
                login()
        elif command == "signup":
            signup()
        else:
            print(f"{Fore.RED}❌ Unknown command: {command}")
            print(f"{Fore.YELLOW}Usage:")
            print(f"  python login.py login [username] [password]")
            print(f"  python login.py signup")
            print(f"  python login.py logout")
            print(f"  python login.py check")
    else:
        # Show menu
        print(f"{Fore.CYAN}🔐 Clubs Application Authentication")
        print(f"{Fore.CYAN}{'='*40}")
        print(f"{Fore.YELLOW}1. Login")
        print(f"{Fore.YELLOW}2. Signup")
        print(f"{Fore.YELLOW}3. Check Authentication")
        print(f"{Fore.YELLOW}4. Logout")

        choice = input(f"\n{Fore.BLUE}Choose an option (1-4): ").strip()

        if choice == "1":
            login()
        elif choice == "2":
            signup()
        elif choice == "3":
            check_auth()
        elif choice == "4":
            logout()
        else:
            print(f"{Fore.RED}❌ Invalid choice")
