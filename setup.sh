#!/bin/bash

# NeuralBrain Setup Script

echo "🧠 Setting up NeuralBrain Chrome Extension with Python Backend..."

# Create Python virtual environment
echo "Creating Python virtual environment..."
cd backend
python3 -m venv neuralbrain_env
source neuralbrain_env/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy environment file
echo "Setting up environment variables..."
cp .env.example .env
echo "⚠️  Please edit backend/.env with your API keys"

# Return to project root
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your API keys:"
echo "   - ANTHROPIC_API_KEY for Claude"
echo "   - OPENAI_API_KEY for GPT"
echo ""
echo "2. Start the Python backend:"
echo "   cd backend"
echo "   source neuralbrain_env/bin/activate"
echo "   python main.py"
echo ""
echo "3. Load the Chrome extension:"
echo "   - Open Chrome and go to chrome://extensions/"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked' and select the 'chrome-extension' folder"
echo ""
echo "4. Test the extension:"
echo "   - Open demos/test-page.html in Chrome"
echo "   - The extension will detect components and answer questions!"
echo ""
echo "📊 Server will be available at: http://127.0.0.1:8000"
echo "🔍 Health check: http://127.0.0.1:8000/health"
echo "📈 Stats: http://127.0.0.1:8000/stats"
