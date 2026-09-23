# GymForge — Mission & Achievement Routes
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user_id
from database.firestore_db import get_db
from pydantic import BaseModel

class ClaimMissionRequest(BaseModel):
    missionId: str

router = APIRouter(prefix="/api/missions", tags=["missions"])

@router.get("")
def list_missions(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if hasattr(db, "list_documents"):
        missions = db.list_documents("missions")
    else:
        docs = db.collection("missions").stream()
        missions = [d.to_dict() for d in docs]
    return {"missions": missions}

@router.post("/claim")
def claim_mission(req: ClaimMissionRequest, user_id: str = Depends(get_current_user_id)):
    return {
        "success": True,
        "message": "Recompensa de missão resgatada com sucesso!",
        "mission_id": req.missionId
    }
