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
The application uses a single `teams` table with the following structure:
- Team identification (id, teamName, game)
- Captain contact information (captainEmail, captainPhone)
- Five player details (name and gaming ID for each player)
- Registration timestamp

### API Endpoints
- `POST /api/teams` - Team registration with validation
- `GET /api/teams/check/:teamName` - Team name availability checking
- `GET /api/teams/stats` - Tournament statistics (team counts by game)

### Frontend Components
- **Navigation**: Sticky header with smooth scrolling navigation
- **Hero Section**: Main landing area with call-to-action buttons
- **Tournament Showcase**: Game-specific tournament information
- **Team Registration**: Multi-step form with real-time validation
- **Event Schedule**: Tournament timeline and activities
- **Fun Zone**: Additional event activities
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

## Changelog

Changelog:
- June 25, 2025. Initial setup