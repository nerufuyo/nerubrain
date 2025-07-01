#!/bin/bash

# Start nerubrain Backend Server

echo "Starting nerubrain Backend Server..."

# Check if virtual environment exists
if [ ! -d "neuralbrain_env" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source neuralbrain_env/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before starting the server."
    exit 1
fi

# Start the server
echo "🚀 Starting FastAPI server on http://localhost:8000"
echo "📊 Health check: http://localhost:8000/health"
echo "📈 Stats: http://localhost:8000/stats"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python main.py
