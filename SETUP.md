# Local Setup Guide - ChemLab Virtual

This guide will help you download and run ChemLab Virtual on your local machine.

## System Requirements

- **Node.js**: Version 18 or higher (recommended: Node.js 20)
- **RAM**: Minimum 4GB, recommended 8GB
- **Disk Space**: At least 1GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Step-by-Step Installation

### 1. Download Node.js

If you don't have Node.js installed:

**Windows/Mac:**
- Visit [nodejs.org](https://nodejs.org/)
- Download and install the LTS version

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version
npm --version
```

### 2. Download the Project

**Option A: Download ZIP**
1. Download the project ZIP file
2. Extract to your desired folder
3. Open terminal/command prompt in that folder

**Option B: Git Clone**
```bash
git clone <repository-url>
cd chemlab-virtual
```

### 3. Install Dependencies

```bash
npm install
```

This will download all required packages (~200MB). May take 2-5 minutes depending on your internet speed.

### 4. Start the Application

```bash
npm run dev
```

You should see:
```
[express] serving on port 5000
[vite] ready in Xms
```

### 5. Open in Browser

Navigate to: `http://localhost:5000`

The ChemLab Virtual application will load with the home page showing available experiments.

## Production Build (Optional)

For better performance in production:

```bash
npm run build
npm run start
```

## Troubleshooting

### Port 5000 Already in Use

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Permission Errors (Linux/Mac)

```bash
sudo chown -R $(whoami) ~/.npm
```

### Slow Installation

If npm install is slow, try using a faster registry:
```bash
npm install --registry https://registry.npmmirror.com/
```

### Memory Issues

If you encounter memory errors:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## File Structure After Installation

```
chemlab-virtual/
├── node_modules/          # Dependencies (auto-generated)
├── client/               # Frontend React app
├── server/               # Backend Express server
├── data/                 # Experiment definitions
├── shared/               # Shared TypeScript types
├── package.json          # Project configuration
└── dist/                 # Production build (after npm run build)
```

## Development Mode Features

When running `npm run dev`:
- **Hot Reload**: Changes to code automatically refresh the browser
- **TypeScript Checking**: Real-time error checking
- **Development Logging**: Detailed console output for debugging

## Offline Usage

Once installed, the application works completely offline:
- All experiments are stored locally in JSON files
- No external API calls required
- User progress stored in browser memory

## Next Steps

1. Open `http://localhost:5000` in your browser
2. Click on "Aspirin Synthesis" experiment
3. Follow the step-by-step lab procedures
4. Drag chemicals into the virtual flask
5. Control temperature and stirring
6. Complete knowledge check quizzes

## Getting Help

- Check `README.md` for detailed documentation
- Review `replit.md` for technical architecture
- Common issues are covered in the troubleshooting section above