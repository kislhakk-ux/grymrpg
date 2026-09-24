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

// Periodic Global Challenge Broadcast Listener (Apenas para guerreiros com conta conectada)
let lastSeenChallengeId = null;
setInterval(async () => {
  const user = storageService.getUserProfile();
  // Notifica apenas contas ativas/logadas
  const isLogged = user && user.email && user.email !== 'heroi@gymforge.app';
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

function renderApp() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const currentHash = window.location.hash || '#dashboard';
  const routeRenderer = ROUTES[currentHash] || renderDashboardPage;
  const routeId = getRouteId(currentHash);

  const user = storageService.getUserProfile();

  // Render Top Navbar + Main Content Container
  appEl.innerHTML = `
    ${renderNavbar(user, routeId)}
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      ${routeRenderer()}
    </main>
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
