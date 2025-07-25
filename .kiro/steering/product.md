# Product Overview

## Groups - Social & Sports Club Management Platform

A modern, full-stack web application for managing social and sports groups with real-time communication, event management, and comprehensive tennis league functionality.

## Core Features

- **Multi-Authentication**: Local email/password, Google, GitHub, Facebook OAuth
- **Group Management**: Create public/private groups with role-based access control
- **Real-Time Chat**: WebSocket-based messaging with message history
- **Event Management**: Event scheduling with RSVP system (Available, Not Available, Maybe, Only if Needed)
- **Tennis Module**: Complete tennis league management with teams, matches, and standings
- **Progressive Web App**: Installable with offline capabilities
- **Expenses Module**: Track shared group expenses, assign payer, split costs, and view settlements (Splitwise-style).

## Key Modules

### User Management

- Email verification and password reset flows
- Comprehensive user profiles with avatars
- Session management with Redis

### Group System

- Public/private group creation
- Member administration with admin privileges
- User blocking system for moderation

### Tennis League System

- League creation and management
- Team organization (teams are represented by groups)
- Match scheduling (singles and doubles)
- Configurable point systems
- Real-time standings calculation

### Expenses Module

- Create and track group expenses
- Assign payer and split among members
- View balances and settlements per group
- Integrated with Dashboard and dedicated Expenses page

## Target Users

- Sports clubs and recreational leagues
- Social groups and communities
- Tennis clubs and tournament organizers
- Community organizers requiring member management

## Business Value

- Streamlines group administration
- Enhances member engagement through real-time features
- Provides comprehensive sports league management
- Reduces administrative overhead for organizers
- Simplifies shared expense tracking for clubs and groups
- Increases transparency and reduces disputes

- **Settlements & Group Settings**: Track and settle group debts, configure group-level payment and permission settings.
- **Tennis Lineup Management**: Drag-and-drop lineup creation, slot validation, and visibility controls for team matches.
- **Advanced Monitoring & Backup**: Real-time health checks, backup, and alerting for reliability.
