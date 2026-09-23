// GymForge — Interactive Rest Timer Component
import { soundService } from '../services/soundService.js';
import { formatTime } from '../utils/helpers.js';

class RestTimer {
  constructor() {
    this.totalSeconds = 60;
    this.remainingSeconds = 60;
    this.timerInterval = null;
    this.isRunning = false;
    this.onTickCallbacks = [];
  }

  start(seconds = 60) {
    this.stop();
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        soundService.playTimerBeep(false);
      }

      if (this.remainingSeconds <= 0) {
        this.stop();
        soundService.playTimerBeep(true);
      }

      this.notify();
    }, 1000);

    this.notify();
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
    this.notify();
  }

  addTime(seconds = 15) {
    this.remainingSeconds += seconds;
    this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
    this.notify();
  }

  onTick(cb) {
    this.onTickCallbacks.push(cb);
    return () => {
      this.onTickCallbacks = this.onTickCallbacks.filter(c => c !== cb);
    };
  }

  notify() {
    this.onTickCallbacks.forEach(cb => cb({
      total: this.totalSeconds,
      remaining: Math.max(0, this.remainingSeconds),
      isRunning: this.isRunning,
      percent: this.totalSeconds > 0 ? ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100 : 0
    }));
  }

  renderWidget() {
    return `
      <div id="rest-timer-widget" class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-4 rounded-2xl glass-panel border border-cyan-500/40 shadow-glow-cyan flex items-center gap-4 transition-all duration-300">
        <div class="relative w-14 h-14 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path class="text-slate-800" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path id="rest-timer-circle" class="text-cyan-400 transition-all duration-1000" stroke-width="3.5" stroke-dasharray="100, 100" stroke-dashoffset="${100 - (this.totalSeconds > 0 ? ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100 : 0)}" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span id="rest-timer-digits" class="absolute font-mono font-bold text-xs text-cyan-300">${formatTime(this.remainingSeconds)}</span>
        </div>

        <div>
          <div class="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">DESCANSO ENTRE SÉRIES</div>
          <div class="flex items-center gap-2 mt-1.5">
            <button onclick="window.gymforge.timerAdd(15)" class="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">+15s</button>
            <button onclick="window.gymforge.timerAdd(30)" class="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">+30s</button>
            <button onclick="window.gymforge.timerSkip()" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] text-slate-300">Pular</button>
          </div>
        </div>
      </div>
    `;
  }
}

export const restTimer = new RestTimer();
