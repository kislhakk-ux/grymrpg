# GymForge — Workout Presets Catalog for Backend

PRESET_WORKOUTS = [
  {
    "id": "chest_titan",
    "nome": "Treino de Peito Lendário",
    "categoria": "Peito",
    "icone": "⚔️",
    "dificuldade": "Intermediário",
    "duracaoEstimada": "45 min",
    "xpRecompensa": 85,
    "exercicios": [
      {
        "id": "supino_reto",
        "nome": "Supino Reto com Barra",
        "grupoMuscular": "Peito",
        "seriesPadrao": 4,
        "repsPadrao": 10,
        "descansoSegundos": 90,
        "instrucoes": "Mantenha as escápulas retraídas e controle a descida da barra até o meio do peitoral."
      },
      {
        "id": "supino_inclinado_halteres",
        "nome": "Supino Inclinado com Halteres",
        "grupoMuscular": "Peito",
        "seriesPadrao": 3,
        "repsPadrao": 10,
        "descansoSegundos": 75,
        "instrucoes": "Banco inclinado a 30-45 graus. Alongue o peitoral na descida sem bater os halteres no topo."
      },
      {
        "id": "crucifixo_maquina",
        "nome": "Crucifixo no Peck Deck / Máquina",
        "grupoMuscular": "Peito",
        "seriesPadrao": 3,
        "repsPadrao": 12,
        "descansoSegundos": 60,
        "instrucoes": "Foco no pico de contração máxima ao fechar os braços."
      },
      {
        "id": "paralelas_peito",
        "nome": "Barras Paralelas (Foco Peito)",
        "grupoMuscular": "Peito",
        "seriesPadrao": 3,
        "repsPadrao": 10,
        "descansoSegundos": 60,
        "instrucoes": "Tronco ligeiramente inclinado para frente para enfatizar a porção inferior do peitoral."
      }
    ]
  },
  {
    "id": "back_iron",
    "nome": "Costas de Aço & Dorsal Titânica",
    "categoria": "Costas",
    "icone": "🛡️",
    "dificuldade": "Avançado",
    "duracaoEstimada": "50 min",
    "xpRecompensa": 95,
    "exercicios": [
      {
        "id": "puxada_alta",
        "nome": "Puxada Alta no Pulley (Pegada Aberta)",
        "grupoMuscular": "Costas",
        "seriesPadrao": 4,
        "repsPadrao": 10,
        "descansoSegundos": 75,
        "instrucoes": "Puxe direcionando os cotovelos para baixo, contraindo a grande dorsal."
      },
      {
        "id": "remada_curvada",
        "nome": "Remada Curvada com Barra",
        "grupoMuscular": "Costas",
        "seriesPadrao": 4,
        "repsPadrao": 8,
        "descansoSegundos": 90,
        "instrucoes": "Coluna reta, joelhos levemente flexionados, puxe a barra rente às coxas até o abdômen."
      }
    ]
  },
  {
    "id": "legs_colossus",
    "nome": "Pernas de Colosso",
    "categoria": "Pernas",
    "icone": "🦵",
    "dificuldade": "Avançado",
    "duracaoEstimada": "55 min",
    "xpRecompensa": 110,
    "exercicios": [
      {
        "id": "agachamento_livre",
        "nome": "Agachamento Livre com Barra",
        "grupoMuscular": "Pernas",
        "seriesPadrao": 4,
        "repsPadrao": 8,
        "descansoSegundos": 120,
        "instrucoes": "Pés na largura dos ombros, descida controlada abaixo de 90 graus com coluna firme."
      },
      {
        "id": "leg_press_45",
        "nome": "Leg Press 45°",
        "grupoMuscular": "Pernas",
        "seriesPadrao": 4,
        "repsPadrao": 10,
        "descansoSegundos": 90,
        "instrucoes": "Não trave os joelhos no topo do movimento. Amplitude completa."
      }
    ]
  }
]
