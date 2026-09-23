// GymForge — Missions & Quests Page
import { storageService } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';
import { toast } from '../components/Toast.js';
import { getXPProgress } from '../utils/rpgCalculator.js';
import { showLevelUpModal } from '../components/LevelUpModal.js';

let currentFilter = 'todas';

export function renderMissionsPage() {
  const missions = storageService.getMissions();

  const filteredMissions = currentFilter === 'todas'
    ? missions
    : missions.filter(m => m.tipo === currentFilter);

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono mb-1">
            <span>📜</span>
            <span>MURAIS DA GUILDA</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Missões & Desafios</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Cumpra tarefas na academia para acelerar seu ganho de XP e atributos.</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 text-xs font-semibold">
        ${[
          { id: 'todas', label: 'Todas as Missões' },
          { id: 'diaria', label: '⚡ Diárias' },
          { id: 'semanal', label: '🗓️ Semanais' },
          { id: 'epica', label: '🔥 Épicas' }
        ].map(tab => `
          <button onclick="window.gymforge.filterMissions('${tab.id}')" 
                  class="px-4 py-2 rounded-xl transition-all ${
                    currentFilter === tab.id 
                      ? 'bg-amber-500 text-forge-950 font-bold shadow-glow-gold' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }">
            ${tab.label}
          </button>
        `).join('')}
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${filteredMissions.map(quest => {
          const progressPercent = Math.min(100, Math.round(((quest.progressoAtual || 0) / quest.meta) * 100));
          const isReady = (quest.progressoAtual >= quest.meta) && !quest.reivindicada;
          const isClaimed = quest.reivindicada;

          return `
            <div class="p-5 rounded-3xl glass-panel border ${
              isClaimed 
                ? 'border-slate-800/60 opacity-60 bg-slate-900/40' 
                : isReady 
                  ? 'border-amber-400/80 bg-amber-950/30 shadow-glow-gold' 
                  : 'border-slate-800'
            } flex flex-col justify-between space-y-4">
              
              <!-- Top Row -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                    ${quest.tipo}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/40">
                    +${quest.recompensaXP} XP
                  </span>
                </div>

                <div class="flex items-start gap-3 pt-1">
                  <span class="text-3xl flex-shrink-0">${quest.icone || '📜'}</span>
                  <div>
                    <h3 class="font-rpg font-bold text-base text-slate-100">${quest.titulo}</h3>
                    <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">${quest.descricao}</p>
                  </div>
                </div>
              </div>

              <!-- Progress Bar & Actions -->
              <div class="space-y-2 pt-2 border-t border-slate-800/80">
                <div class="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Progresso:</span>
                  <span class="font-bold ${isReady ? 'text-amber-400' : 'text-slate-300'}">
                    ${quest.progressoAtual || 0} / ${quest.meta}
                  </span>
                </div>

                <div class="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div class="h-full rounded-full transition-all duration-500 ${
                    isClaimed ? 'bg-emerald-500' : isReady ? 'bg-amber-400' : 'bg-cyan-500'
                  }" style="width: ${progressPercent}%;"></div>
                </div>

                <div class="pt-1">
                  ${isClaimed ? `
                    <div class="py-2 text-center text-xs font-mono text-emerald-400 font-bold">
                      ✓ Recompensa Resgatada
                    </div>
                  ` : isReady ? `
                    <button onclick="window.gymforge.claimMissionReward('${quest.id}')" class="w-full py-2.5 px-4 rounded-xl btn-forge text-xs font-bold shadow-glow-gold flex items-center justify-center gap-2 animate-bounce">
                      <span>REIVINDICAR +${quest.recompensaXP} XP</span>
                      <span>✨</span>
                    </button>
                  ` : `
                    <div class="py-2 text-center text-xs font-mono text-slate-500">
                      Em andamento...
                    </div>
                  `}
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// Global Mission Handlers
window.gymforge = window.gymforge || {};

window.gymforge.filterMissions = function(filter) {
  soundService.playClick();
  currentFilter = filter;
  window.gymforge.refreshPage();
};

window.gymforge.claimMissionReward = function(missionId) {
  const missions = storageService.getMissions();
  const quest = missions.find(m => m.id === missionId);
  if (!quest || quest.reivindicada) return;

  const user = storageService.getUserProfile();
  const oldLevel = getXPProgress(user.xp).level;

  quest.reivindicada = true;
  user.xp = (user.xp || 0) + quest.recompensaXP;

  storageService.saveMissions(missions);

  const newLevelInfo = getXPProgress(user.xp);
  let leveledUp = false;

  if (newLevelInfo.level > oldLevel) {
    leveledUp = true;
    const levelsGained = newLevelInfo.level - oldLevel;
    user.nivel = newLevelInfo.level;
    user.pontosAtributoDisponiveis = (user.pontosAtributoDisponiveis || 0) + (levelsGained * 3);
  }

  storageService.saveUserProfile(user);

  soundService.playXPGain();
  toast.showXP(quest.recompensaXP, `Missão "${quest.titulo}" Reivindicada!`);

  if (leveledUp) {
    showLevelUpModal(newLevelInfo.level, (newLevelInfo.level - oldLevel) * 3);
  } else {
    window.gymforge.refreshPage();
  }
};
