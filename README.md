# 🧠 NeuralBrain - AI Web Assistant

Chrome extension that detects web components in real-time and answers questions using AI.

## Features

- **Real-time Component Detection** - Buttons, forms, modals, navigation, etc.
- **AI-Powered Question Answering** - Claude (Sonnet) or OpenAI GPT
- **Local Python Backend** - Privacy-first, runs locally
- **Smart Question Detection** - Pattern matching and context analysis
- **Beautiful UI** - Modern popup with real-time statistics

## Tech Stack

- **Frontend**: Chrome Extension (JavaScript, HTML, CSS)
- **Backend**: Python FastAPI server
- **AI**: Anthropic Claude (Sonnet) / OpenAI GPT
- **Real-time**: DOM Mutation Observers

## Quick Start

1. **Setup**: `./setup.sh`
2. **Configure**: Edit `backend/.env` with your API keys
3. **Start Backend**: `cd backend && python main.py`
4. **Install Extension**: Load `chrome-extension/` in Chrome
5. **Test**: Open `demos/test-page.html`

## API Keys

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

Server runs at `http://127.0.0.1:8000`

## How It Works

- **Component Detection**: DOM mutation observers classify elements in real-time
- **Question Detection**: Pattern matching identifies questions on web pages  
- **AI Processing**: Local backend sends questions to Claude/GPT APIs
- **Answer Display**: Floating bubbles show AI responses near questions

## API Endpoints

- `GET /health` - Health check
- `GET /stats` - Server statistics  
- `POST /answer` - Answer questions with AI

## File Structure

```
nerubrain/
├── chrome-extension/     # Extension files
├── backend/             # Python FastAPI server  
├── demos/               # Test page and demos
├── .gitignore          # Git ignore rules
├── setup.sh            # Setup script
└── README.md           # Documentation
```

## Privacy & Security

- **Local Processing** - All AI requests through your local backend
- **API Key Protection** - Keys stored locally, never transmitted
- **No Data Collection** - Extension doesn't send data to external servers
- **Open Source** - Full source code available for inspection

## Troubleshooting

**Extension Issues:**
- Check backend server: `http://127.0.0.1:8000/health`
- Verify API keys in `backend/.env`
- Reload extension in `chrome://extensions/`

**Server Issues:**
- Activate Python environment: `source neuralbrain_env/bin/activate`
- Check port 8000 availability
- Review server logs for errors

## License

MIT License - feel free to use and modify!

---

**Made with 🧠 for smarter web browsing**