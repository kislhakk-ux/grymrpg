// GymForge — Floating Toast Notifications Component
import { soundService } from '../services/soundService.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'gymforge-toast-container';
      this.container.className = 'fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full';
      document.body.appendChild(this.container);
    }
  }

  show(options = {}) {
    this.init();
    const {
      title = 'Notificação da Forja',
      message = '',
      type = 'info', // 'xp', 'achievement', 'success', 'warning', 'info'
      duration = 3500,
      icon = '⚡'
    } = options;

    if (type === 'xp') {
      soundService.playXPGain();
    } else if (type === 'achievement') {
      soundService.playAchievement();
    }

    const toastId = `toast_${Date.now()}_${Math.random()}`;
    const toast = document.createElement('div');
    toast.id = toastId;

    let borderClass = 'border-slate-700 bg-forge-900/95 text-slate-200';
    let iconBg = 'bg-slate-800 text-amber-400';

    if (type === 'xp') {
      borderClass = 'border-amber-500/60 bg-amber-950/90 shadow-glow-gold text-amber-100';
      iconBg = 'bg-amber-500 text-forge-950 font-bold';
    } else if (type === 'achievement') {
      borderClass = 'border-purple-500/60 bg-purple-950/90 shadow-glow-purple text-purple-100';
      iconBg = 'bg-purple-500 text-white';
    } else if (type === 'success') {
      borderClass = 'border-emerald-500/60 bg-emerald-950/90 shadow-glow-emerald text-emerald-100';
      iconBg = 'bg-emerald-500 text-forge-950';
    }

    toast.className = `p-3.5 rounded-2xl glass-panel border ${borderClass} shadow-xl flex items-center gap-3 transform translate-x-full transition-all duration-300 pointer-events-auto`;
    toast.innerHTML = `
      <div class="w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 text-base shadow-sm">
        ${icon}
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold font-rpg uppercase tracking-wider">${title}</h4>
        ${message ? `<p class="text-xs opacity-90 truncate mt-0.5">${message}</p>` : ''}
      </div>
    `;

    this.container.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showXP(amount, reason = 'Treino Concluído') {
    this.show({
      title: `+${amount} XP Conquistado!`,
      message: reason,
      type: 'xp',
      icon: '✨'
    });
  }

  showAchievement(title, xpReward = 100) {
    this.show({
      title: '🏆 Conquista Desbloqueada!',
      message: `${title} (+${xpReward} XP)`,
      type: 'achievement',
      icon: '🏆',
      duration: 5000
    });
  }

  showBattleChallenge(challengerName, message) {
    this.init();
    soundService.playFightStart();

    const toastId = `toast_chal_${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;

    const displayMsg = message || `⚔️ ${challengerName} quer testar suas habilidades na arena!`;

    toast.className = `p-4 rounded-2xl glass-panel border-2 border-rose-500/90 bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-slate-900 shadow-glow-crimson flex flex-col gap-2.5 transform translate-x-full transition-all duration-300 pointer-events-auto max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-xl flex-shrink-0 shadow-glow-crimson text-white animate-bounce">
          ⚔️
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-[11px] font-black font-rpg text-amber-400 uppercase tracking-wider">DUELO NO COLISEU!</h4>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">NOVO</span>
          </div>
          <p class="text-xs text-slate-200 mt-1 leading-snug font-medium">${displayMsg}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <a href="#arena" onclick="window.gymforge.acceptBattleChallenge('${toastId}')" class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-rpg font-black text-xs text-center shadow-glow-crimson block tracking-wide transition-all transform hover:scale-102 active:scale-98">
          ACEITAR DESAFIO ⚔️
        </a>
        <button onclick="document.getElementById('${toastId}')?.remove()" class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors">
          Ignorar
        </button>
      </div>
    `;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
    });

    setTimeout(() => {
      if (document.getElementById(toastId)) {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
      }
    }, 12000);
  }
}

export const toast = new ToastManager();
