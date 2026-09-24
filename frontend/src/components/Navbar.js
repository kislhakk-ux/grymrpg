// GymForge — Navigation & Status HUD Component
import { getXPProgress } from '../utils/rpgCalculator.js';
import { soundService } from '../services/soundService.js';

export function renderNavbar(user, currentRoute = 'dashboard') {
  const xpInfo = getXPProgress(user?.xp || 0);
  const streak = user?.streakAtual || 1;
  const isSoundOn = soundService.isSoundEnabled();

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: '🏛️', href: '#dashboard' },
    { id: 'arena', label: 'ARENA PVP', icon: '⚔️🔥', href: '#arena', pvpHighlight: true },
    { id: 'workouts', label: 'Treinar', icon: '⚔️', href: '#workouts', highlight: true },
    { id: 'character', label: 'Personagem', icon: '🧙‍♂️', href: '#character' },
    { id: 'missions', label: 'Missões', icon: '📜', href: '#missions' },
    { id: 'achievements', label: 'Conquistas', icon: '🏆', href: '#achievements' },
    { id: 'history', label: 'Histórico', icon: '📊', href: '#history' },
    { id: 'ai', label: 'Mestre IA', icon: '🤖', href: '#ai' },
    { id: 'profile', label: 'Perfil', icon: '⚙️', href: '#profile' }
  ];

  return `
    <!-- Top HUD Status Bar -->
    <header class="sticky top-0 z-40 bg-forge-900/90 backdrop-blur-md border-b border-slate-800/80 shadow-hud">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          <!-- Brand Logo -->
          <a href="#dashboard" class="flex items-center gap-2 group flex-shrink-0" onclick="window.gymforge.playClick()">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-glow-gold transition-transform group-hover:scale-105">
              <div class="w-full h-full bg-forge-950 rounded-[10px] flex items-center justify-center">
                <span class="text-xl">⚔️</span>
              </div>
            </div>
            <div class="hidden sm:block">
              <span class="font-rpg font-bold text-lg tracking-wider text-amber-400 block leading-tight">GYMFORGE</span>
              <span class="text-[10px] tracking-widest text-slate-400 uppercase font-mono block">Academia RPG</span>
            </div>
          </a>

          <!-- Level & XP HUD Meter (Center) -->
          <div class="flex-1 max-w-md mx-2 sm:mx-4">
            <div class="flex items-center justify-between text-xs mb-1 font-mono">
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 text-[11px] badge-rpg">
                  NÍVEL ${xpInfo.level}
                </span>
                ${user?.pontosAtributoDisponiveis > 0 ? `
                  <a href="#character" class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/40 animate-pulse flex items-center gap-1">
                    <span>+${user.pontosAtributoDisponiveis}</span> PTS
                  </a>
                ` : ''}
              </div>
              <span class="text-slate-400 text-[11px]">
                <strong class="text-slate-200">${xpInfo.xpInCurrentLevel}</strong> / ${xpInfo.xpNeededForNext} XP
              </span>
            </div>
            
            <!-- Animated XP Bar -->
            <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5 relative">
              <div class="h-full rounded-full xp-bar-fill" style="width: ${xpInfo.progressPercent}%;"></div>
            </div>
          </div>

          <!-- Right Status Badges & Quick Actions -->
          <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            <!-- ARENA PVP QUICK CTA BUTTON -->
            <a href="#arena" class="py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-rpg font-bold text-xs sm:text-xs tracking-wider border border-rose-400 shadow-glow-crimson flex items-center gap-1.5 animate-pulse" onclick="window.gymforge.playClick()">
              <span class="text-sm">⚔️</span>
              <span class="hidden sm:inline">ARENA PVP</span>
            </a>

            <!-- Streak Flame Counter -->
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-400 font-bold text-xs sm:text-sm shadow-sm" title="Sequência de treinos consecutivos!">
              <span class="animate-flame inline-block">🔥</span>
              <span>${streak} <span class="hidden sm:inline font-normal text-xs text-orange-300/80">dias</span></span>
            </div>

            <!-- Sound Toggle Button -->
            <button id="btn-sound-toggle" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" title="${isSoundOn ? 'Desativar Sons' : 'Ativar Sons'}" onclick="window.gymforge.toggleSound()">
              <span class="text-sm">${isSoundOn ? '🔊' : '🔇'}</span>
            </button>

            <!-- Quick AI Assistant Button -->
            <button id="btn-open-ai-drawer" class="p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan transition-all hover:scale-105" title="Mestre da Forja (IA)" onclick="window.gymforge.openAIDrawer()">
              <span class="text-sm">🤖</span>
            </button>

            <!-- User Login / Profile Quick CTA -->
            ${(!user?.email || user?.isGuest || user?.email === 'heroi@gymforge.app') ? `
              <button onclick="window.gymforge.openAuthModal()" class="py-1 px-2 sm:py-1.5 sm:px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] sm:text-xs shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95" title="Entrar com conta Google">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span class="hidden sm:inline">Entrar</span>
              </button>
            ` : ''}

            <!-- User Avatar & Profile Quick Link -->
            <a href="#profile" class="w-9 h-9 rounded-xl overflow-hidden border-2 border-amber-400/60 p-0.5 hover:border-amber-400 transition-all flex-shrink-0" onclick="window.gymforge.playClick()" title="${user?.nome || 'Perfil'}">
              <img src="${user?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}" alt="Avatar" class="w-full h-full object-cover rounded-lg" />
            </a>

          </div>

        </div>

        <!-- Desktop Navigation Bar Links -->
        <nav class="hidden md:flex items-center justify-center gap-1 py-1.5 border-t border-slate-800/40 text-xs font-semibold">
          ${navItems.map(item => `
            <a href="${item.href}" 
               class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                 currentRoute === item.id 
                   ? (item.pvpHighlight ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-glow-crimson font-black' : item.highlight ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-forge-950 shadow-glow-gold font-bold' : 'bg-slate-800 text-amber-400 border border-amber-500/30')
                   : (item.pvpHighlight ? 'text-rose-400 hover:bg-rose-500/10 font-bold border border-rose-500/30' : item.highlight ? 'text-amber-400 hover:bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60')
               }"
               onclick="window.gymforge.playClick()">
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>

      </div>
    </header>

    <!-- Mobile Bottom Navigation Bar (Fixed for high usability) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-forge-950/95 backdrop-blur-lg border-t border-slate-800/90 py-1 px-2 shadow-2xl">
      <div class="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        <a href="#dashboard" class="flex flex-col items-center py-1 rounded-lg text-[10px] ${currentRoute === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'}" onclick="window.gymforge.playClick()">
          <span class="text-lg">🏛️</span>
          <span>Painel</span>
        </a>
        <a href="#arena" class="flex flex-col items-center py-1 rounded-lg text-[10px] ${currentRoute === 'arena' ? 'text-rose-400 font-bold' : 'text-rose-400/80 font-semibold'}" onclick="window.gymforge.playClick()">
          <span class="text-lg animate-pulse">⚔️</span>
          <span>Arena</span>
        </a>
        <a href="#workouts" class="flex flex-col items-center py-0.5 rounded-xl bg-gradient-to-t from-amber-600 to-amber-400 text-forge-950 font-bold text-[10px] -mt-3 shadow-glow-gold border-2 border-amber-300" onclick="window.gymforge.playClick()">
          <span class="text-xl">🏋️</span>
          <span>Treinar</span>
        </a>
        <a href="#character" class="flex flex-col items-center py-1 rounded-lg text-[10px] ${currentRoute === 'character' ? 'text-amber-400 font-bold' : 'text-slate-400'}" onclick="window.gymforge.playClick()">
          <span class="text-lg">🧙‍♂️</span>
          <span>Herói</span>
        </a>
        <a href="#missions" class="flex flex-col items-center py-1 rounded-lg text-[10px] ${currentRoute === 'missions' ? 'text-amber-400 font-bold' : 'text-slate-400'}" onclick="window.gymforge.playClick()">
          <span class="text-lg">📜</span>
          <span>Missões</span>
        </a>
      </div>
    </nav>
  `;
}
