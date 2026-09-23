# GymForge — AI Assistant Orchestration Service
from pathlib import Path
from config import GEMINI_API_KEY
from services.rag_service import retrieve_user_context, retrieve_knowledge_snippets
from mcp.executor import execute_mcp_tool

# Load system prompts from Markdown files
PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "prompts"

def load_prompt(filename: str) -> str:
    path = PROMPTS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""

SYSTEM_PROMPT = load_prompt("system.md") or "Você é o Mestre da Forja do GymForge, um assistente RPG fitness."

def generate_ai_response(user_input: str, user_id: str = "warrior_demo_1", client_context: dict = None) -> dict:
    """Generates an intelligent contextual response using Google Gemini API or intelligent heuristic fallback."""
    
    # Retrieve structured user context (RAG)
    user_context = retrieve_user_context(user_id)
    if client_context:
        user_context.update(client_context)

    knowledge_snippet = retrieve_knowledge_snippets(user_input)

    # If Gemini API Key is configured, attempt real Gemini call
    if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("sua_chave"):
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")

            full_prompt = f"""
{SYSTEM_PROMPT}

## CONTEXTO DO USUÁRIO (RAG ESTRUTURADO DO FIRESTORE):
- Usuário: {user_context.get('user', {})}
- Personagem: {user_context.get('character', {})}
- Histórico Recente: {user_context.get('recent_workouts', [])}

## BASE DE CONHECIMENTO CIENTÍFICA:
{knowledge_snippet}

## PERGUNTA DO GUERREIRO:
"{user_input}"
"""
            response = model.generate_content(full_prompt)
            return {"response": response.text, "model": "gemini-1.5-flash"}
        except Exception as e:
            print(f"[AI Service] Erro ao chamar API Gemini: {e}. Utilizando gerador local contextual.")

    # Intelligent Local RPG Fitness AI Response
    u = user_context.get("user", {})
    c = user_context.get("character", {})
    attrs = c.get("atributos", {})
    lower = user_input.lower()

    if any(k in lower for k in ["peito", "costas", "perna", "ombro", "braço", "treino"]):
        return {
            "response": f"""⚔️ **Plano de Batalha — Mestre da Forja**

Com base no seu nível (**Nível {u.get('nivel', 1)}**) e sua Força atual (**{attrs.get('FORCA', 10)}**), aqui está a estratégia recomendada:

### 🛡️ Estrutura da Sessão:
1. **Ativação Articular**: 5 minutos de mobilidade dinâmica.
2. **Exercício Primário**: 4 séries de 8 a 10 reps (foco em sobrecarga progressiva).
3. **Exercício Secundário**: 3 séries de 10 a 12 reps (controle de cadência 3-1-1).
4. **Finalizador de Exaustão**: 3 séries de 15 reps (pico de contração).

⏱️ **Descanso**: 60 a 90 segundos entre séries. Lembre-se de registrar suas cargas para acumular mais XP!""",
            "model": "gymforge-forge-core-v1"
        }

    if any(k in lower for k in ["atributo", "força", "vitalidade", "disciplina", "pontos"]):
        return {
            "response": f"""🧙‍♂️ **Conselho dos Atributos:**

Você possui **{u.get('pontosAtributoDisponiveis', 0)} Pontos de Atributo** para distribuir!

- **⚔️ Força ({attrs.get('FORCA', 10)})**: Maximize sua capacidade de peso.
- **🛡️ Resistência ({attrs.get('RESISTENCIA', 8)})**: Suporte a séries mais longas.
- **⚡ Agilidade ({attrs.get('AGILIDADE', 6)})**: Reduz tempo de fadiga neuromuscular.
- **❤️ Vitalidade ({attrs.get('VITALIDADE', 10)})**: Acelera recuperação e expande sua aura.
- **🔥 Disciplina ({attrs.get('DISCIPLINA', 8)})**: Fortalece seu streak e foco mental.

Acesse a aba **Personagem** para consagrar sua evolução!""",
            "model": "gymforge-forge-core-v1"
        }

    return {
        "response": f"""⚡ **Mestre da Forja:**

"O ferro não mente: cada quilo levantado com dedicação aproxima o guerreiro de sua forma lendária."

Posso auxiliá-lo com:
- 🏋️ **Prescrição de Treinos**
- 🧙‍♂️ **Distribuição de Atributos**
- 📊 **Análise de Sobrecarga e Volume**
- 📜 **Estratégias de Missões Diárias**

O que deseja aprimorar em sua jornada, {u.get('nome', 'Guerreiro')}?""",
        "model": "gymforge-forge-core-v1"
    }
