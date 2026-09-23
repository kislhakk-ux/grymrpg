// GymForge — Dashboard Page Component
import { renderCharacterAvatar } from '../components/CharacterAvatar.js';
import { getXPProgress, ATTRIBUTE_CONFIG } from '../utils/rpgCalculator.js';
import { storageService } from '../services/storageService.js';
import { formatVolume, formatDate } from '../utils/helpers.js';

export function renderDashboardPage() {
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();
  const missions = storageService.getMissions();
  const history = storageService.getWorkoutHistory();
  const xpInfo = getXPProgress(user.xp);

  // Calculate quick stats
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, curr) => acc + (curr.volumeTotalKg || 0), 0);
  const activeMissions = missions.filter(m => !m.reivindicada).slice(0, 3);
  const lastWorkout = history[0] || null;

  return `
    <div class="space-y-6 pb-12 animate-fadeIn">
      
      <!-- Welcome Hero Banner -->
      <section class="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/30 p-6 sm:p-8 shadow-glow-gold">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <!-- Greeting & Level Summary -->
          <div class="text-center md:text-left space-y-2 max-w-xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono">
              <span>⚔️ FORJA DOS HERÓIS</span>
              <span>•</span>
              <span>${character.classe.toUpperCase()}</span>
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-black font-rpg text-slate-100 tracking-wide">
              Olá, <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">${user.nome.split(' ')[0]}</span>!
            </h1>
            
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              Pronto para moldar seus atributos hoje? Cada repetição é um golpe de martelo na sua armadura.
            </p>

            <!-- Quick Action Buttons -->
            <div class="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a href="#arena" class="py-3 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-sm font-rpg font-black tracking-wider shadow-glow-crimson flex items-center gap-2 animate-pulse transform hover:scale-105 transition-all" onclick="window.gymforge.playClick()">
                <span>⚔️</span>
                <span>ARENA DE BATALHA PVP</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">LUTAR</span>
              </a>
              <a href="#workouts" class="py-3 px-5 rounded-xl btn-forge text-sm font-bold shadow-glow-gold flex items-center gap-2" onclick="window.gymforge.playClick()">
                <span>🏋️</span>
                <span>Treinar</span>
              </a>
              <a href="#character" class="py-3 px-4 rounded-xl btn-secondary text-sm font-semibold flex items-center gap-2" onclick="window.gymforge.playClick()">
                <span>🧙‍♂️</span>
                <span>Herói</span>
                ${user.pontosAtributoDisponiveis > 0 ? `
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                ` : ''}
              </a>
            </div>
          </div>

          <!-- Character Avatar Showcase -->
          <div class="flex flex-col items-center">
            ${renderCharacterAvatar(character, user, { size: 190, showAura: true, interactive: true })}
            <div class="mt-2 text-center">
              <span class="font-rpg font-bold text-amber-400 text-sm block">${character.nomePersonagem}</span>
              <span class="text-[11px] font-mono text-slate-400">Nível ${xpInfo.level} • ${user.xp} XP Total</span>
            </div>
          </div>

        </div>
      </section>

      <!-- Key Metrics & Streak Row -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <!-- Streak Card -->
        <div class="p-4 rounded-2xl glass-card border border-orange-500/30 flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl animate-flame">
            🔥
          </div>
          <div>
            <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Sequência</div>
            <div class="text-xl sm:text-2xl font-black text-orange-400 font-rpg">${user.streakAtual} Dias</div>
            <div class="text-[10px] text-slate-500">Recorde: ${user.maiorStreak} dias</div>
          </div>
        </div>

        <!-- Total Workouts -->
        <div class="p-4 rounded-2xl glass-card border border-blue-500/30 flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl">
            🏋️
          </div>
          <div>
            <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Treinos Feitos</div>
            <div class="text-xl sm:text-2xl font-black text-blue-400 font-rpg">${totalWorkouts} Sessões</div>
            <div class="text-[10px] text-slate-500">Consistência física</div>
          </div>
        </div>

        <!-- Total Volume Lifted -->
        <div class="p-4 rounded-2xl glass-card border border-amber-500/30 flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            ⚖️
          </div>
          <div>
            <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Volume Total</div>
            <div class="text-xl sm:text-2xl font-black text-amber-400 font-rpg">${formatVolume(totalVolume)}</div>
            <div class="text-[10px] text-slate-500">Toneladas forjadas</div>
          </div>
        </div>

        <!-- Available Stat Points -->
        <div class="p-4 rounded-2xl glass-card border ${user.pontosAtributoDisponiveis > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'} flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl ${user.pontosAtributoDisponiveis > 0 ? 'animate-bounce' : ''}">
            ✨
          </div>
          <div>
            <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Pontos Livres</div>
            <div class="text-xl sm:text-2xl font-black ${user.pontosAtributoDisponiveis > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'} font-rpg">
              +${user.pontosAtributoDisponiveis} Pts
            </div>
            <a href="#character" class="text-[10px] text-amber-400 hover:underline">Distribuir agora →</a>
          </div>
        </div>

      </section>

      <!-- Grid Layout: Attributes HUD & Active Quests -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Attributes Status Panel (Left 7 Cols) -->
        <div class="lg:col-span-7 rounded-3xl glass-panel p-5 sm:p-6 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">📊</span>
              <h3 class="font-rpg font-bold text-lg text-slate-100 uppercase tracking-wider">Atributos do Personagem</h3>
            </div>
            <a href="#character" class="text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Ver Detalhes →
            </a>
          </div>

          <!-- Attribute Bars List -->
          <div class="space-y-3.5 pt-1">
            ${Object.entries(character.atributos || {}).map(([key, val]) => {
              const cfg = ATTRIBUTE_CONFIG[key] || { name: key, color: '#f59e0b', icon: '⚡' };
              const maxScale = 50;
              const percent = Math.min(100, Math.round((val / maxScale) * 100));

              return `
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <div class="flex items-center gap-2 font-medium text-slate-200">
                      <span>${cfg.icon}</span>
                      <span>${cfg.name}</span>
                    </div>
                    <div class="font-mono font-bold" style="color: ${cfg.color};">
                      ${val} <span class="text-[10px] text-slate-500">/ 50</span>
                    </div>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width: ${percent}%; background: ${cfg.color};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Quick Tip from AI -->
          <div class="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200">
            <span class="text-lg">🤖</span>
            <div>
              <strong class="font-rpg text-cyan-300">Dica do Mestre da Forja:</strong>
              <p class="text-slate-300 mt-0.5">Seu atributo mais alto é <strong>Força</strong>! Continue priorizando exercícios compostos (Supino e Agachamento) para potencializar o bônus de XP.</p>
            </div>
          </div>
        </div>

        <!-- Active Quests & Recent Activity (Right 5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Missions Teaser -->
          <div class="rounded-3xl glass-panel p-5 sm:p-6 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">📜</span>
                <h3 class="font-rpg font-bold text-lg text-slate-100 uppercase tracking-wider">Missões Ativas</h3>
              </div>
              <a href="#missions" class="text-xs font-mono text-amber-400 hover:text-amber-300">Todas →</a>
            </div>

            <div class="space-y-3">
              ${activeMissions.length === 0 ? `
                <p class="text-xs text-slate-400 text-center py-4">Todas as missões foram concluídas! Volte amanhã para novos desafios.</p>
              ` : activeMissions.map(quest => {
                const questPercent = Math.min(100, Math.round((quest.progressoAtual / quest.meta) * 100));
                const isReady = quest.progressoAtual >= quest.meta;

                return `
                  <div class="p-3 rounded-2xl bg-slate-900/80 border ${isReady ? 'border-amber-500/60 bg-amber-950/20' : 'border-slate-800'} space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2 font-medium text-slate-200">
                        <span>${quest.icone}</span>
                        <span class="truncate max-w-[150px] sm:max-w-[200px]">${quest.titulo}</span>
                      </div>
                      <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
                        +${quest.recompensaXP} XP
                      </span>
                    </div>

                    <div class="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div class="h-full rounded-full ${isReady ? 'bg-amber-400' : 'bg-cyan-500'}" style="width: ${questPercent}%;"></div>
                    </div>

                    <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Progresso: ${quest.progressoAtual} / ${quest.meta}</span>
                      ${isReady ? `
                        <button onclick="window.gymforge.claimMissionReward('${quest.id}')" class="px-2 py-0.5 rounded bg-amber-500 text-forge-950 font-bold text-[10px] hover:bg-amber-400">
                          Resgatar
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Last Workout Completed Card -->
          <div class="rounded-3xl glass-panel p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span class="text-xs font-mono text-slate-400 uppercase tracking-wider">Último Treino Registrado</span>
              <a href="#history" class="text-xs font-mono text-amber-400 hover:underline">Histórico →</a>
            </div>

            ${lastWorkout ? `
              <div>
                <h4 class="font-rpg font-bold text-slate-100 text-sm">${lastWorkout.nomeTreino}</h4>
                <div class="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                  <span>📅 ${formatDate(lastWorkout.data)}</span>
                  <span>⚖️ ${formatVolume(lastWorkout.volumeTotalKg)}</span>
                  <span class="text-amber-400 font-bold">+${lastWorkout.xpGanho} XP</span>
                </div>
              </div>
            ` : `
              <div class="text-center py-3">
                <p class="text-xs text-slate-400">Você ainda não registrou nenhum treino.</p>
                <a href="#workouts" class="mt-2 inline-block py-1.5 px-4 rounded-lg btn-forge text-xs font-bold">Iniciar Primeiro Treino</a>
              </div>
            `}
          </div>

        </div>

      </section>

    </div>
  `;
}
