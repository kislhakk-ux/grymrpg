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
}

export const toast = new ToastManager();
