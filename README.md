# ChemLab Virtual - Interactive Chemistry Learning Platform

A full-stack web application that provides an interactive virtual chemistry laboratory environment for conducting safe chemistry experiments through step-by-step guided processes.

## Features

- **Interactive Virtual Lab**: Drag-and-drop chemistry simulation with realistic animations
- **Step-by-Step Experiments**: Guided chemistry procedures with safety information
- **Real-Time Reactions**: Temperature control, stirring, and bubble animations
- **Educational Quizzes**: Built-in knowledge checks with immediate feedback
- **Progress Tracking**: Track completion across multiple experiments
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (optional - uses in-memory storage by default)
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm or yarn package manager

### Installation

1. **Download the project**
   ```bash
   git clone <repository-url>
   cd chemlab-virtual
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5000`
   - The application will be running with hot reload enabled

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking

## Project Structure

```
chemlab-virtual/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility libraries
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
├── data/                 # Experiment data (JSON)
└── dist/                # Production build output
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
# Optional: Database connection (uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@localhost:5432/chemlab

# Optional: Custom port (default: 5000)
PORT=5000

# Optional: Node environment
NODE_ENV=development
```

### Database Setup (Optional)

The application works with in-memory storage by default. For persistent data:

1. Set up a PostgreSQL database
2. Add `DATABASE_URL` to your `.env` file
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Local Development

### Hot Reload Development
```bash
npm run dev
```
- Frontend: React with Vite hot reload
- Backend: Node.js with tsx hot reload
- Serves on `http://localhost:5000`

### Production Build
```bash
npm run build
npm run start
```

## Available Experiments

1. **Aspirin Synthesis** - Learn esterification reactions
2. **Acid-Base Titration** - Master titration techniques

Each experiment includes:
- Interactive virtual lab with realistic chemistry simulation
- Step-by-step procedures with safety information
- Real-time temperature and reaction monitoring
- Educational quizzes and progress tracking

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Dependencies not installing**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**TypeScript errors**
```bash
# Run type checking
npm run check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Create an issue in the repository
- Review the project documentation in `replit.md`