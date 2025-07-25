# Coursera Automation Extension

A comprehensive browser extension that intelligently automates Coursera learning activities while maintaining academic integrity and enhancing the learning experience.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Automation Features
- **Quiz Automation** - Intelligent quiz completion with answer validation
- **Video Management** - Automated video playback with speed optimization
- **Reading Materials** - Smart reading completion tracking
- **Ungraded Plugins** - Automated handling of interactive elements
- **Discussion Participation** - Structured discussion engagement
- **Shareable Links** - Easy content sharing functionality
- **Advanced Analytics** - Performance tracking and improvement suggestions

### Technical Features
- **Manifest V3** - Modern browser extension architecture
- **TypeScript** - Type-safe development with enhanced DX
- **100% Test Coverage** - Comprehensive testing with Jest
- **Clean Architecture** - SOLID principles and clean code
- **Error Handling** - Robust error reporting and recovery
- **Privacy-First** - Local processing with minimal data collection

## Architecture

### Frontend (Browser Extension)
```
src/
├── background/         # Service worker
├── content/           # Content scripts
├── popup/             # Extension popup
├── core/              # Core automation logic
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

### Backend (Python API)
```
backend/
├── main.py           # FastAPI application
├── models/           # Data models
├── services/         # Business logic
└── tests/            # Backend tests
```

## Quick Start

### 1. Load Extension (2 minutes)
1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Turn ON "Developer mode" (toggle top-right)
4. Click "Load unpacked"
5. Select folder: `/path/to/nerubrain/dist`
6. Extension loads with blue circular icon

### 2. Test Basic Functionality (1 minute)
1. Click extension icon on ANY website
2. Popup should open immediately
3. Shows page information and controls

### 3. Test on Coursera (2 minutes)
1. Go to: https://www.coursera.org/learn/machine-learning
2. Click extension icon
3. Should show "Coursera Page" and "Automatable: Yes"
4. "Start Automation" button should be ENABLED

## Installation

### Prerequisites
- Chrome browser
- Node.js 18+ and npm
- Python 3.8+

### Backend Setup
```bash
# Navigate to backend directory
cd nerubrain/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server (from backend directory)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development build with watch mode
npm run dev

# Build for production
npm run build
```

### Loading Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder
4. The extension should now appear in your extensions list

## Usage

### Basic Usage
1. **Navigate to Coursera** - Go to any Coursera course
2. **Open Extension** - Click the extension icon in your browser toolbar
3. **Configure Settings** - Adjust automation preferences
4. **Start Automation** - Click "Start Automation" for the current page

### Advanced Features

#### Settings Configuration
- **Video Speed**: Adjust playback speed (1x - 2x)
- **Quiz Delay**: Set delay between quiz actions
- **Feature Toggles**: Enable/disable specific automation features
- **Safety Settings**: Configure retry limits and timeouts

#### Page Types Supported
- ✅ **Quiz Pages** - Multiple choice, true/false, text input
- ✅ **Video Lectures** - Automated playbook and completion
- ✅ **Reading Materials** - Progress tracking and completion
- ✅ **Discussion Forums** - Structured participation
- ✅ **Assignments** - Basic automation support

### Real-World Testing

#### Test with Free Course
1. Go to: https://www.coursera.org/learn/machine-learning
2. Click "Enroll for Free" (no payment required)
3. Navigate to first video lesson
4. Click extension icon → Start Automation
5. Video should auto-play and speed up

#### Test Different Content Types

**Video Lecture Testing:**
1. Find a video lecture in the course
2. Click extension icon
3. Start automation
4. Expected: Video should auto-play and speed up

**Quiz Testing:**
1. Find a quiz or practice exercise
2. Click extension icon
3. Start automation
4. Expected: Quiz questions should be automatically answered

**Reading Material Testing:**
1. Find reading material/articles
2. Click extension icon
3. Start automation
4. Expected: Reading should be marked as completed

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test files
npm test -- dom.test.ts
```

### Test Coverage Requirements
- **Line Coverage**: 100%
- **Branch Coverage**: 90%+
- **Function Coverage**: 90%+
- **Statement Coverage**: 100%

### Manual Testing Checklist

#### Basic Functionality
- [ ] Extension loads without errors
- [ ] Popup opens on any website
- [ ] Correctly detects Coursera vs non-Coursera pages
- [ ] Feature toggles work
- [ ] Can start automation on Coursera
- [ ] Backend server running and accessible

#### Expected Results

**On Any Website (e.g., google.com):**
- Page Type: "Other Website"
- Automatable: "No"
- Start button: DISABLED

**On Coursera.org:**
- Page Type: "Coursera Page"
- Automatable: "Yes"
- Start button: ENABLED

**When Starting Automation:**
- Status: Changes to "Automation Active" (blue pulsing dot)
- Log: Shows "Automation started successfully"
- Buttons: Start disabled, Stop enabled

## Troubleshooting

### Extension Issues

#### Popup Won't Open
1. Go to `chrome://extensions/`
2. Check for any red error text under the extension
3. Click refresh icon (🔄) on extension
4. Try clicking the icon again

#### Extension Shows Errors
1. Check that all files exist in `dist/` folder
2. Reload extension
3. Check browser console for errors

#### Content Script Not Working
1. Go to a Coursera page
2. Open Developer Tools (F12)
3. Check Console for "[Coursera Automation]" messages
4. Look for any error messages

### Backend Issues

#### Backend Not Responding
```bash
# Restart backend
pkill -f uvicorn
cd nerubrain/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Test Backend Endpoints
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/courses
```

### Common Solutions

**Extension not loading:**
```bash
# Rebuild extension
npm run clean && npm run build

# Reload in Chrome
# Go to chrome://extensions/ → click refresh icon
```

**Content security policy errors:**
- Ensure CSP has been removed from manifest.json
- Check popup console for blocked resource errors

**Permission issues:**
- Verify host permissions granted for coursera.org
- Check if extension has required permissions

## Development Workflow

### Project Structure
```
nerubrain/
├── dist/                 # Built extension files
├── src/                  # Source TypeScript files
├── backend/              # Python FastAPI backend
├── tests/                # Test files
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── webpack.config.js     # Build configuration
└── README.md            # This file
```

### Quick Commands
```bash
# Terminal 1: Start backend
cd nerubrain/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2: Build extension
cd nerubrain
npm run build

# Terminal 3: Run tests
cd nerubrain
npm test
```

### File Monitoring
```bash
# Monitor backend logs
tail -f backend/logs/app.log

# Watch webpack rebuild
npm run dev
```

## Security & Privacy

### Privacy Protection
- **Local Processing** - Most operations happen locally
- **Minimal Data Collection** - Only essential data is stored
- **Encrypted Storage** - Sensitive data is encrypted
- **No External Tracking** - No third-party analytics

### Academic Integrity
- **Transparent Operation** - Clear indication of automation
- **Learning Enhancement** - Focus on efficiency, not cheating
- **Respect Course Policies** - Compliance with Coursera ToS
- **Educational Purpose** - Designed to enhance learning

### Technical Security
- **Input Validation** - All inputs are validated and sanitized
- **Secure Communication** - HTTPS for all API calls
- **Regular Updates** - Timely security patches

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Standards
- **TypeScript** - Use strict type checking
- **ESLint** - Follow configured linting rules
- **Prettier** - Code formatting is enforced
- **Jest** - Write comprehensive tests
- **Clean Code** - Follow SOLID principles

### Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/nerufuyo/nerubrain/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nerufuyo/nerubrain/discussions)

---

**⚠️ Disclaimer**: This extension is for educational purposes and to enhance learning efficiency. Please ensure compliance with your institution's academic integrity policies and Coursera's Terms of Service.
