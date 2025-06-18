# ChemLab Virtual - Interactive Chemistry Learning Platform

## Overview

ChemLab Virtual is a full-stack web application that provides an interactive virtual chemistry laboratory environment. The platform allows users to conduct chemistry experiments safely through step-by-step guided processes, track their progress, and learn through hands-on simulation.

## Features

- **Interactive Experiments**: Step-by-step chemistry experiments with virtual lab simulations
- **Progress Tracking**: Track your learning journey with detailed progress reports
- **Safe Learning Environment**: Practice dangerous or expensive experiments safely
- **Multiple Experiments**: Aspirin synthesis, acid-base titration, and more
- **Responsive Design**: Works on desktop and mobile devices

## Local Development Setup

### Prerequisites

Before running the application locally, make sure you have:

- **Node.js 18 or higher** installed on your system
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** for cloning the repository

### Installation Instructions

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd chemlab-virtual
   ```
   
   Or if you downloaded as a ZIP file, extract it and navigate to the folder in your terminal.

2. **Install Dependencies**
   ```bash
   npm install
   ```
   
   This will install all required packages for both frontend and backend.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   
   This command will:
   - Start the Express backend server on port 5000
   - Start the Vite frontend development server
   - Automatically open your browser to the application

4. **Access the Application**
   
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

### Project Structure

```
chemlab-virtual/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html         # HTML template
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and types
├── data/                # Sample experiment data
│   └── experiments.json # Experiment definitions
└── package.json         # Project dependencies
```

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build the application for production
- `npm run start` - Start production server

### Troubleshooting

**Port Already in Use**
If port 5000 is already in use, the application will automatically try the next available port.

**Dependencies Issues**
If you encounter dependency issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Browser Not Opening**
If the browser doesn't open automatically, manually navigate to `http://localhost:5000`

### Development Features

- **Hot Reload**: Changes to code automatically refresh the browser
- **TypeScript Support**: Full TypeScript support for both frontend and backend
- **Modern React**: Uses React 18 with modern hooks and patterns
- **Tailwind CSS**: Utility-first CSS framework for styling
- **API Integration**: RESTful API with progress tracking

### Database

The application uses in-memory storage for development, so data will reset when you restart the server. This is perfect for testing and development purposes.

### Contributing

1. Make your changes
2. Test the application thoroughly
3. Ensure all TypeScript types are correct
4. Submit your changes

For any issues or questions, please refer to the project documentation or create an issue in the repository.