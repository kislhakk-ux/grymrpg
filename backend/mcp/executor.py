# GymForge — MCP Tool Execution Engine
from database.firestore_db import get_db
from services.xp_service import calculate_level_from_xp

def execute_mcp_tool(tool_name: str, arguments: dict, authenticated_user_id: str) -> dict:
    """Executes an MCP tool with strict authorization validation."""
    db = get_db()
    
    # Enforce that user cannot query other users' private data
    target_user_id = arguments.get("user_id", authenticated_user_id)
    if target_user_id != authenticated_user_id:
        return {"error": "Acesso negado. A IA não pode acessar dados de outros guerreiros."}

    if tool_name == "get_user_profile":
        if hasattr(db, "get_document"):
            user = db.get_document("users", authenticated_user_id) or {"userId": authenticated_user_id, "nivel": 1, "xp": 0, "streakAtual": 1}
        else:
            snap = db.collection("users").document(authenticated_user_id).get()
            user = snap.to_dict() if snap.exists else {"userId": authenticated_user_id, "nivel": 1, "xp": 0, "streakAtual": 1}
        return {"user_profile": user}

    elif tool_name == "get_character":
        if hasattr(db, "get_document"):
            char = db.get_document("characters", authenticated_user_id) or {"nomePersonagem": "Guerreiro", "classe": "guerreiro"}
        else:
            snap = db.collection("characters").document(authenticated_user_id).get()
            char = snap.to_dict() if snap.exists else {"nomePersonagem": "Guerreiro", "classe": "guerreiro"}
        return {"character": char}

    elif tool_name == "get_attributes":
        if hasattr(db, "get_document"):
            char = db.get_document("characters", authenticated_user_id) or {}
            user = db.get_document("users", authenticated_user_id) or {}
        else:
            c_snap = db.collection("characters").document(authenticated_user_id).get()
            u_snap = db.collection("users").document(authenticated_user_id).get()
            char = c_snap.to_dict() if c_snap.exists else {}
            user = u_snap.to_dict() if u_snap.exists else {}
        
        return {
            "attributes": char.get("atributos", {"FORCA": 10, "RESISTENCIA": 8, "AGILIDADE": 6, "VITALIDADE": 10, "DISCIPLINA": 8}),
            "available_points": user.get("pontosAtributoDisponiveis", 0)
        }

    elif tool_name == "get_workout_history":
        limit = arguments.get("limit", 5)
        if hasattr(db, "list_documents"):
            records = db.list_documents("workout_records", lambda r: r.get("userId") == authenticated_user_id)
        else:
            docs = db.collection("workout_records").where("userId", "==", authenticated_user_id).limit(limit).stream()
            records = [d.to_dict() for d in docs]
        return {"workout_history": records[:limit]}

    elif tool_name == "get_available_workouts":
        from services.workout_presets import PRESET_WORKOUTS
        category = arguments.get("category")
        if category:
            filtered = [w for w in PRESET_WORKOUTS if w["categoria"].lower() == category.lower()]
            return {"workouts": filtered}
        return {"workouts": PRESET_WORKOUTS}

    elif tool_name == "calculate_progress":
        if hasattr(db, "list_documents"):
            records = db.list_documents("workout_records", lambda r: r.get("userId") == authenticated_user_id)
            user = db.get_document("users", authenticated_user_id) or {"xp": 0}
        else:
            docs = db.collection("workout_records").where("userId", "==", authenticated_user_id).stream()
            records = [d.to_dict() for d in docs]
            u_snap = db.collection("users").document(authenticated_user_id).get()
            user = u_snap.to_dict() if u_snap.exists else {"xp": 0}

        total_volume = sum(r.get("volumeTotalKg", 0) for r in records)
        total_sessions = len(records)
        level_info = calculate_level_from_xp(user.get("xp", 0))

        return {
            "total_workouts_completed": total_sessions,
            "total_volume_kg": total_volume,
            "level_info": level_info
        }

    return {"error": f"Ferramenta MCP desconhecida: {tool_name}"}
