# ChemLab Virtual - Interactive Chemistry Learning Platform

A full-stack web application that provides an interactive virtual chemistry laboratory environment for safe, hands-on learning through step-by-step guided experiments.

![ChemLab Virtual Demo](https://via.placeholder.com/800x400/2563eb/ffffff?text=ChemLab+Virtual+Lab)

## 🧪 Features

- **Interactive Virtual Lab**: Realistic lab equipment with drag-and-drop functionality
- **Step-by-Step Experiments**: Guided chemistry experiments with safety protocols
- **Progress Tracking**: Real-time progress monitoring and checkpoint system
- **Professional Equipment**: SVG-based lab instruments (flasks, beakers, burners, thermometers)
- **Safety Protocols**: Built-in safety guidelines and warnings
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** (Included with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chemlab-virtual.git
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
   Navigate to `http://localhost:5000`

### Platform-Specific Quick Start

#### Windows
Double-click `start-windows.bat`

#### Mac
Double-click `start-mac.command`

#### Linux
Run `./start-linux.sh`

## 📁 Project Structure

```
chemlab-virtual/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── lab-equipment/  # Virtual lab equipment
│   │   │   └── ui/         # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express server
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                # Shared types and schemas
├── data/                  # Experiment data
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **In-memory storage** (default) or PostgreSQL

### Development Tools
- **ESBuild** for fast compilation
- **PostCSS** for CSS processing
- **TypeScript** for type checking

## 🧬 Available Experiments

1. **Aspirin Synthesis**
   - Learn organic chemistry synthesis
   - Practice temperature control and timing
   - Understand reaction mechanisms

2. **Acid-Base Titration**
   - Master analytical chemistry techniques
   - Learn about pH indicators
   - Practice precise measurements

## 🎮 How to Use

1. **Browse Experiments**: Start at the home page to see available experiments
2. **Select an Experiment**: Click on any experiment card to begin
3. **Follow Instructions**: Each step provides detailed guidance and safety information
4. **Use Virtual Equipment**: Drag chemicals to equipment, control temperature, and monitor progress
5. **Track Progress**: Complete checkpoints and advance through steps
6. **View Results**: See your progress and experiment outcomes

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push database schema changes

# Type Checking
npm run check        # Run TypeScript type checking
```

### Environment Setup

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** (optional)
   ```env
   NODE_ENV=development
   DATABASE_URL=your_database_url_here
   ```

### Adding New Experiments

1. Add experiment data to `data/experiments.json`
2. Create step definitions with safety protocols
3. Add any custom equipment components if needed
4. Update experiment routing in the frontend

## 🚀 Deployment

### Local Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
docker build -t chemlab-virtual .
docker run -p 5000:5000 chemlab-virtual
```

### Cloud Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Deploy the built frontend with serverless functions
- **Railway**: Full-stack deployment with database
- **Heroku**: Traditional PaaS deployment

## 🛡️ Safety Features

- **Virtual Environment**: All experiments are simulated - completely safe
- **Safety Warnings**: Each step includes relevant safety information
- **Progress Validation**: Students must complete requirements before proceeding
- **Error Prevention**: Built-in safeguards prevent dangerous virtual operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use the existing component structure
- Add tests for new features
- Update documentation for any API changes
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/yourusername/chemlab-virtual/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join discussions in the repository

## 🙏 Acknowledgments

- Chemistry education community for feedback and requirements
- Open source libraries that make this project possible
- Educational institutions using virtual labs for safe learning

## 📊 Status

- ✅ Core virtual lab functionality
- ✅ Two complete experiments (Aspirin, Titration)
- ✅ Progress tracking and safety protocols
- ✅ Mobile-responsive design
- 🔄 Additional experiments (in progress)
- 🔄 Multiplayer collaboration features (planned)
- 🔄 Assessment and grading system (planned)

---

**Built with ❤️ for chemistry education**