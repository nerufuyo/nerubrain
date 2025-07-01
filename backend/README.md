# Backend Server

This directory contains the Python FastAPI backend server for nerubrain.

## Files

- `main.py` - Main FastAPI application with AI integration
- `requirements.txt` - Python dependencies
- `start.sh` - Convenient startup script
- `.env.example` - Environment variables template
- `.env` - Your actual environment variables (not in git)

## Setup

1. Create virtual environment:
   ```bash
   python3 -m venv neuralbrain_env
   source neuralbrain_env/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Start server:
   ```bash
   ./start.sh
   # or
   python main.py
   ```

## API Endpoints

- `GET /health` - Health check
- `GET /stats` - Server statistics
- `POST /answer` - Answer questions with AI

## Environment Variables

- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key
- `SERVER_HOST` - Server host (default: 127.0.0.1)
- `SERVER_PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: True)

## AI Providers

The server supports both Claude (Sonnet) and OpenAI GPT. If API keys are not available or quota is exceeded, it falls back to demo mode with pre-written responses.
