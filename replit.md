# ChemLab Virtual - Interactive Chemistry Learning Platform

## Overview

ChemLab Virtual is a full-stack web application that provides an interactive virtual chemistry laboratory environment. The platform allows users to conduct chemistry experiments safely through step-by-step guided processes, track their progress, and learn through hands-on simulation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for experiments and user progress
- **Development**: Hot reload with Vite middleware integration
- **Session Management**: Simple session-based user tracking with localStorage

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL
- **Data Seeding**: JSON-based experiment data initialization

## Key Components

### Database Schema
- **Experiments Table**: Stores experiment metadata, steps, equipment, and safety information
- **User Progress Table**: Tracks individual user progress through experiments
- **Shared Types**: TypeScript types generated from Drizzle schema for type safety

### API Endpoints
- `GET /api/experiments` - Retrieve all available experiments
- `GET /api/experiments/:id` - Get specific experiment details
- `GET /api/progress/:userId` - Get user's progress across all experiments
- `GET /api/progress/:userId/:experimentId` - Get progress for specific experiment
- `PUT /api/progress` - Update user progress for an experiment

### Frontend Pages
- **Home Page**: Experiment catalog with filtering, hero section, and statistics
- **Experiment Page**: Step-by-step experiment execution with progress tracking
- **404 Page**: Error handling for unknown routes

### Core Features
- Interactive experiment cards with progress indicators
- Step-by-step experiment execution with timers
- **Interactive Virtual Lab**: Drag-and-drop chemistry simulation for aspirin synthesis
- **Educational Quizzes**: Built-in knowledge checks with immediate feedback
- **Chemical Measurement System**: Accurate chemical amounts and concentrations
- **Temperature Control**: Virtual heating and cooling with real-time monitoring
- Progress tracking with percentage completion
- Equipment lists and safety information
- Responsive design for mobile and desktop
- Modal dialogs for experiment details

## Data Flow

1. **Experiment Loading**: Client fetches experiment data from REST API
2. **User Identification**: Session-based user ID stored in localStorage
3. **Progress Tracking**: Real-time progress updates sent to server
4. **State Management**: React Query manages client-side caching and synchronization
5. **UI Updates**: Components re-render based on progress state changes

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- Routing and navigation (Wouter)
- UI components (Radix UI primitives, shadcn/ui)
- Styling (Tailwind CSS, class-variance-authority)
- Icons (Lucide React, React Icons)
- Form handling (React Hook Form, Hookform Resolvers)
- Date utilities (date-fns)

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database interactions
- Neon Database serverless driver
- Development tools (tsx, esbuild)

### Build and Development Tools
- Vite for frontend building and dev server
- TypeScript for type safety
- ESBuild for server bundling
- PostCSS and Autoprefixer for CSS processing

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Development Server**: Runs on port 5000 with Vite dev middleware
- **Hot Reload**: Automatic reload for both client and server code

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Autoscale deployment target on Replit
- **Port Configuration**: External port 80 mapped to internal port 5000

### Environment Configuration
- Database URL required for Drizzle configuration
- NODE_ENV-based conditional logic for development features
- Replit-specific plugins and middleware in development mode

## Changelog

- July 3, 2025: Fixed virtual lab environment layout and progress tracking system
  - Expanded lab bench to full width (6-column grid layout with more spacing)
  - Increased minimum height to 700px for better equipment visibility
  - Implemented comprehensive step-specific completion criteria
  - Added detailed requirements tracking showing real-time progress
  - Enhanced equipment positioning to prevent overlap and crowding
  - Fixed progress validation to require actual lab procedures instead of simple clicking
  - Added visual feedback for chemical drop zones and equipment interaction
  - Improved safety information display and professional lab appearance

- June 26, 2025: Created complete local deployment package and GitHub setup
  - Built comprehensive README.md with feature overview and quick start guide
  - Added detailed SETUP.md with platform-specific installation instructions
  - Created enhanced startup scripts for Windows, Mac, and Linux with better error handling
  - Added complete DEPLOYMENT.md guide covering cloud platforms and Docker
  - Created GITHUB_SETUP.md with repository configuration and CI/CD setup
  - Added Docker support with Dockerfile and docker-compose.yml
  - Created .env.example with comprehensive environment variable templates
  - Added MIT LICENSE for open source distribution
  - Enhanced .gitignore with comprehensive exclusion rules
  - Application now fully prepared for local development and production deployment

- June 26, 2025: Enhanced virtual lab with professional SVG-based equipment
  - Created realistic lab equipment components (flask, beakers, test tubes, burner, thermometer)
  - Implemented interactive stirring plate with proper controls and animations
  - Added graduated cylinder with precise measurement markings
  - Enhanced lab bench with sophisticated 3D visual effects and professional styling
  - Improved step progression system with checkpoint validation
  - Fixed timer functionality with proper start/pause/reset controls
  - Added equipment status monitoring and quick control panels
  - Virtual lab now provides professional-grade visual experience for students

- June 20, 2025: Made application downloadable and runnable locally
  - Created comprehensive README.md with installation instructions
  - Added SETUP.md with step-by-step local development guide
  - Created platform-specific startup scripts (Windows .bat, Mac .command, Linux .sh)
  - Added .env.example for environment configuration template
  - Created DOWNLOAD.md for easy distribution
  - Added DEPLOYMENT.md for production deployment options
  - Fixed TypeScript errors in virtual lab drag-and-drop handlers
  - Application now fully portable and runnable on any local device with Node.js

- June 20, 2025: Completely redesigned virtual lab interface
  - Enhanced visual design with realistic flask rendering and lab bench
  - Implemented smooth stirring rod animations using requestAnimationFrame
  - Added dynamic bubble generation during reactions with physics movement
  - Improved drag-and-drop with visual feedback and smooth transitions
  - Created professional control panel with organized temperature and stirring controls
  - Enhanced chemical cards showing formulas, densities, and color indicators
  - Upgraded interactive quiz system with helpful hints and better feedback
  - Interface now matches professional chemistry simulators like ChemCollective

- June 18, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.