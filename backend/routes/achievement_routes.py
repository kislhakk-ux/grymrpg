# GymForge — Achievement Routes
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user_id
from database.firestore_db import get_db

router = APIRouter(prefix="/api/achievements", tags=["achievements"])

@router.get("")
def list_achievements(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if hasattr(db, "list_documents"):
        achievements = db.list_documents("achievements")
    else:
        docs = db.collection("achievements").stream()
        achievements = [d.to_dict() for d in docs]
    return {"achievements": achievements}
