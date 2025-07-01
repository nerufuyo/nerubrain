from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
import asyncio
import aiohttp
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuralBrain AI Backend", version="1.0.0")

# CORS middleware to allow Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class QuestionRequest(BaseModel):
    question: str
    context: Dict[str, Any]
    url: str
    ai_provider: Optional[str] = "claude"

class AnswerResponse(BaseModel):
    answer: str
    confidence: float
    processing_time: float
    ai_provider: str

class AIProvider:
    def __init__(self):
        self.claude_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
    async def answer_with_claude(self, question: str, context: Dict[str, Any]) -> str:
        """Answer question using Claude (Sonnet)"""
        if not self.claude_api_key:
            raise HTTPException(status_code=500, detail="Claude API key not configured")
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_api_key,
            "anthropic-version": "2023-06-01"
        }
        
        # Build context-aware prompt
        context_info = f"""
        Website: {context.get('url', 'Unknown')}
        Page Title: {context.get('title', 'Unknown')}
        Parent Context: {context.get('parentText', '')[:200]}
        """
        
        prompt = f"""You are an intelligent web assistant helping users answer questions they encounter while browsing.

Context Information:
{context_info}

User Question: {question}

Please provide a clear, concise, and helpful answer. If the question is ambiguous or you need more context, provide the best possible answer based on the available information. Keep responses under 150 words and be direct.

Answer:"""

        payload = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 300,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["content"][0]["text"]
                    else:
                        error_text = await response.text()
                        logger.error(f"Claude API error: {response.status} - {error_text}")
                        raise HTTPException(status_code=500, detail="Claude API error")
        except Exception as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get response from Claude")
    
    async def answer_with_gpt(self, question: str, context: Dict[str, Any]) -> str:
        """Answer question using OpenAI GPT"""
        if not self.openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }
        
        # Build context-aware prompt
        context_info = f"""
        Website: {context.get('url', 'Unknown')}
        Page Title: {context.get('title', 'Unknown')}
        Parent Context: {context.get('parentText', '')[:200]}
        """
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an intelligent web assistant helping users answer questions they encounter while browsing. Provide clear, concise answers under 150 words."
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context_info}\n\nQuestion: {question}\n\nAnswer:"
                }
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["choices"][0]["message"]["content"]
                    else:
                        error_text = await response.text()
                        logger.error(f"OpenAI API error: {response.status} - {error_text}")
                        raise HTTPException(status_code=500, detail="OpenAI API error")
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get response from OpenAI")

# Initialize AI provider
ai_provider = AIProvider()

@app.get("/health")
async def health_check():
    """Health check endpoint for Chrome extension"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/answer", response_model=AnswerResponse)
async def answer_question(request: QuestionRequest):
    """Main endpoint to answer questions from Chrome extension"""
    start_time = datetime.now()
    
    try:
        logger.info(f"Received question: {request.question[:100]}...")
        
        # Demo mode: if APIs are not working, provide demo responses
        demo_responses = {
            "what is artificial intelligence": "Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior. It involves developing algorithms that can perform tasks typically requiring human intelligence, such as learning, reasoning, problem-solving, and understanding language.",
            "how does machine learning work": "Machine learning is a subset of AI where computers learn from data without being explicitly programmed. It uses algorithms to identify patterns in data, make predictions, and improve performance over time through experience.",
            "what are neural networks": "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information and learn patterns through training on data.",
            "default": "I'm an AI assistant that helps answer questions you encounter while browsing the web. I can provide information on a wide variety of topics including technology, science, and general knowledge."
        }
        
        # Check for demo response
        question_lower = request.question.lower()
        demo_answer = None
        for key, response in demo_responses.items():
            if key in question_lower:
                demo_answer = response
                break
        
        if not demo_answer:
            demo_answer = demo_responses["default"]
        
        # Try AI providers, fall back to demo if they fail
        try:
            if request.ai_provider == "gpt":
                answer = await ai_provider.answer_with_gpt(request.question, request.context)
            else:  # default to claude
                answer = await ai_provider.answer_with_claude(request.question, request.context)
        except Exception as e:
            logger.warning(f"AI provider failed, using demo response: {str(e)}")
            answer = f"[Demo Mode] {demo_answer}"
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Generated answer in {processing_time:.2f}s")
        
        return AnswerResponse(
            answer=answer,
            confidence=0.85,  # Placeholder confidence score
            processing_time=processing_time,
            ai_provider=request.ai_provider or "claude"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/stats")
async def get_stats():
    """Get server statistics"""
    return {
        "server": "NeuralBrain AI Backend",
        "version": "1.0.0",
        "uptime": "Running",
        "ai_providers": {
            "claude": bool(ai_provider.claude_api_key),
            "openai": bool(ai_provider.openai_api_key)
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🧠 Starting NeuralBrain AI Backend Server...")
    print("📡 Server will be available at: http://127.0.0.1:8000")
    print("🔍 Health check: http://127.0.0.1:8000/health")
    print("📊 Stats: http://127.0.0.1:8000/stats")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
