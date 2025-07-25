from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Coursera Automation Backend",
    description="Backend API for Coursera automation extension",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CourseProgress(BaseModel):
    course_id: str
    title: str
    progress: float
    last_accessed: Optional[datetime] = None
    completed_modules: List[str] = []
    quiz_scores: List[Dict[str, Any]] = []

class AutomationRequest(BaseModel):
    page_url: str
    page_type: str
    automation_settings: Dict[str, Any]

class AutomationResult(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None

class AnalyticsData(BaseModel):
    user_id: str
    course_id: str
    action_type: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

# In-memory storage (would be replaced with a database in production)
courses_data: Dict[str, CourseProgress] = {}
analytics_data: List[AnalyticsData] = []

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Coursera Automation Backend API", "status": "healthy"}

@app.post("/api/automation/process", response_model=AutomationResult)
async def process_automation(request: AutomationRequest):
    """
    Process automation request for a specific page
    """
    try:
        logger.info(f"Processing automation for {request.page_type} at {request.page_url}")
        
        # Simulate processing based on page type
        if request.page_type == "quiz":
            result = await process_quiz_automation(request)
        elif request.page_type == "video":
            result = await process_video_automation(request)
        elif request.page_type == "reading":
            result = await process_reading_automation(request)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported page type: {request.page_type}")
        
        return result
    except Exception as e:
        logger.error(f"Automation processing failed: {str(e)}")
        return AutomationResult(
            success=False,
            message=f"Processing failed: {str(e)}",
            errors=[str(e)]
        )

async def process_quiz_automation(request: AutomationRequest) -> AutomationResult:
    """Process quiz automation"""
    await asyncio.sleep(0.1)  # Simulate processing time
    
    return AutomationResult(
        success=True,
        message="Quiz automation completed",
        data={
            "questions_processed": 5,
            "score": 85,
            "time_taken": "2m 30s"
        }
    )

async def process_video_automation(request: AutomationRequest) -> AutomationResult:
    """Process video automation"""
    await asyncio.sleep(0.1)  # Simulate processing time
    
    return AutomationResult(
        success=True,
        message="Video automation completed",
        data={
            "duration": "15m 20s",
            "speed": 1.5,
            "completion": 100
        }
    )

async def process_reading_automation(request: AutomationRequest) -> AutomationResult:
    """Process reading automation"""
    await asyncio.sleep(0.1)  # Simulate processing time
    
    return AutomationResult(
        success=True,
        message="Reading automation completed",
        data={
            "words_read": 1200,
            "estimated_time": "4m 30s",
            "actual_time": "1m 45s"
        }
    )

@app.get("/api/courses/{course_id}/progress", response_model=CourseProgress)
async def get_course_progress(course_id: str):
    """Get progress for a specific course"""
    if course_id not in courses_data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return courses_data[course_id]

@app.post("/api/courses/{course_id}/progress")
async def update_course_progress(course_id: str, progress: CourseProgress):
    """Update progress for a specific course"""
    progress.course_id = course_id
    progress.last_accessed = datetime.now()
    courses_data[course_id] = progress
    
    return {"message": "Progress updated successfully"}

@app.get("/api/analytics/user/{user_id}")
async def get_user_analytics(user_id: str):
    """Get analytics data for a specific user"""
    user_analytics = [a for a in analytics_data if a.user_id == user_id]
    
    return {
        "user_id": user_id,
        "total_actions": len(user_analytics),
        "recent_activity": user_analytics[-10:] if user_analytics else [],
        "stats": calculate_user_stats(user_analytics)
    }

@app.post("/api/analytics/track")
async def track_analytics(data: AnalyticsData):
    """Track analytics data"""
    data.timestamp = datetime.now()
    analytics_data.append(data)
    
    return {"message": "Analytics tracked successfully"}

def calculate_user_stats(user_analytics: List[AnalyticsData]) -> Dict[str, Any]:
    """Calculate user statistics"""
    if not user_analytics:
        return {}
    
    action_counts = {}
    for action in user_analytics:
        action_counts[action.action_type] = action_counts.get(action.action_type, 0) + 1
    
    return {
        "action_counts": action_counts,
        "first_activity": min(a.timestamp for a in user_analytics),
        "last_activity": max(a.timestamp for a in user_analytics),
        "active_days": len(set(a.timestamp.date() for a in user_analytics))
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "courses_tracked": len(courses_data),
        "analytics_events": len(analytics_data)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
