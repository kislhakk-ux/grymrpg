# GymForge — Character Routes
from fastapi import APIRouter, Depends
from models.character import AllocateAttributesRequest
from services.character_service import validate_and_allocate_attributes
from middleware.auth_middleware import get_current_user_id
from database.firestore_db import get_db

router = APIRouter(prefix="/api/character", tags=["character"])

@router.get("")
def get_character_endpoint(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if hasattr(db, "get_document"):
        char = db.get_document("characters", user_id)
    else:
        snap = db.collection("characters").document(user_id).get()
        char = snap.to_dict() if snap.exists else None

    if not char:
        return {
            "userId": user_id,
            "nomePersonagem": "Guerreiro da Forja",
            "classe": "guerreiro",
            "atributos": {"FORCA": 10, "RESISTENCIA": 8, "AGILIDADE": 6, "VITALIDADE": 10, "DISCIPLINA": 8}
        }
    return char

@router.post("/allocate")
def allocate_attributes_endpoint(req: AllocateAttributesRequest, user_id: str = Depends(get_current_user_id)):
    return validate_and_allocate_attributes(user_id, req.atributos)
