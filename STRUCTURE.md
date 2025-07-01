# 🧠 NeuralBrain - Project Structure

## Overview
```
nerubrain/
├── 📁 chrome-extension/       # Chrome Extension Files
│   ├── 📄 manifest.json      # Extension configuration
│   ├── 🎨 popup.html         # Extension popup interface
│   ├── ⚙️ popup.js           # Popup logic
│   ├── 🔍 content.js         # Component detection script
│   ├── 🔄 background.js      # Service worker
│   ├── 💄 styles.css         # Answer bubble styles
│   └── 📖 README.md          # Extension documentation
├── 📁 backend/                # Python Backend Server
│   ├── 🐍 main.py            # FastAPI application
│   ├── 📋 requirements.txt   # Python dependencies
│   ├── 🚀 start.sh           # Server startup script
│   ├── 🔐 .env.example       # Environment template
│   └── 📖 README.md          # Backend documentation
├── 📁 demos/                  # Demo & Test Files
│   ├── 🌐 test-page.html     # Interactive test page
│   └── 📖 README.md          # Demo documentation
├── 🔧 .gitignore             # Git ignore patterns
├── 📦 package.json           # Project metadata
├── ⚖️ LICENSE                # MIT License
├── 🛠️ setup.sh               # Project setup script
└── 📖 README.md              # Main documentation
```

## Key Components

### 🎯 Chrome Extension
- **Real-time Detection**: DOM mutation observers
- **AI Integration**: REST API communication
- **Beautiful UI**: Modern popup with status indicators
- **Smart Bubbles**: Floating answer displays

### 🤖 Python Backend
- **FastAPI Server**: High-performance async API
- **AI Providers**: Claude (Sonnet) + OpenAI GPT
- **Demo Mode**: Fallback responses when APIs unavailable
- **Health Monitoring**: Status endpoints and logging

### 🧪 Testing & Demos
- **Interactive Test Page**: Various components and questions
- **Real-time Monitoring**: Extension popup statistics
- **Demo Documentation**: Usage examples and guides

## Quick Start

1. **Setup Project**: `./setup.sh`
2. **Configure APIs**: Edit `backend/.env`
3. **Start Backend**: `cd backend && ./start.sh`
4. **Install Extension**: Load `chrome-extension/` in Chrome
5. **Test**: Open `demos/test-page.html`

## Features

✅ **Production Ready**: Error handling, logging, CORS  
✅ **Privacy First**: Local processing, no data collection  
✅ **AI Powered**: Claude + GPT with intelligent fallbacks  
✅ **Real-time**: Live component detection and monitoring  
✅ **Beautiful UI**: Modern gradients and smooth animations  
✅ **Well Documented**: READMEs in every directory  

---

**Total Files**: 17 core files (clean, organized structure)  
**Languages**: JavaScript, Python, HTML, CSS  
**Dependencies**: FastAPI, Chrome APIs, AI APIs  
**License**: MIT (open source)  
