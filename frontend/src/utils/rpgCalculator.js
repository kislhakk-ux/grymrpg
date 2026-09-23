// GymForge — RPG Mechanics & Formulas

/**
 * Calculates the total cumulative XP required to reach a specific level.
 * Formula: Floor(100 * Level^1.5)
 */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(i, 1.5));
  }
  return total;
}

/**
 * Calculates current level and level progress from total accumulated XP.
 */
export function getXPProgress(totalXP = 0) {
  let level = 1;
  while (true) {
    const nextLevelTotal = xpForLevel(level + 1);
    if (totalXP < nextLevelTotal) {
      break;
    }
    level++;
    if (level >= 100) break; // Level cap
  }

  const currentLevelBaseXP = xpForLevel(level);
  const nextLevelBaseXP = xpForLevel(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelBaseXP;
  const xpNeededForNext = nextLevelBaseXP - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  return {
    level,
    totalXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
    currentLevelBaseXP,
    nextLevelBaseXP
  };
}

/**
 * Calculates XP reward for a completed workout.
 * Base: 50 XP + 10 XP per exercise completed + 1 XP per 100kg of total volume.
 */
export function calculateWorkoutXP(exercises = [], streakDays = 1) {
  let totalVolumeKg = 0;
  let totalSetsCompleted = 0;

  exercises.forEach(ex => {
    if (ex.sets && Array.isArray(ex.sets)) {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalSetsCompleted++;
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          totalVolumeKg += weight * reps;
        }
      });
    }
  });

  const baseXP = 50;
  const exerciseBonus = exercises.length * 10;
  const volumeBonus = Math.floor(totalVolumeKg / 100);
  const streakMultiplier = Math.min(streakDays, 7);
  const streakBonus = streakMultiplier * 5;

  const totalXP = baseXP + exerciseBonus + volumeBonus + streakBonus;

  return {
    totalXP,
    baseXP,
    exerciseBonus,
    volumeBonus,
    streakBonus,
    totalVolumeKg,
    totalSetsCompleted
  };
}

/**
 * Attribute definitions and bonuses
 */
export const ATTRIBUTE_CONFIG = {
  FORCA: {
    name: 'Força',
    abbr: 'FOR',
    color: '#ef4444',
    icon: '⚔️',
    description: 'Aumenta a potência muscular e o poder de levantamento de peso. Modifica a definição do avatar.'
  },
  RESISTENCIA: {
    name: 'Resistência',
    abbr: 'RES',
    color: '#3b82f6',
    icon: '🛡️',
    description: 'Melhora o fôlego, capacidade em altas repetições e volume sustentado de treino.'
  },
  AGILIDADE: {
    name: 'Agilidade',
    abbr: 'AGI',
    color: '#10b981',
    icon: '⚡',
    description: 'Aprimora a velocidade de execução, mobilidade e reduz o tempo de fadiga neuromuscular.'
  },
  VITALIDADE: {
    name: 'Vitalidade',
    abbr: 'VIT',
    color: '#ec4899',
    icon: '❤️',
    description: 'Acelera a recuperação entre séries, melhora a estamina e expande a aura de energia.'
  },
  DISCIPLINA: {
    name: 'Disciplina',
    abbr: 'DIS',
    color: '#f59e0b',
    icon: '🔥',
    description: 'Fortalece o foco mental, protege contra perda de streak e multiplica recompensas diárias.'
  }
};

/**
 * Character Archetypes / Classes
 */
export const ARCHETYPES = [
  {
    id: 'guerreiro',
    name: 'Guerreiro de Ferro',
    icon: '⚔️',
    primaryAttr: 'FORCA',
    secondaryAttr: 'VITALIDADE',
    description: 'Especialista em cargas pesadas e hipertrofia massiva.'
  },
  {
    id: 'tita',
    name: 'Titã da Resistência',
    icon: '🛡️',
    primaryAttr: 'RESISTENCIA',
    secondaryAttr: 'DISCIPLINA',
    description: 'Mestre em treinos de alto volume, super-séries e cardio intenso.'
  },
  {
    id: 'ladino',
    name: 'Ladino Veloz',
    icon: '⚡',
    primaryAttr: 'AGILIDADE',
    secondaryAttr: 'FORCA',
    description: 'Foco em calistenia, movimentos explosivos e agilidade atlética.'
  },
  {
    id: 'paladino',
    name: 'Paladino da Disciplina',
    icon: '👑',
    primaryAttr: 'DISCIPLINA',
    secondaryAttr: 'VITALIDADE',
    description: 'Equilíbrio perfeito de consistência inabalável e longevidade física.'
  }
];
