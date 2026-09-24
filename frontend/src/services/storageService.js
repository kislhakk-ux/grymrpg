// GymForge — Local Storage & State Management

const STORAGE_KEYS = {
  USER_PROFILE: 'gymforge_user_profile',
  CHARACTER: 'gymforge_character',
  WORKOUT_HISTORY: 'gymforge_workout_history',
  CUSTOM_WORKOUTS: 'gymforge_custom_workouts',
  ACTIVE_WORKOUT: 'gymforge_active_workout',
  MISSIONS: 'gymforge_missions',
  ACHIEVEMENTS: 'gymforge_achievements',
  OFFLINE_QUEUE: 'gymforge_offline_queue'
};

// Default initial state for a new warrior
export const DEFAULT_USER_PROFILE = {
  userId: 'warrior_demo_1',
  nome: 'Guerreiro da Forja',
  email: 'heroi@gymforge.app',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  dataCriacao: new Date().toISOString(),
  ultimoLogin: new Date().toISOString(),
  nivel: 1,
  xp: 0,
  pontosAtributoDisponiveis: 3,
  streakAtual: 1,
  maiorStreak: 1,
  ultimoTreinoData: null
};

export const DEFAULT_CHARACTER = {
  nomePersonagem: 'Ares Forjado',
  classe: 'guerreiro',
  atributos: {
    FORCA: 10,
    RESISTENCIA: 8,
    AGILIDADE: 6,
    VITALIDADE: 10,
    DISCIPLINA: 8
  },
  customizacaoVisual: {
    genero: 'masculino',
    pele: '#f5d0b0',
    cabelo: 'estilo1',
    corCabelo: '#1e293b',
    camiseta: 'armadura_bronze',
    calca: 'calca_combate',
    tenis: 'botas_forja',
    acessorio: 'manoplas_ferro',
    aura: 'aura_dourada'
  }
};

// Pre-populated workout catalog with realistic exercises and muscle groups
export const PRESET_WORKOUTS = [
  {
    id: 'chest_titan',
    nome: 'Treino de Peito Lendário',
    categoria: 'Peito',
    icone: '⚔️',
    dificuldade: 'Intermediário',
    duracaoEstimada: '45 min',
    xpRecompensa: 85,
    exercicios: [
      {
        id: 'supino_reto',
        nome: 'Supino Reto com Barra',
        grupoMuscular: 'Peito',
        seriesPadrao: 4,
        repsPadrao: 10,
        descansoSegundos: 90,
        instrucoes: 'Mantenha as escápulas retraídas e controle a descida da barra até o meio do peitoral.'
      },
      {
        id: 'supino_inclinado_halteres',
        nome: 'Supino Inclinado com Halteres',
        grupoMuscular: 'Peito',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 75,
        instrucoes: 'Banco inclinado a 30-45 graus. Alongue o peitoral na descida sem bater os halteres no topo.'
      },
      {
        id: 'crucifixo_maquina',
        nome: 'Crucifixo no Peck Deck / Máquina',
        grupoMuscular: 'Peito',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Foco no pico de contração máxima ao fechar os braços.'
      },
      {
        id: 'paralelas_peito',
        nome: 'Barras Paralelas (Foco Peito)',
        grupoMuscular: 'Peito',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 60,
        instrucoes: 'Tronco ligeiramente inclinado para frente para enfatizar a porção inferior do peitoral.'
      }
    ]
  },
  {
    id: 'back_iron',
    nome: 'Costas de Aço & Dorsal Titânica',
    categoria: 'Costas',
    icone: '🛡️',
    dificuldade: 'Avançado',
    duracaoEstimada: '50 min',
    xpRecompensa: 95,
    exercicios: [
      {
        id: 'puxada_alta',
        nome: 'Puxada Alta no Pulley (Pegada Aberta)',
        grupoMuscular: 'Costas',
        seriesPadrao: 4,
        repsPadrao: 10,
        descansoSegundos: 75,
        instrucoes: 'Puxe direcionando os cotovelos para baixo, contraindo a grande dorsal.'
      },
      {
        id: 'remada_curvada',
        nome: 'Remada Curvada com Barra',
        grupoMuscular: 'Costas',
        seriesPadrao: 4,
        repsPadrao: 8,
        descansoSegundos: 90,
        instrucoes: 'Coluna reta, joelhos levemente flexionados, puxe a barra rente às coxas até o abdômen.'
      },
      {
        id: 'remada_baixa_triangulo',
        nome: 'Remada Baixa com Triângulo',
        grupoMuscular: 'Costas',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Mantenha a postura ereta e aperte as costas na contração máxima.'
      },
      {
        id: 'pulldown_corda',
        nome: 'Pulldown no Pulley com Corda',
        grupoMuscular: 'Costas',
        seriesPadrao: 3,
        repsPadrao: 15,
        descansoSegundos: 60,
        instrucoes: 'Braços quase estendidos, sinta o alongamento da dorsal na subida.'
      }
    ]
  },
  {
    id: 'legs_colossus',
    nome: 'Pernas de Colosso',
    categoria: 'Pernas',
    icone: '🦵',
    dificuldade: 'Avançado',
    duracaoEstimada: '55 min',
    xpRecompensa: 110,
    exercicios: [
      {
        id: 'agachamento_livre',
        nome: 'Agachamento Livre com Barra',
        grupoMuscular: 'Pernas',
        seriesPadrao: 4,
        repsPadrao: 8,
        descansoSegundos: 120,
        instrucoes: 'Pés na largura dos ombros, descida controlada abaixo de 90 graus com coluna firme.'
      },
      {
        id: 'leg_press_45',
        nome: 'Leg Press 45°',
        grupoMuscular: 'Pernas',
        seriesPadrao: 4,
        repsPadrao: 10,
        descansoSegundos: 90,
        instrucoes: 'Não trave os joelhos no topo do movimento. Amplitude completa.'
      },
      {
        id: 'cadeira_extensora',
        nome: 'Cadeira Extensora',
        grupoMuscular: 'Pernas',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Segure 1 segundo no topo da extensão para contração total dos quadríceps.'
      },
      {
        id: 'mesa_flexora',
        nome: 'Mesa Flexora (Posteriores)',
        grupoMuscular: 'Pernas',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Mantenha a pelve colada no banco durante toda a flexão.'
      },
      {
        id: 'panturrilha_em_pe',
        nome: 'Elevação de Panturrilha em Pé',
        grupoMuscular: 'Pernas',
        seriesPadrao: 4,
        repsPadrao: 15,
        descansoSegundos: 45,
        instrucoes: 'Amplitude máxima: desça até o calcanhar alongar e suba na ponta máxima dos pés.'
      }
    ]
  },
  {
    id: 'shoulders_gladiator',
    nome: 'Ombros de Gladiador & Trapézio',
    categoria: 'Ombros',
    icone: '⚡',
    dificuldade: 'Intermediário',
    duracaoEstimada: '40 min',
    xpRecompensa: 80,
    exercicios: [
      {
        id: 'desenvolvimento_halteres',
        nome: 'Desenvolvimento de Ombros com Halteres',
        grupoMuscular: 'Ombros',
        seriesPadrao: 4,
        repsPadrao: 10,
        descansoSegundos: 75,
        instrucoes: 'Eleve os halteres acima da cabeça sem bater um no outro no topo.'
      },
      {
        id: 'elevacao_lateral',
        nome: 'Elevação Lateral com Halteres',
        grupoMuscular: 'Ombros',
        seriesPadrao: 4,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Cotovelos levemente flexionados, eleve até a linha dos ombros com controle.'
      },
      {
        id: 'crucifixo_invertido',
        nome: 'Crucifixo Invertido no Peck Deck',
        grupoMuscular: 'Ombros',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Foco no deltoide posterior e estabilização escapular.'
      },
      {
        id: 'encolhimento_halteres',
        nome: 'Encolhimento de Trapézio com Halteres',
        grupoMuscular: 'Ombros',
        seriesPadrao: 3,
        repsPadrao: 15,
        descansoSegundos: 45,
        instrucoes: 'Eleve os ombros verticalmente em direção às orelhas sem girar as articulações.'
      }
    ]
  },
  {
    id: 'arms_forge',
    nome: 'Braços da Forja (Bíceps & Tríceps)',
    categoria: 'Braços',
    icone: '💪',
    dificuldade: 'Intermediário',
    duracaoEstimada: '40 min',
    xpRecompensa: 75,
    exercicios: [
      {
        id: 'rosca_direta_w',
        nome: 'Rosca Direta com Barra W',
        grupoMuscular: 'Bíceps',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 60,
        instrucoes: 'Cotovelos colados ao tronco, movimento estrito sem balanço do tronco.'
      },
      {
        id: 'triceps_corda_pulley',
        nome: 'Tríceps no Pulley com Corda',
        grupoMuscular: 'Tríceps',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Abra a corda na parte inferior para contração máxima da cabeça lateral.'
      },
      {
        id: 'rosca_martelo',
        nome: 'Rosca Martelo com Halteres',
        grupoMuscular: 'Bíceps',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 60,
        instrucoes: 'Pegada neutra trabalhando o braquiorradial e espessura do braço.'
      },
      {
        id: 'triceps_frances',
        nome: 'Tríceps Francês Unilateral com Halter',
        grupoMuscular: 'Tríceps',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 60,
        instrucoes: 'Alongamento profundo da cabeça longa do tríceps atrás da cabeça.'
      }
    ]
  },
  {
    id: 'fullbody_spartan',
    nome: 'Corpo Inteiro Espartano (Full Body)',
    categoria: 'Corpo Inteiro',
    icone: '🔥',
    dificuldade: 'Iniciante / Rápido',
    duracaoEstimada: '35 min',
    xpRecompensa: 80,
    exercicios: [
      {
        id: 'agachamento_goblet',
        nome: 'Agachamento Goblet com Halter',
        grupoMuscular: 'Pernas',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Segure o halter junto ao peito e agache mantendo a postura ereta.'
      },
      {
        id: 'flexao_de_braco',
        nome: 'Flexão de Braços no Solo',
        grupoMuscular: 'Peito',
        seriesPadrao: 3,
        repsPadrao: 12,
        descansoSegundos: 60,
        instrucoes: 'Corpo em linha reta dos calcanhares à cabeça, peito quase toca o solo.'
      },
      {
        id: 'remada_unilateral',
        nome: 'Remada Unilateral com Halter (Serrote)',
        grupoMuscular: 'Costas',
        seriesPadrao: 3,
        repsPadrao: 10,
        descansoSegundos: 60,
        instrucoes: 'Apoie joelho e mão no banco, puxe o halter até o quadril.'
      },
      {
        id: 'prancha_isometrica',
        nome: 'Prancha Abdominal Isométrica',
        grupoMuscular: 'Abdômen',
        seriesPadrao: 3,
        repsPadrao: 45, // 45 segundos
        descansoSegundos: 45,
        instrucoes: 'Contraia abdômen e glúteos sem deixar o quadril cair.'
      }
    ]
  }
];

export const DEFAULT_MISSIONS = [
  {
    id: 'quest_first_blood',
    titulo: 'O Primeiro Passo do Guerreiro',
    descricao: 'Conclua seu primeiro treino completo no GymForge.',
    tipo: 'diaria',
    icone: '⚔️',
    progressoAtual: 0,
    meta: 1,
    recompensaXP: 100,
    concluida: false,
    reivindicada: false
  },
  {
    id: 'quest_volume_lift',
    titulo: 'Forja de Aço: 1.000 kg',
    descricao: 'Levante um volume total acumulado de pelo menos 1.000 kg em seus treinos.',
    tipo: 'diaria',
    icone: '🏋️',
    progressoAtual: 0,
    meta: 1000,
    recompensaXP: 150,
    concluida: false,
    reivindicada: false
  },
  {
    id: 'quest_weekly_3',
    titulo: 'Consistência Heroica Semanal',
    descricao: 'Realize 3 treinos durante a semana.',
    tipo: 'semanal',
    icone: '🗓️',
    progressoAtual: 0,
    meta: 3,
    recompensaXP: 350,
    concluida: false,
    reivindicada: false
  },
  {
    id: 'quest_epic_streak_7',
    titulo: 'Chamas da Disciplina (Streak 7 Dias)',
    descricao: 'Treine durante 7 dias para provar sua determinação inabalável.',
    tipo: 'epica',
    icone: '🔥',
    progressoAtual: 1,
    meta: 7,
    recompensaXP: 600,
    concluida: false,
    reivindicada: false
  }
];

export const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'ach_welcome',
    titulo: 'Despertar do Herói',
    descricao: 'Entrou na academia RPG GymForge e iniciou sua jornada.',
    icone: '🌟',
    recompensaXP: 50,
    desbloqueada: true,
    dataDesbloqueio: new Date().toISOString()
  },
  {
    id: 'ach_first_workout',
    titulo: 'Batismo de Ferro',
    descricao: 'Concluiu seu primeiro treino completo com registro de séries.',
    icone: '🛡️',
    recompensaXP: 100,
    desbloqueada: false,
    dataDesbloqueio: null
  },
  {
    id: 'ach_level_5',
    titulo: 'Aspirante da Forja',
    descricao: 'Alcançou o Nível 5 de personagem.',
    icone: '🥉',
    recompensaXP: 200,
    desbloqueada: false,
    dataDesbloqueio: null
  },
  {
    id: 'ach_level_10',
    titulo: 'Veterano dos Pesos',
    descricao: 'Alcançou o Nível 10 de personagem.',
    icone: '🥈',
    recompensaXP: 500,
    desbloqueada: false,
    dataDesbloqueio: null
  },
  {
    id: 'ach_streak_7',
    titulo: 'Chama Eterna',
    descricao: 'Alcançou uma sequência de 7 dias consecutivos de treino.',
    icone: '🔥',
    recompensaXP: 300,
    desbloqueada: false,
    dataDesbloqueio: null
  },
  {
    id: 'ach_ton_club',
    titulo: 'Clube das Toneladas',
    descricao: 'Levantou mais de 5.000 kg de volume somado em uma única sessão.',
    icone: '👑',
    recompensaXP: 400,
    desbloqueada: false,
    dataDesbloqueio: null
  }
];

class StorageService {
  getUserProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      const initialProfile = {
        ...DEFAULT_USER_PROFILE,
        userId: `warrior_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`
      };
      this.saveUserProfile(initialProfile);
      return initialProfile;
    }
    try {
      const profile = JSON.parse(raw);
      if (!profile.userId || profile.userId === 'warrior_demo_1') {
        profile.userId = `warrior_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
        this.saveUserProfile(profile);
      }
      return profile;
    } catch {
      const initialProfile = {
        ...DEFAULT_USER_PROFILE,
        userId: `warrior_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`
      };
      return initialProfile;
    }
  }

  saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  getCharacter() {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTER);
    if (!raw) {
      this.saveCharacter(DEFAULT_CHARACTER);
      return { ...DEFAULT_CHARACTER };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { ...DEFAULT_CHARACTER };
    }
  }

  saveCharacter(character) {
    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(character));
  }

  getWorkoutHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveWorkoutHistory(history) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  }

  addWorkoutRecord(record) {
    const history = this.getWorkoutHistory();
    history.unshift(record);
    this.saveWorkoutHistory(history);
    return history;
  }

  getMissions() {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (!raw) {
      this.saveMissions(DEFAULT_MISSIONS);
      return [...DEFAULT_MISSIONS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_MISSIONS];
    }
  }

  saveMissions(missions) {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  }

  getAchievements() {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) {
      this.saveAchievements(DEFAULT_ACHIEVEMENTS);
      return [...DEFAULT_ACHIEVEMENTS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_ACHIEVEMENTS];
    }
  }

  saveAchievements(achievements) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  getActiveWorkout() {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveActiveWorkout(workout) {
    if (!workout) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    }
  }
}

export const storageService = new StorageService();
