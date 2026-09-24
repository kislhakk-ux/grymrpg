// GymForge — Main SPA Application Entrypoint
import { renderNavbar } from './components/Navbar.js';
import { renderDashboardPage } from './pages/DashboardPage.js';
import { renderArenaPage } from './pages/ArenaPage.js';
import { renderCharacterPage } from './pages/CharacterPage.js';
import { renderWorkoutsPage } from './pages/WorkoutsPage.js';
import { renderActiveWorkoutPage } from './pages/ActiveWorkoutPage.js';
import { renderHistoryPage } from './pages/HistoryPage.js';
import { renderMissionsPage } from './pages/MissionsPage.js';
import { renderAchievementsPage } from './pages/AchievementsPage.js';
import { renderAIPage } from './pages/AIPage.js';
import { renderProfilePage } from './pages/ProfilePage.js';
import { storageService } from './services/storageService.js';
import { soundService } from './services/soundService.js';
import { authService } from './auth/authService.js';
import { isFirebaseConfigured } from './services/firebase.js';
import { closeLevelUpModal } from './components/LevelUpModal.js';
import { aiChatDrawer } from './components/AIChatDrawer.js';

import { toast } from './components/Toast.js';
import { apiClient } from './services/api.js';

// Setup Global GymForge API on window
window.gymforge = window.gymforge || {};

window.gymforge.playClick = function() {
  soundService.playClick();
};

window.gymforge.toggleSound = function() {
  const current = soundService.isSoundEnabled();
  soundService.setSoundEnabled(!current);
  soundService.playClick();
  window.gymforge.refreshPage();
};

window.gymforge.openAIDrawer = function() {
  aiChatDrawer.open();
};

window.gymforge.closeAIDrawer = function() {
  aiChatDrawer.close();
};

window.gymforge.sendAIPrompt = function(text) {
  aiChatDrawer.sendMessage(text);
};

window.gymforge.sendAIMessage = function() {
  aiChatDrawer.sendMessage();
};

window.gymforge.closeLevelUpModal = function() {
  closeLevelUpModal();
  window.gymforge.refreshPage();
};

window.gymforge.refreshPage = function() {
  renderApp();
};

window.gymforge.acceptBattleChallenge = function(toastId) {
  const toastEl = document.getElementById(toastId);
  if (toastEl) toastEl.remove();
  soundService.playClick();
  window.location.hash = '#arena';
  setTimeout(() => {
    window.gymforge.startMatchmaking();
  }, 300);
};

// Google Authentication Handlers
window.gymforge.openAuthModal = function() {
  soundService.playClick();
  const modalEl = document.getElementById('auth-google-modal');
  if (modalEl) {
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  }
};

window.gymforge.closeAuthModal = function() {
  const modalEl = document.getElementById('auth-google-modal');
  if (modalEl) {
    modalEl.classList.add('hidden');
    modalEl.classList.remove('flex');
  }
};

window.gymforge.connectGoogle = async function(email = null, name = null) {
  soundService.playClick();
  const res = await authService.loginWithGoogle(email, name);
  if (res.success) {
    soundService.playAchievement();
    toast.show({
      title: '🔐 Conta Conectada!',
      message: `Bem-vindo(a), ${res.user.nome}! Notificações de batalha ativadas.`,
      type: 'success',
      icon: '✨'
    });
    window.gymforge.closeAuthModal();
    window.gymforge.refreshPage();
  } else {
    toast.show({
      title: 'Aviso de Autenticação',
      message: res.error || 'Não foi possível autenticar.',
      type: 'warning'
    });
  }
};

window.gymforge.logout = async function() {
  soundService.playClick();
  await authService.logout();
  toast.show({
    title: 'Desconectado',
    message: 'Você voltou ao Modo Visitante.',
    type: 'info'
  });
  window.gymforge.refreshPage();
};

window.gymforge.submitCustomGoogleLogin = function(e) {
  e.preventDefault();
  const nameInput = document.getElementById('auth-custom-name');
  const emailInput = document.getElementById('auth-custom-email');
  const name = nameInput ? nameInput.value : '';
  const email = emailInput ? emailInput.value : '';
  window.gymforge.connectGoogle(email || null, name || null);
};

// Periodic Global Challenge Broadcast Listener (Apenas para guerreiros com conta conectada)
let lastSeenChallengeId = null;
setInterval(async () => {
  const user = storageService.getUserProfile();
  // Notifica apenas contas ativas/logadas
  const isLogged = user && user.email && user.email !== 'heroi@gymforge.app' && !user.isGuest;
  if (!isLogged) return;

  try {
    const res = await apiClient.request('/api/arena/active-challenge');
    if (res && res.hasChallenge && res.challenge && res.challenge.id !== lastSeenChallengeId) {
      lastSeenChallengeId = res.challenge.id;
      toast.showBattleChallenge(res.challenge.challengerName, res.challenge.message);
    }
  } catch {
    // offline silent
  }
}, 2500);

// Router Mapping
const ROUTES = {
  '': renderDashboardPage,
  '#': renderDashboardPage,
  '#dashboard': renderDashboardPage,
  '#arena': renderArenaPage,
  '#character': renderCharacterPage,
  '#workouts': renderWorkoutsPage,
  '#active-workout': renderActiveWorkoutPage,
  '#history': renderHistoryPage,
  '#missions': renderMissionsPage,
  '#achievements': renderAchievementsPage,
  '#ai': renderAIPage,
  '#profile': renderProfilePage,
};

function getRouteId(hash) {
  const clean = hash.replace('#', '') || 'dashboard';
  return clean;
}

function renderAuthModal() {
  return `
    <div id="auth-google-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4 animate-fadeIn">
      <div class="rounded-3xl glass-panel border-2 border-amber-500/80 p-6 sm:p-8 max-w-md w-full shadow-glow-gold bg-gradient-to-b from-forge-900 via-slate-900 to-forge-950 space-y-6 relative">
        
        <button onclick="window.gymforge.closeAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80">
          ✕
        </button>

        <div class="text-center space-y-2">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-glow-gold">
            🔐
          </div>
          <h3 class="text-2xl font-black font-rpg text-amber-400">Autenticação GymForge</h3>
          <p class="text-xs text-slate-300">
            Conecte sua conta para desbloquear a sincronização em nuvem e receber desafios da <strong>Arena PVP Multiplayer</strong>.
          </p>
        </div>

        <!-- 1-Click Google Login -->
        <div class="space-y-3">
          <button onclick="window.gymforge.connectGoogle()" class="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-102 active:scale-98">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuar com o Google (1-Clique)</span>
          </button>
        </div>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-slate-800"></div>
          <span class="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">Ou Personalizar Perfil</span>
          <div class="flex-grow border-t border-slate-800"></div>
        </div>

        <!-- Custom Account Form -->
        <form onsubmit="window.gymforge.submitCustomGoogleLogin(event)" class="space-y-3">
          <div>
            <label class="text-[11px] font-mono text-slate-400 block mb-1">Seu Nome de Guerreiro</label>
            <input id="auth-custom-name" type="text" placeholder="Ex: Alex Titan" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none" required />
          </div>
          <div>
            <label class="text-[11px] font-mono text-slate-400 block mb-1">Seu E-mail Google</label>
            <input id="auth-custom-email" type="email" placeholder="Ex: seuemail@gmail.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none" required />
          </div>
          <button type="submit" class="w-full py-2.5 px-4 rounded-xl btn-forge font-bold text-xs shadow-glow-gold">
            Salvar & Ativar Notificações de Duelo
          </button>
        </form>

      </div>
    </div>
  `;
}

function renderApp() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const currentHash = window.location.hash || '#dashboard';
  const routeRenderer = ROUTES[currentHash] || renderDashboardPage;
  const routeId = getRouteId(currentHash);

  const user = storageService.getUserProfile();

  // Render Top Navbar + Main Content Container + Global Auth Modal
  appEl.innerHTML = `
    ${renderNavbar(user, routeId)}
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      ${routeRenderer()}
    </main>
    ${renderAuthModal()}
  `;
}

// Global Event Listeners
window.addEventListener('hashchange', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
});

// Unlock Web Audio API on first user interaction
['click', 'touchstart', 'keydown'].forEach(evt => {
  document.addEventListener(evt, () => {
    soundService.init();
  }, { once: true });
});

// Initial boot
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  console.log('⚔️ GymForge SPA carregado com sucesso!');
});
