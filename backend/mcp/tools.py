# GymForge — Model Context Protocol (MCP) Tool Declarations

MCP_TOOL_DEFINITIONS = [
    {
        "name": "get_user_profile",
        "description": "Retorna os dados cadastrais, nível atual, XP acumulado e sequência de treinos (streak) do usuário autenticado.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário autenticado"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_character",
        "description": "Retorna o personagem do usuário, incluindo classe, arquétipo e cosméticos equipados.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_attributes",
        "description": "Retorna os valores dos atributos do personagem (Força, Resistência, Agilidade, Vitalidade, Disciplina) e pontos disponíveis para distribuição.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_workout_history",
        "description": "Consulta o histórico dos últimos treinos concluídos pelo usuário, com volume levantado e exercícios.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário"},
                "limit": {"type": "integer", "description": "Número máximo de registros a retornar", "default": 5}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_available_workouts",
        "description": "Retorna o catálogo de fichas de treino disponíveis na academia RPG por categoria (Peito, Costas, Pernas, etc.).",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Categoria opcional para filtragem"}
            }
        }
    },
    {
        "name": "get_user_missions",
        "description": "Retorna as missões ativas do usuário e o progresso em cada uma delas.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "calculate_progress",
        "description": "Calcula métricas agregadas de consistência, volume total levantado e projeção de XP para o próximo nível.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "ID único do usuário"}
            },
            "required": ["user_id"]
        }
    }
]
