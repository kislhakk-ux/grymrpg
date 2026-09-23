// GymForge — Workouts Catalog Page
import { PRESET_WORKOUTS, storageService } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';

let selectedCategory = 'Todos';

export function renderWorkoutsPage() {
  const categories = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Corpo Inteiro'];
  
  const filteredWorkouts = selectedCategory === 'Todos' 
    ? PRESET_WORKOUTS 
    : PRESET_WORKOUTS.filter(w => w.categoria.toLowerCase() === selectedCategory.toLowerCase());

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono mb-1">
            <span>⚔️</span>
            <span>CATÁLOGO DE BATALHAS</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Fichas & Treinos da Forja</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Escolha sua rotina, execute suas séries e conquiste recompensas de XP.</p>
        </div>

        <button onclick="window.gymforge.openCreateWorkoutModal()" class="py-2.5 px-5 rounded-xl btn-cyan text-xs font-bold shadow-glow-cyan flex items-center gap-2">
          <span>➕</span>
          <span>Criar Treino Próprio</span>
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        ${categories.map(cat => `
          <button onclick="window.gymforge.filterWorkoutCategory('${cat}')" 
                  class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-amber-500 text-forge-950 font-bold shadow-glow-gold' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }">
            ${cat}
          </button>
        `).join('')}
      </div>

      <!-- Workouts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filteredWorkouts.map(workout => `
          <div class="rounded-3xl glass-card border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            
            <!-- Top Card Header -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                  ${workout.categoria}
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/40">
                  +${workout.xpRecompensa} XP
                </span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <span class="text-3xl">${workout.icone || '⚔️'}</span>
                <div>
                  <h3 class="font-rpg font-bold text-lg text-slate-100 leading-tight">${workout.nome}</h3>
                  <span class="text-xs text-slate-400 font-mono">⏱️ ${workout.duracaoEstimada} • ${workout.exercicios.length} exercícios</span>
                </div>
              </div>
            </div>

            <!-- Exercises Preview List -->
            <div class="space-y-2 py-2 border-y border-slate-800/80">
              <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Exercícios Inclusos:</span>
              <ul class="space-y-1.5 text-xs text-slate-300">
                ${workout.exercicios.slice(0, 4).map(ex => `
                  <li class="flex items-center justify-between">
                    <span class="truncate pr-2 font-medium">• ${ex.nome}</span>
                    <span class="text-slate-400 font-mono text-[11px] flex-shrink-0">${ex.seriesPadrao}x${ex.repsPadrao}</span>
                  </li>
                `).join('')}
                ${workout.exercicios.length > 4 ? `
                  <li class="text-[10px] text-amber-400 font-mono italic">+ ${workout.exercicios.length - 4} outros exercícios</li>
                ` : ''}
              </ul>
            </div>

            <!-- Start Workout CTA Button -->
            <button onclick="window.gymforge.startWorkout('${workout.id}')" class="w-full py-3 px-4 rounded-xl btn-forge text-center text-xs font-bold tracking-wider shadow-glow-gold flex items-center justify-center gap-2">
              <span>INICIAR TREINO</span>
              <span>⚡</span>
            </button>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// Global Workouts Handlers
window.gymforge = window.gymforge || {};

window.gymforge.filterWorkoutCategory = function(cat) {
  soundService.playClick();
  selectedCategory = cat;
  window.gymforge.refreshPage();
};

window.gymforge.startWorkout = function(workoutId) {
  soundService.playClick();
  const template = PRESET_WORKOUTS.find(w => w.id === workoutId);
  if (!template) return;

  // Initialize active workout session
  const activeWorkout = {
    templateId: template.id,
    nomeTreino: template.nome,
    categoria: template.categoria,
    inicioTempo: Date.now(),
    exercicios: template.exercicios.map(ex => ({
      id: ex.id,
      nome: ex.nome,
      grupoMuscular: ex.grupoMuscular,
      descansoSegundos: ex.descansoSegundos || 60,
      sets: Array.from({ length: ex.seriesPadrao || 3 }, (_, idx) => ({
        setNumber: idx + 1,
        weight: 0,
        reps: ex.repsPadrao || 10,
        completed: false
      }))
    }))
  };

  storageService.saveActiveWorkout(activeWorkout);
  window.location.hash = '#active-workout';
};

window.gymforge.openCreateWorkoutModal = function() {
  soundService.playClick();
  alert('🛡️ Criador de Fichas Customizadas: selecione uma ficha padrão ou adicione novos exercícios diretamente na tela de Treino Ao Vivo!');
};
