# ChemLab Virtual - Local Setup Guide

This guide will help you set up ChemLab Virtual on your local machine for development or personal use.

## 📋 Prerequisites

### Required Software

1. **Node.js 18 or later**
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - Verify installation: `node --version` and `npm --version`

2. **Git** (for cloning the repository)
   - Download from [https://git-scm.com/](https://git-scm.com/)
   - Verify installation: `git --version`

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/chemlab-virtual.git

# OR using SSH (if you have SSH keys set up)
git clone git@github.com:yourusername/chemlab-virtual.git

# Navigate to the project directory
cd chemlab-virtual
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install both frontend and backend dependencies
# Takes 2-5 minutes depending on your internet connection
```

### Step 3: Environment Configuration (Optional)

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file if needed (optional for basic usage)
# The default settings work for local development
```

### Step 4: Start the Application

```bash
# Start the development server
npm run dev

# You should see output like:
# Loaded experiment 1: Aspirin Synthesis
# Loaded experiment 2: Acid-Base Titration
# Total experiments loaded: 2
# [express] serving on port 5000
```

### Step 5: Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

You should see the ChemLab Virtual home page with available experiments.

## 🖥️ Platform-Specific Instructions

### Windows

1. **Using the Batch File**
   - Double-click `start-windows.bat`
   - A command prompt will open and start the server
   - Your default browser should open automatically

2. **Manual Setup**
   ```cmd
   # Open Command Prompt or PowerShell
   cd path\to\chemlab-virtual
   npm install
   npm run dev
   ```

### macOS

1. **Using the Command File**
   - Double-click `start-mac.command`
   - You may need to allow it in System Preferences > Security & Privacy
   - Terminal will open and start the server

2. **Manual Setup**
   ```bash
   # Open Terminal
   cd /path/to/chemlab-virtual
   npm install
   npm run dev
   ```

### Linux

1. **Using the Shell Script**
   ```bash
   # Make the script executable
   chmod +x start-linux.sh
   
   # Run the script
   ./start-linux.sh
   ```

2. **Manual Setup**
   ```bash
   # Open terminal
   cd /path/to/chemlab-virtual
   npm install
   npm run dev
   ```

## 🔧 Troubleshooting

### Common Issues

#### Port 5000 Already in Use
```bash
# Error: EADDRINUSE: address already in use :::5000

# Solution 1: Kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Solution 2: Use a different port
PORT=3000 npm run dev
```

#### npm install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If you have permission issues on Windows
npm install --no-optional
```

#### TypeScript Errors
```bash
# Run type checking
npm run check

# If types are missing
npm install --save-dev @types/node
```

#### Git Clone Issues
```bash
# If HTTPS clone fails, try:
git config --global http.sslVerify false
git clone https://github.com/yourusername/chemlab-virtual.git

# Then re-enable SSL
git config --global http.sslVerify true
```

### Performance Issues

#### Slow Loading
- Ensure you have a stable internet connection during `npm install`
- Close other applications to free up RAM
- Use `npm run build` for production mode (faster but no hot reload)

#### Browser Compatibility
- Use Chrome, Firefox, Safari, or Edge (latest versions)
- Enable JavaScript and disable ad blockers for localhost
- Clear browser cache if experiencing issues

## 🗃️ Database Setup (Optional)

The application uses in-memory storage by default, but you can configure PostgreSQL:

### PostgreSQL Setup

1. **Install PostgreSQL**
   - Download from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

2. **Create Database**
   ```sql
   CREATE DATABASE chemlab_virtual;
   CREATE USER chemlab_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE chemlab_virtual TO chemlab_user;
   ```

3. **Update Environment**
   ```env
   DATABASE_URL=postgresql://chemlab_user:your_password@localhost:5432/chemlab_virtual
   ```

4. **Push Schema**
   ```bash
   npm run db:push
   ```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start

# The built files will be in the dist/ directory
```

## 📁 Project Structure Overview

```
chemlab-virtual/
├── client/src/          # React frontend source
├── server/              # Express backend source
├── shared/              # Shared TypeScript types
├── data/                # Experiment data files
├── dist/                # Built application (after npm run build)
├── node_modules/        # Dependencies (after npm install)
├── package.json         # Project configuration
├── README.md           # Main documentation
└── SETUP.md            # This file
```

## 🔄 Development Workflow

1. **Make Changes**: Edit files in `client/src/` or `server/`
2. **Hot Reload**: Changes automatically reload in the browser
3. **Type Check**: Run `npm run check` to verify TypeScript
4. **Build**: Run `npm run build` to create production files
5. **Test**: Access `http://localhost:5000` to test changes

## 🌐 Accessing from Other Devices

To access the application from other devices on your network:

1. **Find Your IP Address**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Start with External Access**
   ```bash
   # The server already binds to 0.0.0.0:5000
   npm run dev
   ```

3. **Access from Other Devices**
   ```
   http://YOUR_IP_ADDRESS:5000
   # Example: http://192.168.1.100:5000
   ```

## 🛡️ Security Notes

- The default setup is for local development only
- For production deployment, configure proper authentication
- Use HTTPS in production environments
- Keep dependencies updated with `npm audit` and `npm update`

## 📞 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Search existing [GitHub Issues](https://github.com/yourusername/chemlab-virtual/issues)
3. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages
   - Steps to reproduce

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Development server starts (`npm run dev`)
- [ ] Application loads at `http://localhost:5000`
- [ ] Can navigate to experiments page
- [ ] Virtual lab components load properly
- [ ] No console errors in browser developer tools

---

**Ready to explore virtual chemistry!** 🧪