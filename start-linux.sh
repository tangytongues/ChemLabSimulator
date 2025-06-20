#!/bin/bash

echo "Starting ChemLab Virtual..."
echo

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js:"
    echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    echo "  Or visit: https://nodejs.org/"
    echo
    read -p "Press any key to exit..."
    exit 1
fi

# Display Node.js version
echo "Node.js version:"
node --version
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take a few minutes on first run..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        read -p "Press any key to exit..."
        exit 1
    fi
    echo
fi

# Start the application
echo "Starting ChemLab Virtual server..."
echo
echo "The application will be available at: http://localhost:5000"
echo
echo "To stop the server, press Ctrl+C"
echo

# Try to open browser automatically (if available)
if command -v xdg-open &> /dev/null; then
    sleep 2 && xdg-open http://localhost:5000 &
elif command -v gnome-open &> /dev/null; then
    sleep 2 && gnome-open http://localhost:5000 &
fi

npm run dev

read -p "Press any key to exit..."