// GymForge — Workout History Page
import { storageService } from '../services/storageService.js';
import { formatDate, formatVolume, formatTime } from '../utils/helpers.js';
import { soundService } from '../services/soundService.js';

export function renderHistoryPage() {
  const history = storageService.getWorkoutHistory();

  // Aggregate metrics
  const totalWorkouts = history.length;
  const totalVolumeKg = history.reduce((acc, h) => acc + (h.volumeTotalKg || 0), 0);
  const totalXP = history.reduce((acc, h) => acc + (h.xpGanho || 0), 0);
  const totalDurationMinutes = history.reduce((acc, h) => acc + (h.duracaoMinutos || 0), 0);

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono mb-1">
            <span>📊</span>
            <span>MANUSCRITOS DE BATALHA</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Histórico de Treinos</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Acompanhe seu registro de cargas, volume somado e evolução de guerreiro.</p>
        </div>

        <a href="#workouts" class="py-2.5 px-5 rounded-xl btn-forge text-xs font-bold shadow-glow-gold flex items-center gap-2">
          <span>⚔️</span>
          <span>Novo Treino</span>
        </a>
      </div>

      <!-- Stats Metrics Banner -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sessões Realizadas</span>
          <span class="text-2xl font-black font-rpg text-amber-400">${totalWorkouts}</span>
        </div>

        <div class="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Volume Levantado</span>
          <span class="text-2xl font-black font-rpg text-cyan-400">${formatVolume(totalVolumeKg)}</span>
        </div>

        <div class="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">XP Conquistado</span>
          <span class="text-2xl font-black font-rpg text-emerald-400">+${totalXP} XP</span>
        </div>

        <div class="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tempo Dedicado</span>
          <span class="text-2xl font-black font-rpg text-purple-400">${totalDurationMinutes} min</span>
        </div>

      </div>

      <!-- Workouts Timeline / List -->
      <div class="space-y-4">
        <h3 class="font-rpg font-bold text-lg text-slate-100 uppercase tracking-wider">Registros Detalhados</h3>

        ${history.length === 0 ? `
          <div class="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
            <span class="text-4xl">📜</span>
            <h4 class="font-rpg font-bold text-base text-slate-200">Nenhum treino registrado ainda</h4>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">Complete seu primeiro treino para registrar suas cargas e iniciar sua jornada de evolução!</p>
            <a href="#workouts" class="inline-block py-2 px-5 rounded-xl btn-forge text-xs font-bold mt-2">
              Iniciar Meu Primeiro Treino
            </a>
          </div>
        ` : history.map((record) => `
          <div class="p-5 rounded-3xl glass-panel border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">${record.categoria || 'Treino'}</span>
                  <h4 class="font-rpg font-bold text-base text-slate-100">${record.nomeTreino}</h4>
                </div>
                <span class="text-xs font-mono text-slate-400">📅 ${formatDate(record.data)} • ⏱️ ${record.duracaoMinutos || 45} min</span>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-right">
                  <span class="text-[10px] font-mono text-slate-500 block uppercase">Volume</span>
                  <span class="font-mono font-bold text-xs text-cyan-300">${formatVolume(record.volumeTotalKg)}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-mono text-slate-500 block uppercase">Recompensa</span>
                  <span class="font-mono font-bold text-xs text-amber-400">+${record.xpGanho} XP</span>
                </div>
              </div>
            </div>

            <!-- Exercises details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
              ${(record.detalhesExercicios || []).map(ex => {
                const totalExWeight = (ex.sets || []).reduce((acc, s) => acc + (s.completed ? ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)) : 0), 0);
                const completedSetsCount = (ex.sets || []).filter(s => s.completed).length;

                return `
                  <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span class="font-semibold text-slate-200 block truncate">${ex.nome}</span>
                    <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                      <span>${completedSetsCount} séries feitas</span>
                      <span class="text-amber-300 font-bold">${formatVolume(totalExWeight)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}
