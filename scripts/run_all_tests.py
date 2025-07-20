#!/usr/bin/env python3
"""
Master script to run all GraphQL test scripts
"""

import os
import subprocess
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from colorama import Fore, Style, init

# Initialize colorama for colored output
init(autoreset=True)


def run_script(script_name, description):
    """Run a Python script and return success status"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}🚀 Running: {description}")
    print(f"{Fore.CYAN}{'='*60}")

    script_path = os.path.join(os.path.dirname(__file__), script_name)

    try:
        result = subprocess.run(
            [sys.executable, script_path], capture_output=False, text=True
        )
        if result.returncode == 0:
            print(f"{Fore.GREEN}✅ {description} completed successfully")
            return True
        else:
            print(
                f"{Fore.RED}❌ {description} failed with return code {result.returncode}"
            )
            return False
    except Exception as e:
        print(f"{Fore.RED}❌ {description} failed with exception: {e}")
        return False


def main():
    """Run all test scripts in sequence"""
    print(f"{Fore.CYAN}🎯 Clubs Application - Complete GraphQL Test Suite")
    print(f"{Fore.CYAN}{'='*60}")

    # Check if user is authenticated first
    print(f"{Fore.BLUE}🔐 Checking authentication...")
    auth_result = subprocess.run(
        [sys.executable, "login.py", "check"], capture_output=True, text=True
    )

    if auth_result.returncode != 0:
        print(f"{Fore.RED}❌ Not authenticated. Please run login first:")
        print(f"{Fore.YELLOW}   python login.py")
        return False

    print(f"{Fore.GREEN}✅ Authentication verified")

    # Define test scripts in order
    test_scripts = [
        ("test_users.py", "User Operations"),
        ("test_groups.py", "Group Operations"),
        ("test_events.py", "Event Operations"),
        ("test_messages.py", "Message Operations"),
        ("test_tennis.py", "Tennis League Operations"),
    ]

    # Run all tests
    results = []
    for script_name, description in test_scripts:
        success = run_script(script_name, description)
        results.append((description, success))

    # Summary
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 Test Results Summary")
    print(f"{Fore.CYAN}{'='*60}")

    passed = 0
    failed = 0

    for description, success in results:
        if success:
            print(f"{Fore.GREEN}✅ {description}: PASSED")
            passed += 1
        else:
            print(f"{Fore.RED}❌ {description}: FAILED")
            failed += 1

    print(f"\n{Fore.CYAN}📈 Final Results:")
    print(f"{Fore.GREEN}   Passed: {passed}")
    print(f"{Fore.RED}   Failed: {failed}")
    print(f"{Fore.CYAN}   Total: {len(results)}")

    if failed == 0:
        print(
            f"\n{Fore.GREEN}🎉 All tests passed! Your GraphQL API is working correctly."
        )
    else:
        print(
            f"\n{Fore.YELLOW}⚠️  Some tests failed. Check the output above for details."
        )

    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
