# GymForge — Workout & Exercise Management Service
from datetime import datetime
from database.firestore_db import get_db
from services.xp_service import calculate_workout_rewards, calculate_level_from_xp

def process_finish_workout(user_id: str, request_data: dict):
    db = get_db()

    # Get user profile
    if hasattr(db, "get_document"):
        user = db.get_document("users", user_id) or {
            "userId": user_id,
            "nome": "Guerreiro da Forja",
            "xp": 0,
            "nivel": 1,
            "pontosAtributoDisponiveis": 3,
            "streakAtual": 1
        }
    else:
        user_snap = db.collection("users").document(user_id).get()
        user = user_snap.to_dict() if user_snap.exists else {
            "userId": user_id,
            "nome": "Guerreiro da Forja",
            "xp": 0,
            "nivel": 1,
            "pontosAtributoDisponiveis": 3,
            "streakAtual": 1
        }

    streak = user.get("streakAtual", 1)
    rewards = calculate_workout_rewards(request_data.get("exercicios", []), streak)

    # Calculate Level Progression
    old_xp = user.get("xp", 0)
    new_xp = old_xp + rewards["total_xp"]
    old_level_info = calculate_level_from_xp(old_xp)
    new_level_info = calculate_level_from_xp(new_xp)

    levels_gained = max(0, new_level_info["level"] - old_level_info["level"])
    new_points = user.get("pontosAtributoDisponiveis", 0) + (levels_gained * 3)

    user["xp"] = new_xp
    user["nivel"] = new_level_info["level"]
    user["pontosAtributoDisponiveis"] = new_points
    user["ultimoTreinoData"] = datetime.utcnow().strftime("%Y-%m-%d")

    # Record entity
    record_id = f"rec_{int(datetime.utcnow().timestamp())}"
    record = {
        "id": record_id,
        "userId": user_id,
        "workoutId": request_data.get("templateId", "custom"),
        "nomeTreino": request_data.get("nomeTreino", "Treino Livre"),
        "categoria": request_data.get("categoria", "Geral"),
        "data": datetime.utcnow().isoformat(),
        "duracaoMinutos": request_data.get("duracaoMinutos", 45),
        "volumeTotalKg": rewards["total_volume_kg"],
        "totalSeries": rewards["total_sets_completed"],
        "xpGanho": rewards["total_xp"],
        "detalhesExercicios": request_data.get("exercicios", [])
    }

    # Persist in DB
    if hasattr(db, "set_document"):
        db.set_document("users", user_id, user)
        db.set_document("workout_records", record_id, record)
    else:
        db.collection("users").document(user_id).set(user, merge=True)
        db.collection("workout_records").document(record_id).set(record)

    return {
        "success": True,
        "record": record,
        "rewards": rewards,
        "leveled_up": levels_gained > 0,
        "new_level": new_level_info["level"],
        "attribute_points_awarded": levels_gained * 3,
        "user_profile": user
    }
