# Naming Conventions, Code Style, and Documentation

## Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive, meaningful names

### Database Naming Conventions
- **ALWAYS use snake_case for PostgreSQL table names and column names**
- Use camelCase in Prisma schema for TypeScript compatibility
- Map Prisma fields to snake_case columns using `@map("column_name")`
- Map Prisma models to snake_case tables using `@@map("table_name")`
- Examples:
  - `createdAt` → `created_at`
  - `firstName` → `first_name`
  - `userId` → `user_id`
  - `isAdmin` → `is_admin`

## Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use trailing commas in objects and arrays
- Use template literals for string interpolation

## Documentation
- Write JSDoc comments for complex functions
- Document GraphQL schema with descriptions
- Keep README.md updated
- Document API endpoints
- Include usage examples
