#!/usr/bin/env python3
"""
PostgreSQL Database Dump Script
Dumps the database using connection details from .env file
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from colorama import Fore, Style, init

# Initialize colorama for colored output
init(autoreset=True)


def find_env_file():
    """Find .env file by looking recursively up the directory tree"""
    current_dir = Path.cwd()

    while current_dir != current_dir.parent:
        env_file = current_dir / ".env"
        if env_file.exists():
            print(f"{Fore.GREEN}✅ Found .env file at: {env_file}")
            return env_file
        current_dir = current_dir.parent

    print(f"{Fore.RED}❌ No .env file found in current directory or parent directories")
    return None


def parse_database_url(database_url):
    """Parse PostgreSQL connection string to extract components"""
    # Remove postgresql:// or postgres:// prefix
    if database_url.startswith("postgresql://"):
        database_url = database_url[13:]
    elif database_url.startswith("postgres://"):
        database_url = database_url[11:]

    # Split into parts
    parts = database_url.split("@")
    if len(parts) != 2:
        raise ValueError("Invalid database URL format")

    # Parse user and password
    user_pass = parts[0].split(":")
    if len(user_pass) != 2:
        raise ValueError("Invalid user:password format")

    username = user_pass[0]
    password = user_pass[1]

    # Parse host, port, and database
    host_db = parts[1].split("/")
    if len(host_db) != 2:
        raise ValueError("Invalid host/database format")

    host_port = host_db[0].split(":")
    host = host_port[0]
    port = host_port[1] if len(host_port) > 1 else "5432"

    database = host_db[1]

    return {
        "username": username,
        "password": password,
        "host": host,
        "port": port,
        "database": database,
    }


def load_env_file(env_file):
    """Load environment variables from .env file"""
    env_vars = {}

    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env_vars[key] = value

    return env_vars


def dump_database(env_vars, output_file=None, format="custom"):
    """Dump PostgreSQL database using pg_dump"""

    # Get database URL from environment
    database_url = env_vars.get("DATABASE_URL")
    if not database_url:
        print(f"{Fore.RED}❌ DATABASE_URL not found in .env file")
        return False

    try:
        # Parse database URL
        db_config = parse_database_url(database_url)
        print(f"{Fore.BLUE}📊 Database: {db_config['database']}")
        print(f"{Fore.BLUE}🌐 Host: {db_config['host']}:{db_config['port']}")
        print(f"{Fore.BLUE}👤 User: {db_config['username']}")

    except ValueError as e:
        print(f"{Fore.RED}❌ Error parsing DATABASE_URL: {e}")
        return False

    # Set output file if not provided
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"db_dump_{db_config['database']}_{timestamp}.sql"

    # Build pg_dump command
    cmd = [
        "pg_dump",
        f"--host={db_config['host']}",
        f"--port={db_config['port']}",
        f"--username={db_config['username']}",
        f"--dbname={db_config['database']}",
        "--no-password",  # Use .pgpass or environment variable
        "--verbose",
        "--clean",  # Include DROP statements
        "--if-exists",  # Use IF EXISTS with DROP
        "--create",  # Include CREATE DATABASE statement
        "--no-owner",  # Don't set ownership
        "--no-privileges",  # Don't dump privileges
    ]

    # Add format-specific options
    if format == "custom":
        cmd.extend(["--format=custom", "--compress=9"])
        if not output_file.endswith(".dump"):
            output_file = output_file.replace(".sql", ".dump")
    elif format == "plain":
        cmd.extend(["--format=plain"])
    elif format == "directory":
        cmd.extend(["--format=directory"])
        if not output_file.endswith("/"):
            output_file = output_file.rstrip(".sql") + "/"

    cmd.extend(["--file", output_file])

    print(f"{Fore.YELLOW}🔄 Starting database dump...")
    print(f"{Fore.YELLOW}📁 Output file: {output_file}")
    print(f"{Fore.YELLOW}📋 Format: {format}")

    # Set password environment variable
    env = os.environ.copy()
    env["PGPASSWORD"] = db_config["password"]

    try:
        # Run pg_dump
        result = subprocess.run(
            cmd, env=env, capture_output=True, text=True, check=True
        )

        print(f"{Fore.GREEN}✅ Database dump completed successfully!")
        print(f"{Fore.GREEN}📁 File saved as: {output_file}")

        # Show file size
        if os.path.exists(output_file):
            size = os.path.getsize(output_file)
            if size > 1024 * 1024:
                size_str = f"{size / (1024 * 1024):.1f} MB"
            else:
                size_str = f"{size / 1024:.1f} KB"
            print(f"{Fore.GREEN}📏 File size: {size_str}")

        return True

    except subprocess.CalledProcessError as e:
        print(f"{Fore.RED}❌ Database dump failed!")
        print(f"{Fore.RED}Error: {e}")
        if e.stdout:
            print(f"{Fore.RED}stdout: {e.stdout}")
        if e.stderr:
            print(f"{Fore.RED}stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print(
            f"{Fore.RED}❌ pg_dump command not found. Please install PostgreSQL client tools."
        )
        return False


def main():
    parser = argparse.ArgumentParser(description="Dump PostgreSQL database")
    parser.add_argument(
        "--output",
        "-o",
        help="Output file path (default: auto-generated with timestamp)",
    )
    parser.add_argument(
        "--format",
        "-f",
        choices=["custom", "plain", "directory"],
        default="custom",
        help="Output format (default: custom)",
    )
    parser.add_argument("--env-file", help="Path to .env file (default: auto-detect)")

    args = parser.parse_args()

    print(f"{Fore.CYAN}🗄️  PostgreSQL Database Dump Tool")
    print(f"{Fore.CYAN}{'='*50}")

    # Find .env file
    if args.env_file:
        env_file = Path(args.env_file)
        if not env_file.exists():
            print(f"{Fore.RED}❌ Specified .env file not found: {env_file}")
            return 1
    else:
        env_file = find_env_file()
        if not env_file:
            return 1

    # Load environment variables
    print(f"{Fore.BLUE}📖 Loading environment variables...")
    env_vars = load_env_file(env_file)

    # Perform database dump
    success = dump_database(env_vars, args.output, args.format)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
