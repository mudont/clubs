#!/usr/bin/env python3
"""
PostgreSQL Database Restore Script
Restores database from dump file using connection details from .env file
"""

import argparse
import os
import subprocess
import sys
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


def detect_dump_format(dump_file):
    """Detect the format of the dump file"""
    if dump_file.endswith(".dump"):
        return "custom"
    elif dump_file.endswith(".sql"):
        return "plain"
    elif os.path.isdir(dump_file):
        return "directory"
    else:
        # Try to detect by reading first few bytes
        try:
            with open(dump_file, "rb") as f:
                header = f.read(4)
                if header.startswith(b"PGDMP"):
                    return "custom"
                else:
                    return "plain"
        except:
            return "plain"


def restore_database(env_vars, dump_file, format=None, drop_existing=False):
    """Restore PostgreSQL database from dump file"""

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

    # Check if dump file exists
    if not os.path.exists(dump_file):
        print(f"{Fore.RED}❌ Dump file not found: {dump_file}")
        return False

    # Detect format if not specified
    if not format:
        format = detect_dump_format(dump_file)
        print(f"{Fore.BLUE}🔍 Detected format: {format}")

    print(f"{Fore.YELLOW}🔄 Starting database restore...")
    print(f"{Fore.YELLOW}📁 Dump file: {dump_file}")
    print(f"{Fore.YELLOW}📋 Format: {format}")

    # Set password environment variable
    env = os.environ.copy()
    env["PGPASSWORD"] = db_config["password"]

    try:
        if drop_existing:
            print(f"{Fore.YELLOW}🗑️  Dropping existing database...")

            # Drop database command
            drop_cmd = [
                "psql",
                f"--host={db_config['host']}",
                f"--port={db_config['port']}",
                f"--username={db_config['username']}",
                "--no-password",
                "--command",
                f'DROP DATABASE IF EXISTS "{db_config["database"]}";',
            ]

            # Connect to postgres database to drop the target database
            drop_env = env.copy()
            drop_env["PGDATABASE"] = "postgres"

            subprocess.run(
                drop_cmd, env=drop_env, capture_output=True, text=True, check=True
            )
            print(f"{Fore.GREEN}✅ Existing database dropped")

        # Build restore command based on format
        if format == "custom":
            cmd = [
                "pg_restore",
                f"--host={db_config['host']}",
                f"--port={db_config['port']}",
                f"--username={db_config['username']}",
                f"--dbname={db_config['database']}",
                "--no-password",
                "--verbose",
                "--clean",  # Clean (drop) database objects before recreating
                "--if-exists",  # Use IF EXISTS when dropping
                "--no-owner",  # Don't set ownership
                "--no-privileges",  # Don't restore privileges
                dump_file,
            ]
        elif format == "plain":
            cmd = [
                "psql",
                f"--host={db_config['host']}",
                f"--port={db_config['port']}",
                f"--username={db_config['username']}",
                f"--dbname={db_config['database']}",
                "--no-password",
                "--verbose",
                "--file",
                dump_file,
            ]
        elif format == "directory":
            cmd = [
                "pg_restore",
                f"--host={db_config['host']}",
                f"--port={db_config['port']}",
                f"--username={db_config['username']}",
                f"--dbname={db_config['database']}",
                "--no-password",
                "--verbose",
                "--clean",
                "--if-exists",
                "--no-owner",
                "--no-privileges",
                dump_file,
            ]
        else:
            print(f"{Fore.RED}❌ Unsupported format: {format}")
            return False

        # Run restore command
        result = subprocess.run(
            cmd, env=env, capture_output=True, text=True, check=True
        )

        print(f"{Fore.GREEN}✅ Database restore completed successfully!")

        # Show restore output if verbose
        if result.stdout:
            print(f"{Fore.BLUE}📋 Restore output:")
            print(result.stdout)

        return True

    except subprocess.CalledProcessError as e:
        print(f"{Fore.RED}❌ Database restore failed!")
        print(f"{Fore.RED}Error: {e}")
        if e.stdout:
            print(f"{Fore.RED}stdout: {e.stdout}")
        if e.stderr:
            print(f"{Fore.RED}stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print(
            f"{Fore.RED}❌ pg_restore or psql command not found. Please install PostgreSQL client tools."
        )
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Restore PostgreSQL database from dump file"
    )
    parser.add_argument("dump_file", help="Path to the dump file to restore from")
    parser.add_argument(
        "--format",
        "-f",
        choices=["custom", "plain", "directory"],
        help="Dump file format (auto-detected if not specified)",
    )
    parser.add_argument(
        "--drop-existing",
        "-d",
        action="store_true",
        help="Drop existing database before restore",
    )
    parser.add_argument("--env-file", help="Path to .env file (default: auto-detect)")

    args = parser.parse_args()

    print(f"{Fore.CYAN}🗄️  PostgreSQL Database Restore Tool")
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

    # Perform database restore
    success = restore_database(
        env_vars, args.dump_file, args.format, args.drop_existing
    )

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
