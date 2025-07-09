# Express & Backend Standards

- Use Express 5 with proper middleware typing
- Implement comprehensive input validation with Joi
- Use rate limiting for security endpoints
- Implement proper error handling with logging
- Use Prisma for all database operations

## Database Naming Conventions

### PostgreSQL Schema Standards
- **ALWAYS use snake_case for table names and column names** in PostgreSQL
- Use `@@map("table_name")` directive to map Prisma model names to snake_case table names
- Use `@map("column_name")` directive to map Prisma field names to snake_case column names
- Maintain camelCase in Prisma schema for TypeScript compatibility
- Example:
  ```prisma
  model User {
    id        String   @id @default(uuid())
    createdAt DateTime @default(now()) @map("created_at")
    updatedAt DateTime @updatedAt @map("updated_at")
    firstName String?  @map("first_name")
    lastName  String?  @map("last_name")

    @@map("users")
  }
  ```

### Database Migration Standards
- When adding new models or fields, **ALWAYS include @map directives** for snake_case mapping
- Use descriptive migration names: `YYYYMMDDHHMMSS_descriptive_name`
- Test migrations on development database before applying to production
- Ensure all foreign key relationships use snake_case column names
- Maintain referential integrity with proper cascade rules
