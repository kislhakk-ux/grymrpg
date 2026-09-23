# GymForge — History Routes
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user_id
from database.firestore_db import get_db

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("")
def get_workout_history(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if hasattr(db, "list_documents"):
        records = db.list_documents("workout_records", lambda r: r.get("userId") == user_id)
    else:
        docs = db.collection("workout_records").where("userId", "==", user_id).stream()
        records = [d.to_dict() for d in docs]

    return {"records": records}
