// GymForge — Live Active Workout Tracker Page
import { storageService, PRESET_WORKOUTS } from '../services/storageService.js';
import { calculateWorkoutXP, getXPProgress } from '../utils/rpgCalculator.js';
import { formatTime, formatVolume } from '../utils/helpers.js';
import { restTimer } from '../components/RestTimer.js';
import { soundService } from '../services/soundService.js';
import { toast } from '../components/Toast.js';
import { showLevelUpModal } from '../components/LevelUpModal.js';

let workoutTimerInterval = null;
let elapsedSeconds = 0;

export function renderActiveWorkoutPage() {
  const activeWorkout = storageService.getActiveWorkout();

  if (!activeWorkout) {
    return `
      <div class="max-w-md mx-auto py-16 text-center space-y-4">
        <div class="text-5xl">⚔️</div>
        <h2 class="text-2xl font-black font-rpg text-slate-100">Nenhum Treino em Andamento</h2>
        <p class="text-slate-400 text-sm">Escolha uma ficha de treino no catálogo para iniciar sua jornada de hoje.</p>
        <a href="#workouts" class="inline-block py-3 px-6 rounded-xl btn-forge font-bold text-xs">
          IR PARA CATÁLOGO DE TREINOS
        </a>
      </div>
    `;
  }

  // Setup live stopwatch
  if (!workoutTimerInterval) {
    const startTime = activeWorkout.inicioTempo || Date.now();
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    workoutTimerInterval = setInterval(() => {
      elapsedSeconds++;
      const timerEl = document.getElementById('active-workout-stopwatch');
      if (timerEl) {
        timerEl.innerText = formatTime(elapsedSeconds);
      }
    }, 1000);
  }

  // Calculate live volume
  let liveVolumeKg = 0;
  activeWorkout.exercicios.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        liveVolumeKg += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
      }
    });
  });

  return `
    <div class="space-y-6 pb-28 animate-fadeIn max-w-4xl mx-auto">
      
      <!-- Top Sticky Session HUD -->
      <div class="sticky top-16 z-30 -mx-3 px-3 sm:mx-0 sm:px-0 py-3 bg-forge-950/95 backdrop-blur-md border-b border-slate-800">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-amber-500/40 shadow-glow-gold">
          
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">TREINO EM ANDAMENTO</span>
              <h2 class="text-lg font-black font-rpg text-slate-100 truncate">${activeWorkout.nomeTreino}</h2>
            </div>
          </div>

          <!-- Live Stopwatch & Stats -->
          <div class="flex items-center gap-4">
            <div class="text-center">
              <span class="text-[10px] font-mono text-slate-400 block uppercase">Tempo</span>
              <span id="active-workout-stopwatch" class="font-mono font-bold text-base text-amber-300">
                ${formatTime(elapsedSeconds)}
              </span>
            </div>

            <div class="text-center">
              <span class="text-[10px] font-mono text-slate-400 block uppercase">Volume</span>
              <span class="font-mono font-bold text-base text-cyan-300">
                ${formatVolume(liveVolumeKg)}
              </span>
            </div>

            <button onclick="window.gymforge.finishWorkout()" class="py-2.5 px-5 rounded-xl btn-forge text-xs font-bold shadow-glow-gold">
              FINALIZAR
            </button>
          </div>

        </div>
      </div>

      <!-- Exercise List with Sets and Reps -->
      <div class="space-y-6">
        ${activeWorkout.exercicios.map((ex, exIdx) => `
          <div class="rounded-3xl glass-panel border border-slate-800 p-5 sm:p-6 space-y-4">
            
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">${ex.grupoMuscular || 'Geral'}</span>
                  <h3 class="font-rpg font-bold text-base text-slate-100">${ex.nome}</h3>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">Descanso sugerido: <strong>${ex.descansoSegundos}s</strong></p>
              </div>

              <button onclick="window.gymforge.startRestTimer(${ex.descansoSegundos || 60})" class="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1">
                <span>⏱️</span>
                <span>Descanso</span>
              </button>
            </div>

            <!-- Sets Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="text-slate-400 border-b border-slate-800/60 text-[11px]">
                    <th class="py-2 px-2 w-12 text-center">SÉRIE</th>
                    <th class="py-2 px-3">CARGA (KG)</th>
                    <th class="py-2 px-3">REPETIÇÕES</th>
                    <th class="py-2 px-2 text-center w-16">STATUS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40">
                  ${ex.sets.map((set, setIdx) => `
                    <tr class="transition-colors ${set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-900/40'}">
                      <!-- Set Number -->
                      <td class="py-2.5 px-2 text-center font-bold ${set.completed ? 'text-emerald-400' : 'text-slate-400'}">
                        #${set.setNumber}
                      </td>

                      <!-- Weight Input -->
                      <td class="py-2 px-3">
                        <div class="flex items-center gap-1.5">
                          <input type="number" step="0.5" min="0" 
                                 value="${set.weight || ''}" 
                                 placeholder="0" 
                                 onchange="window.gymforge.updateSetWeight(${exIdx}, ${setIdx}, this.value)"
                                 class="w-20 px-2 py-1.5 rounded-lg glass-input text-center text-xs font-bold text-amber-300" />
                          <span class="text-slate-500 text-[10px]">kg</span>
                        </div>
                      </td>

                      <!-- Reps Input -->
                      <td class="py-2 px-3">
                        <input type="number" min="1" 
                               value="${set.reps || 10}" 
                               onchange="window.gymforge.updateSetReps(${exIdx}, ${setIdx}, this.value)"
                               class="w-16 px-2 py-1.5 rounded-lg glass-input text-center text-xs font-bold text-cyan-300" />
                      </td>

                      <!-- Checkbox / Complete Button -->
                      <td class="py-2 px-2 text-center">
                        <button onclick="window.gymforge.toggleSetComplete(${exIdx}, ${setIdx})" 
                                class="w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                  set.completed 
                                    ? 'bg-emerald-500 text-forge-950 font-bold shadow-glow-emerald scale-105' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                                }">
                          ${set.completed ? '✓' : '○'}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Add Set Row Button -->
            <div class="pt-1">
              <button onclick="window.gymforge.addSetToExercise(${exIdx})" class="text-xs font-mono text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                <span>➕</span>
                <span>Adicionar Série</span>
              </button>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- Floating Rest Timer Widget -->
      ${restTimer.renderWidget()}

      <!-- Cancel Workout Link -->
      <div class="text-center pt-4">
        <button onclick="window.gymforge.cancelWorkout()" class="text-xs text-rose-400/80 hover:text-rose-400 font-mono underline">
          Desistir do Treino Atual
        </button>
      </div>

    </div>
  `;
}

// Global Active Workout Handlers
window.gymforge = window.gymforge || {};

window.gymforge.updateSetWeight = function(exIdx, setIdx, weight) {
  const active = storageService.getActiveWorkout();
  if (active && active.exercicios[exIdx]?.sets[setIdx]) {
    active.exercicios[exIdx].sets[setIdx].weight = parseFloat(weight) || 0;
    storageService.saveActiveWorkout(active);
  }
};

window.gymforge.updateSetReps = function(exIdx, setIdx, reps) {
  const active = storageService.getActiveWorkout();
  if (active && active.exercicios[exIdx]?.sets[setIdx]) {
    active.exercicios[exIdx].sets[setIdx].reps = parseInt(reps) || 0;
    storageService.saveActiveWorkout(active);
  }
};

window.gymforge.toggleSetComplete = function(exIdx, setIdx) {
  const active = storageService.getActiveWorkout();
  if (!active || !active.exercicios[exIdx]?.sets[setIdx]) return;

  const currentStatus = active.exercicios[exIdx].sets[setIdx].completed;
  active.exercicios[exIdx].sets[setIdx].completed = !currentStatus;
  storageService.saveActiveWorkout(active);

  if (!currentStatus) {
    soundService.playClick();
    toast.show({
      title: 'Série Concluída!',
      message: `${active.exercicios[exIdx].nome} • Série #${setIdx + 1}`,
      type: 'info',
      icon: '✓',
      duration: 2000
    });
    // Trigger rest timer
    const restSecs = active.exercicios[exIdx].descansoSegundos || 60;
    restTimer.start(restSecs);
  }

  window.gymforge.refreshPage();
};

window.gymforge.addSetToExercise = function(exIdx) {
  const active = storageService.getActiveWorkout();
  if (!active || !active.exercicios[exIdx]) return;

  const sets = active.exercicios[exIdx].sets;
  const lastSet = sets[sets.length - 1];
  sets.push({
    setNumber: sets.length + 1,
    weight: lastSet ? lastSet.weight : 0,
    reps: lastSet ? lastSet.reps : 10,
    completed: false
  });

  storageService.saveActiveWorkout(active);
  soundService.playClick();
  window.gymforge.refreshPage();
};

window.gymforge.startRestTimer = function(seconds) {
  restTimer.start(seconds);
  soundService.playClick();
};

window.gymforge.timerAdd = function(seconds) {
  restTimer.addTime(seconds);
  soundService.playClick();
};

window.gymforge.timerSkip = function() {
  restTimer.stop();
  soundService.playClick();
  window.gymforge.refreshPage();
};

window.gymforge.cancelWorkout = function() {
  if (confirm('Deseja realmente cancelar este treino? Nenhum progresso ou XP será salvo.')) {
    if (workoutTimerInterval) {
      clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
    storageService.saveActiveWorkout(null);
    window.location.hash = '#workouts';
  }
};

window.gymforge.finishWorkout = function() {
  const active = storageService.getActiveWorkout();
  if (!active) return;

  const user = storageService.getUserProfile();
  const missions = storageService.getMissions();
  const achievements = storageService.getAchievements();

  // Calculate XP and Volume
  const xpReward = calculateWorkoutXP(active.exercicios, user.streakAtual || 1);
  const oldLevel = getXPProgress(user.xp).level;

  // Save Record
  const newRecord = {
    id: `rec_${Date.now()}`,
    userId: user.userId,
    workoutId: active.templateId,
    nomeTreino: active.nomeTreino,
    categoria: active.categoria,
    data: new Date().toISOString(),
    duracaoMinutos: Math.max(1, Math.round(elapsedSeconds / 60)),
    volumeTotalKg: xpReward.totalVolumeKg,
    totalSeries: xpReward.totalSetsCompleted,
    xpGanho: xpReward.totalXP,
    detalhesExercicios: active.exercicios
  };

  storageService.addWorkoutRecord(newRecord);

  // Update user XP & Streak
  user.xp = (user.xp || 0) + xpReward.totalXP;
  user.streakAtual = (user.streakAtual || 0) + 1;
  user.maiorStreak = Math.max(user.maiorStreak || 1, user.streakAtual);
  user.ultimoTreinoData = new Date().toISOString().split('T')[0];

  const newLevelInfo = getXPProgress(user.xp);
  let leveledUp = false;

  if (newLevelInfo.level > oldLevel) {
    leveledUp = true;
    const levelsGained = newLevelInfo.level - oldLevel;
    user.nivel = newLevelInfo.level;
    user.pontosAtributoDisponiveis = (user.pontosAtributoDisponiveis || 0) + (levelsGained * 3);
  }

  // Update Missions Progress
  missions.forEach(mission => {
    if (!mission.concluida) {
      if (mission.id === 'quest_first_blood') {
        mission.progressoAtual = 1;
        mission.concluida = true;
      } else if (mission.id === 'quest_volume_lift') {
        mission.progressoAtual = Math.min(mission.meta, (mission.progressoAtual || 0) + xpReward.totalVolumeKg);
        if (mission.progressoAtual >= mission.meta) mission.concluida = true;
      } else if (mission.id === 'quest_weekly_3') {
        mission.progressoAtual = Math.min(mission.meta, (mission.progressoAtual || 0) + 1);
        if (mission.progressoAtual >= mission.meta) mission.concluida = true;
      }
    }
  });
  storageService.saveMissions(missions);

  // Update Achievements
  achievements.forEach(ach => {
    if (!ach.desbloqueada) {
      if (ach.id === 'ach_first_workout') {
        ach.desbloqueada = true;
        ach.dataDesbloqueio = new Date().toISOString();
        toast.showAchievement(ach.titulo, ach.recompensaXP);
      } else if (ach.id === 'ach_ton_club' && xpReward.totalVolumeKg >= 5000) {
        ach.desbloqueada = true;
        ach.dataDesbloqueio = new Date().toISOString();
        toast.showAchievement(ach.titulo, ach.recompensaXP);
      }
    }
  });
  storageService.saveAchievements(achievements);

  // Save User
  storageService.saveUserProfile(user);

  // Cleanup
  if (workoutTimerInterval) {
    clearInterval(workoutTimerInterval);
    workoutTimerInterval = null;
  }
  storageService.saveActiveWorkout(null);
  restTimer.stop();

  toast.showXP(xpReward.totalXP, `Treino ${active.nomeTreino} Concluído!`);

  if (leveledUp) {
    showLevelUpModal(newLevelInfo.level, (newLevelInfo.level - oldLevel) * 3);
  } else {
    window.location.hash = '#history';
  }
};
