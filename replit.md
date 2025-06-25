# GameZone Tournament Platform

## Overview

GameZone is a modern esports tournament registration platform built for hosting gaming events, specifically focusing on Valorant and Call of Duty tournaments. The application provides a comprehensive solution for team registration, event information display, and tournament management with a gaming-themed user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming theme variables
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema**: Centralized schema definition in `/shared/schema.ts`
- **Validation**: Zod schemas for runtime type checking

## Key Components

### Database Schema
The application uses two main tables:

**Teams Table:**
- Team identification (id, teamName, game)
- Captain contact information (captainEmail, captainPhone)
- Five player details (name and gaming ID for each player)
- Registration timestamp

**Game Scores Table:**
- Score identification (id, playerName, score, gameType)
- Creation timestamp for leaderboard ordering

### API Endpoints
- `POST /api/teams` - Team registration with validation
- `GET /api/teams/check/:teamName` - Team name availability checking
- `GET /api/teams/stats` - Tournament statistics (team counts by game)
- `POST /api/game-scores` - Submit game scores for leaderboard
- `GET /api/game-scores/leaderboard/:gameType` - Get top scores for game type

### Frontend Components
- **Navigation**: Sticky header with smooth scrolling navigation and gaming branding
- **Hero Section**: Enhanced gamer-style header with decorative elements and updated branding
- **Tournament Showcase**: Game-specific tournament information
- **Team Registration**: Multi-step form with real-time validation
- **Event Schedule**: Single-day tournament timeline (8 hours of events)
- **Fun Zone**: Additional event activities
- **Reaction Game**: Interactive reaction speed challenge with leaderboard system
- **Venue Information**: Location and facility details

### Storage Implementation
- **Interface**: `IStorage` abstraction for data operations
- **Implementation**: `MemStorage` class for in-memory storage (development)
- **Design**: Prepared for easy migration to database-backed storage

## Data Flow

1. **User Registration**: Team captains fill out registration forms
2. **Validation**: Client-side and server-side validation using Zod schemas
3. **Team Name Checking**: Real-time availability checking via API
4. **Data Persistence**: Team data stored through storage interface
5. **Statistics Updates**: Real-time tournament statistics display
6. **User Feedback**: Toast notifications for success/error states

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Development Dependencies
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Development Server**: Runs on port 5000 with hot module replacement
- **Database**: Development database provisioned via environment variables

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Autoscale deployment target on external port 80
- **Database**: Production PostgreSQL connection via `DATABASE_URL`

### Configuration
- **Environment**: NODE_ENV for environment detection
- **Database**: DATABASE_URL for PostgreSQL connection
- **Static Assets**: Served from `dist/public` in production
- **API Routes**: Served from Express server with error handling

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 25, 2025**: Updated website design and features
  - Changed title from "GameZone" to "Game Night: Reignite 25'"
  - Redesigned header with more gaming aesthetic and decorative elements
  - Updated schedule to single day format (8 hours of events)
  - Added interactive Reaction Speed Challenge game with real-time leaderboard
  - Enhanced navigation with new "Game" section
  - Fixed CSS import order to resolve build warnings

## Changelog

- June 25, 2025: Initial setup and major feature updates