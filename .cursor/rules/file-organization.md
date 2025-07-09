# File Organization

## Frontend Structure
```
client/src/
├── components/     # Reusable UI components (use CSS Modules for styles)
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── store/         # Redux store and slices
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── styles/        # Tailwind CSS, global styles (e.g., tailwind.css, globals.css)
└── __tests__/     # Test files
```

## Backend Structure
```
server/src/
├── auth/          # Authentication logic
├── config/        # Configuration files
├── middleware/    # Express middleware
├── resolvers/     # GraphQL resolvers
├── schema/        # GraphQL schema
├── utils/         # Utility functions
└── __tests__/     # Test files
```
