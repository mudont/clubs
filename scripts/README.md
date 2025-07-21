# Scripts Documentation

This directory contains various utility scripts for testing and managing the clubs application.

## Authentication Scripts

### `login.py`
Interactive login script that supports both command-line and interactive modes.

**Usage:**
```bash
# Command line mode
python scripts/login.py login <username> <password>

# Interactive mode
python scripts/login.py
```

**Features:**
- Stores JWT token in `.token` file
- Supports both login and signup
- Interactive menu for multiple operations
- Error handling and validation

### `graphql_client.py`
Base GraphQL client class used by other scripts.

**Features:**
- Token-based authentication
- Query, mutation, and subscription support
- Error handling and retry logic
- Connection management

## Test Scripts

### `test_users.py`
Tests user-related GraphQL operations.

### `test_groups.py`
Tests group management operations.

### `test_events.py`
Tests event creation and management.

### `test_messages.py`
Tests messaging functionality.

### `test_tennis_leagues.py`
Tests tennis league operations.

### `test_expenses.py`
Tests the expenses module functionality.

**Features:**
- Tests expense creation and retrieval
- Tests debt calculation and summary
- Tests settlement generation
- Tests group settings
- Creates test data for validation

**Usage:**
```bash
python scripts/test_expenses.py
```

**Prerequisites:**
- Must be logged in (run `login.py` first)
- Must have at least one group with 2+ members

### `run_all_tests.py`
Master script that runs all test scripts sequentially.

**Usage:**
```bash
python scripts/run_all_tests.py
```

## Database Scripts

### `db_dump.py`
Dumps PostgreSQL database to a file.

**Usage:**
```bash
python scripts/db_dump.py [options]
```

**Options:**
- `--format`: Output format (sql, custom, directory, tar) [default: custom]
- `--output`: Output file path [default: auto-generated]
- `--verbose`: Enable verbose output

**Features:**
- Automatically finds `.env` file recursively
- Supports multiple output formats
- Detailed logging and progress tracking
- Error handling and validation

### `db_restore.py`
Restores PostgreSQL database from a dump file.

**Usage:**
```bash
python scripts/db_restore.py <dump_file> [options]
```

**Options:**
- `--drop-existing`: Drop all tables before restore
- `--verbose`: Enable verbose output

**Features:**
- Automatically detects dump format
- Safe restore with table dropping option
- Progress tracking and validation
- Error handling and rollback support

## Expenses Module

The expenses module provides Splitwise-like payment splitting and settlement functionality.

### Features
- **Expense Tracking**: Create, update, and delete expenses
- **Multiple Split Types**: Equal, percentage, custom amounts, shares
- **Debt Calculation**: Automatic calculation of who owes what
- **Settlement Generation**: Optimal settlement algorithms
- **Payment Tracking**: Mark settlements as paid with payment methods
- **Group Settings**: Configure expense behavior per group

### Database Schema
- `expenses`: Core expense records
- `expense_splits`: How expenses are split among members
- `settlements`: Payment settlements between members
- `group_settings`: Group-specific expense configuration

### GraphQL Operations
- **Queries**: Get expenses, settlements, debt summaries, settings
- **Mutations**: Create/update expenses, settlements, settings
- **Utilities**: Generate optimal settlements, bulk operations

### Frontend Components
- `ExpenseForm`: Create and edit expenses with split configuration
- `DebtSummary`: Visual debt overview with individual breakdowns
- `SettlementList`: Manage settlements and mark payments

### Testing
Use `test_expenses.py` to verify the module functionality:
```bash
python scripts/test_expenses.py
```

## Environment Setup

All scripts automatically find the `.env` file by searching up the directory tree. The `.env` file should contain:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
GRAPHQL_URL=http://localhost:4000/graphql
```

## Error Handling

All scripts include comprehensive error handling:
- Network connection issues
- Authentication failures
- Database errors
- GraphQL errors
- File I/O errors

## Logging

Scripts provide detailed logging with:
- Progress indicators
- Error messages with context
- Success confirmations
- Timing information

## Dependencies

Required Python packages:
- `requests`: HTTP client for GraphQL operations
- `psycopg2-binary`: PostgreSQL adapter
- `python-dotenv`: Environment variable loading
- `colorama`: Colored terminal output (optional)

Install with:
```bash
pip install requests psycopg2-binary python-dotenv colorama
```
