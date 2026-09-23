// GymForge — Achievements & Trophy Room Page
import { storageService } from '../services/storageService.js';
import { formatDate } from '../utils/helpers.js';

export function renderAchievementsPage() {
  const achievements = storageService.getAchievements();

  const unlockedCount = achievements.filter(a => a.desbloqueada).length;
  const totalCount = achievements.length;
  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-mono mb-1">
            <span>🏆</span>
            <span>GALERIA DE TROFÉUS</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Conquistas & Glória</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Marcos imortais gravados na pedra da Forja.</p>
        </div>

        <!-- Progress Summary -->
        <div class="px-5 py-2.5 rounded-2xl glass-panel border border-purple-500/40 text-right">
          <span class="text-[10px] font-mono text-slate-400 block uppercase">Progresso Total</span>
          <span class="text-xl font-bold font-rpg text-purple-400">${unlockedCount} / ${totalCount} (${percentComplete}%)</span>
        </div>
      </div>

      <!-- Achievements Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${achievements.map(ach => `
          <div class="p-5 rounded-3xl glass-panel border transition-all ${
            ach.desbloqueada 
              ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/30 to-slate-900/80 shadow-glow-purple' 
              : 'border-slate-800/80 opacity-50 bg-slate-900/30'
          } flex flex-col justify-between space-y-4">
            
            <div class="flex items-start gap-3.5">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                ach.desbloqueada 
                  ? 'bg-gradient-to-tr from-purple-600 to-amber-500 shadow-glow-purple' 
                  : 'bg-slate-800 text-slate-500'
              }">
                ${ach.icone || '🏆'}
              </div>

              <div>
                <h3 class="font-rpg font-bold text-base ${ach.desbloqueada ? 'text-purple-300' : 'text-slate-300'}">${ach.titulo}</h3>
                <p class="text-xs text-slate-400 mt-0.5 leading-snug">${ach.descricao}</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
              <span class="text-amber-400 font-bold">+${ach.recompensaXP} XP</span>
              
              <span class="${ach.desbloqueada ? 'text-emerald-400 font-bold' : 'text-slate-500'} text-[11px]">
                ${ach.desbloqueada ? `✓ Desbloqueada em ${formatDate(ach.dataDesbloqueio)}` : '🔒 Bloqueada'}
              </span>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}
