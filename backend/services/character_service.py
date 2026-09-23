# GymForge — Character & Attribute Service
from fastapi import HTTPException
from database.firestore_db import get_db

VALID_ATTRIBUTES = {"FORCA", "RESISTENCIA", "AGILIDADE", "VITALIDADE", "DISCIPLINA"}

def validate_and_allocate_attributes(user_id: str, new_attributes: dict):
    db = get_db()
    
    # Check existing character & user profile
    # If in mock mode:
    if hasattr(db, "get_document"):
        user = db.get_document("users", user_id)
        character = db.get_document("characters", user_id)
    else:
        user_snap = db.collection("users").document(user_id).get()
        char_snap = db.collection("characters").document(user_id).get()
        user = user_snap.to_dict() if user_snap.exists else None
        character = char_snap.to_dict() if char_snap.exists else None

    if not user or not character:
        raise HTTPException(status_code=404, detail="Perfil de usuário ou personagem não encontrado.")

    current_attrs = character.get("atributos", {})
    available_points = user.get("pontosAtributoDisponiveis", 0)

    # Calculate points difference
    points_requested = 0
    for attr, new_val in new_attributes.items():
        if attr not in VALID_ATTRIBUTES:
            raise HTTPException(status_code=400, detail=f"Atributo inválido: {attr}")
        old_val = current_attrs.get(attr, 10)
        diff = new_val - old_val
        if diff < 0:
            raise HTTPException(status_code=400, detail="Não é permitido reduzir atributos abaixo do nível atual.")
        points_requested += diff

    if points_requested > available_points:
        raise HTTPException(
            status_code=400, 
            detail=f"Pontos insuficientes. Requeridos: {points_requested}, Disponíveis: {available_points}."
        )

    # Apply changes
    remaining_points = available_points - points_requested
    character["atributos"] = new_attributes
    user["pontosAtributoDisponiveis"] = remaining_points

    if hasattr(db, "set_document"):
        db.set_document("characters", user_id, character)
        db.set_document("users", user_id, user)
    else:
        db.collection("characters").document(user_id).set(character, merge=True)
        db.collection("users").document(user_id).set({"pontosAtributoDisponiveis": remaining_points}, merge=True)

    return {
        "success": True,
        "character": character,
        "remaining_points": remaining_points
    }
