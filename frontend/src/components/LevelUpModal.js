// GymForge — Level Up Celebration Modal Component
import { soundService } from '../services/soundService.js';

export function showLevelUpModal(newLevel, attributePointsAwarded = 3) {
  // Play triumphant sound
  soundService.playLevelUp();

  // Create modal container
  const modalId = 'gymforge-levelup-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  const modalHtml = `
    <div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div class="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border-2 border-amber-400/80 shadow-glow-gold text-center animate-level-up">
        
        <!-- Background Radial Aura -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/20 via-transparent to-amber-500/10 pointer-events-none"></div>

        <!-- Glowing Level Shield Crest -->
        <div class="relative inline-block my-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-glow-gold animate-bounce">
            <div class="w-full h-full bg-forge-950 rounded-[22px] flex flex-col items-center justify-center border border-amber-300">
              <span class="text-xs font-mono text-amber-300 uppercase tracking-widest">NÍVEL</span>
              <span class="text-4xl sm:text-5xl font-black font-rpg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">${newLevel}</span>
            </div>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl sm:text-3xl font-black font-rpg text-amber-400 tracking-wider mb-2 uppercase">
          VOCÊ SUBIU DE NÍVEL!
        </h2>
        
        <p class="text-sm text-slate-300 mb-6">
          Sua força e determinação foram reconhecidas pela Forja dos Heróis!
        </p>

        <!-- Rewards Box -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 mb-6">
          <div class="text-xs font-mono text-amber-300/80 uppercase tracking-wider mb-1">Recompensa Obtida</div>
          <div class="flex items-center justify-center gap-2 text-xl font-bold text-amber-400">
            <span>✨</span>
            <span>+${attributePointsAwarded} Pontos de Atributo</span>
            <span>✨</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Distribua em Força, Resistência, Agilidade, Vitalidade ou Disciplina.</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="#character" onclick="window.gymforge.closeLevelUpModal()" class="flex-1 py-3 px-4 rounded-xl btn-forge text-center text-sm font-bold block">
            DISTRIBUIR ATRIBUTOS
          </a>
          <button onclick="window.gymforge.closeLevelUpModal()" class="py-3 px-4 rounded-xl btn-secondary text-sm font-bold">
            CONTINUAR
          </button>
        </div>

      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);
}

export function closeLevelUpModal() {
  const modal = document.getElementById('gymforge-levelup-modal');
  if (modal) {
    modal.classList.add('opacity-0', 'transition-opacity', 'duration-200');
    setTimeout(() => modal.remove(), 200);
  }
}
