# GymForge — Structured & Classical RAG Service
from database.firestore_db import get_db

FITNESS_KNOWLEDGE_BASE = [
    {
        "topic": "Sobrecarga Progressiva",
        "content": "A sobrecarga progressiva é o princípio de aumentar gradualmente a tensão mecânica sobre os músculos ao longo do tempo (aumentando peso, repetições, número de séries ou diminuindo o tempo de descanso)."
    },
    {
        "topic": "Descanso e Hipertrofia",
        "content": "O tempo de descanso ideal entre séries para exercícios compostos (Supino, Agachamento, Levantamento Terra) é de 2 a 3 minutos; para exercícios isoladores (Elevação Lateral, Rosca Direta), 60 a 90 segundos são suficientes."
    },
    {
        "topic": "Atributos RPG e Fisiologia",
        "content": "Força reflete tensão mecânica e recrutamento de unidades motoras de alto limiar; Resistência reflete capacidade de tamponamento e biogênese mitocondrial; Vitalidade reflete síntese proteica e qualidade do sono; Disciplina reflete a aderência à periodização."
    }
]

def retrieve_user_context(user_id: str) -> dict:
    """Structured RAG: Fetches real-time structured data from Firestore/Database."""
    db = get_db()
    
    if hasattr(db, "get_document"):
        user = db.get_document("users", user_id) or {"userId": user_id, "nivel": 1, "xp": 0}
        char = db.get_document("characters", user_id) or {"classe": "guerreiro", "atributos": {"FORCA": 10}}
        history = db.list_documents("workout_records", lambda r: r.get("userId") == user_id)
    else:
        u_snap = db.collection("users").document(user_id).get()
        c_snap = db.collection("characters").document(user_id).get()
        user = u_snap.to_dict() if u_snap.exists else {"userId": user_id, "nivel": 1, "xp": 0}
        char = c_snap.to_dict() if c_snap.exists else {"classe": "guerreiro", "atributos": {"FORCA": 10}}
        records = db.collection("workout_records").where("userId", "==", user_id).limit(5).stream()
        history = [r.to_dict() for r in records]

    return {
        "user": user,
        "character": char,
        "recent_workouts": history[:5]
    }

def retrieve_knowledge_snippets(query: str) -> str:
    """Classical RAG: Retrieves relevant contextual knowledge from the fitness knowledge base."""
    query_lower = query.lower()
    matches = []
    for item in FITNESS_KNOWLEDGE_BASE:
        if any(word in item["topic"].lower() or word in item["content"].lower() for word in query_lower.split()):
            matches.append(f"[{item['topic']}]: {item['content']}")
    
    if not matches:
        return FITNESS_KNOWLEDGE_BASE[0]["content"]
    return "\n".join(matches)
