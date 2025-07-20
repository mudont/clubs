# GraphQL Test Scripts for Clubs Application

This directory contains Python scripts to test all GraphQL operations in the Clubs application from the command line.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure your server is running:**
   ```bash
   # In the server directory
   npm run dev
   ```

## Authentication

The authentication system now uses **GraphQL mutations** instead of REST endpoints for a consistent API experience.

### Login
```bash
python login.py
# or
python login.py login
```
This will prompt for username and password, then store the JWT token in a `.token` file.

### Signup
```bash
python login.py signup
```
Create a new account with username, email, password, and optional first/last name.

### Check Authentication
```bash
python login.py check
```

### Logout
```bash
python login.py logout
```

### Interactive Menu
```bash
python login.py
```
Shows an interactive menu with options for login, signup, check auth, and logout.

## Database Management

### Database Dump
Create a backup of your PostgreSQL database:

```bash
# Basic dump (auto-generated filename with timestamp)
python db_dump.py

# Custom output file
python db_dump.py --output my_backup.dump

# Different formats
python db_dump.py --format plain --output backup.sql
python db_dump.py --format custom --output backup.dump
python db_dump.py --format directory --output backup_dir/

# Specify .env file location
python db_dump.py --env-file /path/to/.env
```

**Options:**
- `--output, -o`: Output file path (default: auto-generated)
- `--format, -f`: Output format (`custom`, `plain`, `directory`)
- `--env-file`: Path to .env file (default: auto-detect)

### Database Restore
Restore database from a dump file:

```bash
# Basic restore (auto-detects format)
python db_restore.py backup.dump

# Specify format explicitly
python db_restore.py backup.sql --format plain

# Drop existing database before restore
python db_restore.py backup.dump --drop-existing

# Specify .env file location
python db_restore.py backup.dump --env-file /path/to/.env
```

**Options:**
- `dump_file`: Path to the dump file to restore from
- `--format, -f`: Dump file format (auto-detected if not specified)
- `--drop-existing, -d`: Drop existing database before restore
- `--env-file`: Path to .env file (default: auto-detect)

### Environment File Detection
Both scripts automatically find your `.env` file by looking recursively up the directory tree. They look for:
1. Current directory
2. Parent directories
3. Until root directory

The scripts expect a `DATABASE_URL` in your `.env` file:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

## GraphQL Authentication Mutations

The server now supports these GraphQL mutations:

### Login
```graphql
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
```

### Signup
```graphql
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
```

### Change Password
```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    success
    message
  }
}
```

## Individual Test Scripts

### 1. User Operations (`test_users.py`)
Tests user profile operations:
- Get user profile
- Update profile
- Change password
- User search
- Delete user

```bash
python test_users.py
```

### 2. Group Operations (`test_groups.py`)
Tests group management operations:
- Get my groups
- Get public groups
- Create group
- Get group details
- Get group members
- User search
- Group search
- Update group
- Leave/join group
- Delete group

```bash
python test_groups.py
```

### 3. Event Operations (`test_events.py`)
Tests event management operations:
- Create event
- Get events
- Create RSVP
- Update RSVP
- Update event
- Get user pending events
- Delete event

```bash
python test_events.py
```

### 4. Message Operations (`test_messages.py`)
Tests messaging operations:
- Get messages
- Send message
- Message subscriptions (WebSocket)

```bash
python test_messages.py
```

### 5. Tennis League Operations (`test_tennis.py`)
Tests tennis league operations:
- Get user tennis leagues
- Get all tennis leagues
- Get league details
- Get tennis matches
- Get tennis lineups
- Get user tennis stats

```bash
python test_tennis.py
```

## Run All Tests

To run all test scripts in sequence:

```bash
python run_all_tests.py
```

This will:
1. Check authentication
2. Run all test scripts in order
3. Provide a summary of results

## Features

### GraphQL Client (`graphql_client.py`)
- **Authentication**: Automatic JWT token management
- **Queries & Mutations**: HTTP POST requests to `/graphql`
- **Subscriptions**: WebSocket support for real-time updates
- **Error Handling**: Comprehensive error reporting
- **Colored Output**: Beautiful terminal output with colorama

### Token Management
- Tokens are stored in `.token` file
- Automatic token loading for authenticated requests
- Token validation and refresh handling

### WebSocket Support
- Real-time message subscriptions
- Connection management
- Message callbacks

### Database Tools
- **Automatic .env detection**: Finds .env file recursively up directory tree
- **Multiple formats**: Support for custom, plain SQL, and directory formats
- **Format auto-detection**: Automatically detects dump file format
- **Safe operations**: Includes options to drop existing databases safely
- **Comprehensive error handling**: Detailed error messages and validation

## Test Coverage

The scripts test all GraphQL operations from `client/src/graphql/`:

- **Event.ts**: All event queries and mutations
- **Group.ts**: All group management operations
- **User.ts**: All user profile operations
- **Message.ts**: Messaging and subscriptions
- **TennisLeague.ts**: Tennis league operations

## Error Handling

- **Authentication errors**: Clear messages about login requirements
- **GraphQL errors**: Detailed error reporting from the server
- **Network errors**: Connection timeout and retry handling
- **Validation errors**: Input validation error messages
- **Database errors**: Comprehensive PostgreSQL error reporting

## Usage Examples

### Quick Test
```bash
# Login first
python login.py

# Run all tests
python run_all_tests.py
```

### Individual Testing
```bash
# Test just groups
python test_groups.py

# Test just messages with subscriptions
python test_messages.py
```

### Database Management
```bash
# Create backup
python db_dump.py

# Restore from backup
python db_restore.py db_dump_clubs_20241220_143022.dump

# Restore with drop existing
python db_restore.py backup.dump --drop-existing
```

### Debug Mode
```bash
# Check authentication status
python login.py check

# Test specific operations by modifying the scripts
```

## Troubleshooting

### Common Issues

1. **Server not running**
   - Make sure your server is running on `http://localhost:4010`
   - Check server logs for errors

2. **Authentication failed**
   - Run `python login.py` to authenticate
   - Check if your credentials are correct

3. **WebSocket connection failed**
   - Ensure WebSocket server is running
   - Check firewall settings

4. **Import errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Check Python version (3.7+ required)

5. **Database connection failed**
   - Check `DATABASE_URL` in your `.env` file
   - Ensure PostgreSQL server is running
   - Verify credentials and permissions

6. **pg_dump/pg_restore not found**
   - Install PostgreSQL client tools
   - On macOS: `brew install postgresql`
   - On Ubuntu: `sudo apt-get install postgresql-client`

### Debug Information

The scripts provide detailed output including:
- Request/response data
- GraphQL errors
- Network errors
- Authentication status
- Database connection details
- File operations status

## File Structure

```
scripts/
├── requirements.txt          # Python dependencies
├── graphql_client.py         # Base GraphQL client
├── login.py                  # Authentication script (GraphQL)
├── db_dump.py               # Database dump tool
├── db_restore.py            # Database restore tool
├── test_users.py            # User operations tests
├── test_groups.py           # Group operations tests
├── test_events.py           # Event operations tests
├── test_messages.py         # Message operations tests
├── test_tennis.py           # Tennis operations tests
├── run_all_tests.py         # Master test runner
└── README.md                # This file
```

## Contributing

To add new test scripts:

1. Create a new script following the naming convention `test_*.py`
2. Import `GraphQLClient` and use the standard patterns
3. Add the script to `run_all_tests.py`
4. Update this README with documentation

## Dependencies

- `requests`: HTTP client for GraphQL queries/mutations
- `websockets`: WebSocket client for subscriptions
- `python-dotenv`: Environment variable management
- `colorama`: Colored terminal output
