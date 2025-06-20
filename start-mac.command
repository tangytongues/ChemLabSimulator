#!/bin/bash

echo "Starting ChemLab Virtual..."
echo

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
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

# Open browser automatically (optional)
sleep 2 && open http://localhost:5000 &

npm run dev

read -p "Press any key to exit..."