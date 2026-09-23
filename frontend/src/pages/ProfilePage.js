// GymForge — Profile & Settings Page
import { storageService } from '../services/storageService.js';
import { authService } from '../auth/authService.js';
import { soundService } from '../services/soundService.js';
import { formatDate } from '../utils/helpers.js';
import { toast } from '../components/Toast.js';
import { isFirebaseConfigured } from '../services/firebase.js';

export function renderProfilePage() {
  const user = storageService.getUserProfile();
  const isSoundOn = soundService.isSoundEnabled();
  const isGuest = user.userId?.startsWith('warrior_') || !user.email;

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono mb-1">
            <span>⚙️</span>
            <span>CONFIGURAÇÕES DO AVENTUREIRO</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Perfil & Preferências</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Gerencie sua conta, sincronização em nuvem e efeitos do aplicativo.</p>
        </div>
      </div>

      <!-- User Account Card -->
      <div class="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 p-0.5 shadow-glow-gold flex-shrink-0">
            <img src="${user.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}" alt="Foto" class="w-full h-full object-cover rounded-xl" />
          </div>

          <div class="space-y-1 text-center sm:text-left flex-1">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 class="text-xl font-bold font-rpg text-slate-100">${user.nome}</h2>
              <span class="px-2 py-0.5 rounded-full ${isGuest ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'} text-[10px] font-mono font-bold">
                ${isGuest ? 'Modo Visitante / Local' : 'Conta Google Conectada'}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono">${user.email || 'Modo Local Ativo'}</p>
            <p class="text-[11px] text-slate-500">Membro desde ${formatDate(user.dataCriacao)}</p>
          </div>

          <div>
            ${isGuest ? `
              <button onclick="window.gymforge.connectGoogle()" class="py-2.5 px-5 rounded-xl btn-forge text-xs font-bold shadow-glow-gold flex items-center gap-2">
                <span>🔐</span>
                <span>Entrar com Google</span>
              </button>
            ` : `
              <button onclick="window.gymforge.logout()" class="py-2.5 px-4 rounded-xl btn-secondary text-xs font-semibold text-rose-400 hover:text-rose-300">
                Sair da Conta
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Cloud Sync & Preferences Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Audio & Sound Settings -->
        <div class="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <span class="text-xl">🔊</span>
            <h3 class="font-rpg font-bold text-base text-slate-100">Efeitos Sonoros</h3>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-slate-200">Sintetizador de Áudio RPG</h4>
              <p class="text-[11px] text-slate-400">Fanfarras de Level Up, bips de timer e XP</p>
            </div>

            <button onclick="window.gymforge.toggleSound()" class="px-4 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all ${
              isSoundOn ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
            }">
              ${isSoundOn ? 'ATIVADO' : 'MUTADO'}
            </button>
          </div>

          <div class="pt-2">
            <button onclick="window.gymforge.testLevelUpSound()" class="py-2 px-3 rounded-lg btn-secondary text-xs font-mono">
              🎵 Testar Fanfarra de Level Up
            </button>
          </div>
        </div>

        <!-- Cloud & Data Backup -->
        <div class="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <span class="text-xl">💾</span>
            <h3 class="font-rpg font-bold text-base text-slate-100">Backup & Dados</h3>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            Seus treinos e personagem são salvos localmente e sincronizados com o Firestore.
          </p>

          <div class="flex flex-wrap gap-2 pt-1">
            <button onclick="window.gymforge.exportBackup()" class="py-2 px-4 rounded-xl btn-secondary text-xs font-bold flex items-center gap-1.5">
              <span>📥</span>
              <span>Exportar JSON</span>
            </button>
            <button onclick="window.gymforge.resetData()" class="py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold">
              Reiniciar Dados
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

// Global Profile Handlers
window.gymforge = window.gymforge || {};

window.gymforge.connectGoogle = async function() {
  soundService.playClick();
  const res = await authService.loginWithGoogle();
  if (res.success) {
    toast.show({
      title: '🔐 Conectado com Sucesso!',
      message: `Bem-vindo(a), ${res.user.nome}!`,
      type: 'success',
      icon: '🛡️'
    });
    window.gymforge.refreshPage();
  }
};

window.gymforge.logout = async function() {
  soundService.playClick();
  await authService.logout();
  toast.show({
    title: 'Desconectado',
    message: 'Você saiu da sua conta.',
    type: 'info'
  });
  window.gymforge.refreshPage();
};

window.gymforge.testLevelUpSound = function() {
  soundService.playLevelUp();
};

window.gymforge.exportBackup = function() {
  soundService.playClick();
  const data = {
    profile: storageService.getUserProfile(),
    character: storageService.getCharacter(),
    history: storageService.getWorkoutHistory(),
    missions: storageService.getMissions(),
    achievements: storageService.getAchievements()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gymforge-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  toast.show({
    title: '📥 Backup Exportado!',
    message: 'Arquivo JSON salvo no seu dispositivo.',
    type: 'success'
  });
};

window.gymforge.resetData = function() {
  if (confirm('Atenção: deseja reiniciar seu progresso de testes para o estado inicial da Forja?')) {
    localStorage.clear();
    location.reload();
  }
};
