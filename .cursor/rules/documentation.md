# Documentation Standards

## Automatic Documentation Updates
- **ALWAYS update documentation** when making code changes that affect:
  - API endpoints or GraphQL schema
  - Environment variables or configuration
  - New features or functionality
  - Breaking changes or deprecations
  - Security updates or changes
  - Database schema changes
  - New dependencies or removed dependencies

## Documentation Update Checklist
When making code changes, automatically check and update:
- [ ] **README.md** - Update relevant sections (features, setup, troubleshooting)
- [ ] **FEATURES.md** - Add new features or update existing ones
- [ ] **env.example** - Add new environment variables
- [ ] **API documentation** - Update GraphQL schema descriptions
- [ ] **Inline comments** - Add JSDoc comments for new functions
- [ ] **Type definitions** - Update TypeScript interfaces
- [ ] **Migration files** - Add descriptive comments for database changes

## Documentation Patterns
- **Keep documentation in sync** with code changes
- **Update examples** when API signatures change
- **Add troubleshooting notes** for common issues
- **Include usage examples** for new features
- **Document breaking changes** clearly
- **Update version requirements** when dependencies change

## Code-Documentation Synchronization
- **Before committing**: Review if documentation needs updates
- **For new features**: Document the feature, usage, and examples
- **For bug fixes**: Update troubleshooting sections if relevant
- **For refactoring**: Update affected documentation sections
- **For configuration changes**: Update setup and deployment docs
