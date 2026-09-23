# GymForge — AI Assistant Routes
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.ai_service import generate_ai_response
from middleware.auth_middleware import get_current_user_id

class AIChatRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat")
def ai_chat_endpoint(req: AIChatRequest, user_id: str = Depends(get_current_user_id)):
    return generate_ai_response(req.prompt, user_id=user_id, client_context=req.context)
