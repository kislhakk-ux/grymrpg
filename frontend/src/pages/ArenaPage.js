// GymForge — PVP Battle Arena & Combat Fighter Component
import { storageService } from '../services/storageService.js';
import { renderCharacterAvatar } from '../components/CharacterAvatar.js';
import { soundService } from '../services/soundService.js';
import { toast } from '../components/Toast.js';
import { getXPProgress } from '../utils/rpgCalculator.js';
import { showLevelUpModal } from '../components/LevelUpModal.js';
import { apiClient } from '../services/api.js';

// Arena State
let arenaState = 'lobby'; // 'lobby', 'matchmaking', 'battle', 'result'
let currentOpponent = null;
let currentMatch = null;
let playerHp = 100;
let playerMaxHp = 100;
let playerFury = 0;
let opponentHp = 100;
let opponentMaxHp = 100;
let opponentFury = 0;
let isPlayerTurn = true;
let isPlayerBlocking = false;
let isOpponentBlocking = false;
let combatLogs = [];
let battleWinner = null;
let activeTab = 'arena'; // 'arena', 'ranking'

export function renderArenaPage() {
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();
  const attrs = character.atributos || { FORCA: 10, RESISTENCIA: 8, AGILIDADE: 6, VITALIDADE: 10, DISCIPLINA: 8 };

  // Calculate stats
  playerMaxHp = 100 + (attrs.VITALIDADE * 15) + (user.nivel * 10);
  if (arenaState === 'lobby') {
    playerHp = playerMaxHp;
    playerFury = 0;
  }

  const pvpRating = user.pvpRating || 1000;
  const pvpWins = user.pvpWins || 0;
  const pvpLosses = user.pvpLosses || 0;
  const pvpStreak = user.pvpStreak || 0;
  const league = getLeagueFromRating(pvpRating);

  return `
    <div class="space-y-6 pb-16 animate-fadeIn max-w-6xl mx-auto">
      
      <!-- Top Arena Header Banner -->
      <div class="relative rounded-3xl overflow-hidden glass-panel border border-rose-500/40 p-6 sm:p-8 shadow-glow-crimson bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-amber-950/30">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-mono font-bold animate-pulse">
              <span>⚔️ ARENA PVP MULTIPLAYER</span>
              <span>•</span>
              <span>COMBATE EM TEMPO REAL</span>
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-black font-rpg text-slate-100 tracking-wider">
              Coliseu da Forja dos Titãs
            </h1>
            
            <p class="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Use seus atributos reais de treino para enfrentar outros guerreiros em duelos épicos. Ganhe Glória, suba no ranking global e conquiste recompensas de XP!
            </p>
          </div>

          <!-- Player PVP Stats Pill -->
          <div class="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 shadow-lg flex-shrink-0">
            <div class="text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Liga</span>
              <span class="text-base font-bold font-rpg text-amber-400 flex items-center justify-center gap-1">
                <span>${league.icon}</span>
                <span>${league.name}</span>
              </span>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div class="text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Rating (RP)</span>
              <span class="text-lg font-black font-mono text-rose-400">${pvpRating}</span>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div class="text-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">V/D</span>
              <span class="text-xs font-mono font-bold text-emerald-400">${pvpWins}W / ${pvpLosses}L</span>
            </div>
          </div>

        </div>

        <!-- Navigation Tabs between Arena & Ranking -->
        <div class="flex items-center gap-3 mt-6 border-t border-slate-800/80 pt-4 text-xs font-bold">
          <button onclick="window.gymforge.setArenaTab('arena')" class="px-5 py-2 rounded-xl transition-all ${activeTab === 'arena' ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-glow-crimson' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}">
            ⚔️ Arena de Combate
          </button>
          <button onclick="window.gymforge.setArenaTab('ranking')" class="px-5 py-2 rounded-xl transition-all ${activeTab === 'ranking' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-forge-950 shadow-glow-gold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}">
            🏆 Ranque de Classificação (Top Heróis)
          </button>
        </div>
      </div>

      <!-- Main Section: Switch between Arena View and Leaderboard -->
      ${activeTab === 'arena' ? renderArenaBattleSection(user, character) : renderLeaderboardSection(user)}

    </div>
  `;
}

function renderArenaBattleSection(user, character) {
  if (arenaState === 'matchmaking') {
    return renderMatchmakingView();
  } else if (arenaState === 'battle') {
    return renderFightingStage(user, character);
  } else if (arenaState === 'result') {
    return renderBattleResultView(user);
  }

  // Lobby default
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      
      <!-- Player Fighter Preview (Left 5 Cols) -->
      <div class="lg:col-span-5 rounded-3xl glass-panel p-6 border border-slate-800 text-center space-y-4">
        <span class="text-xs font-mono text-slate-400 uppercase tracking-wider block">SEU GUERREIRO PRONTO</span>
        
        <div class="py-2">
          ${renderCharacterAvatar(character, user, { size: 210, showAura: true, interactive: false })}
        </div>

        <h3 class="font-rpg font-bold text-xl text-amber-400">${character.nomePersonagem}</h3>
        <span class="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
          Nível ${user.nivel} • ${character.classe.toUpperCase()}
        </span>

        <!-- Attributes Radar Snapshot -->
        <div class="grid grid-cols-5 gap-1 pt-3 text-center text-[11px] font-mono border-t border-slate-800">
          <div class="bg-rose-950/30 p-1.5 rounded-lg border border-rose-500/30">
            <span class="text-rose-400 font-bold block">FOR</span>
            <span>${character.atributos?.FORCA || 10}</span>
          </div>
          <div class="bg-blue-950/30 p-1.5 rounded-lg border border-blue-500/30">
            <span class="text-blue-400 font-bold block">RES</span>
            <span>${character.atributos?.RESISTENCIA || 8}</span>
          </div>
          <div class="bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-500/30">
            <span class="text-emerald-400 font-bold block">AGI</span>
            <span>${character.atributos?.AGILIDADE || 6}</span>
          </div>
          <div class="bg-pink-950/30 p-1.5 rounded-lg border border-pink-500/30">
            <span class="text-pink-400 font-bold block">VIT</span>
            <span>${character.atributos?.VITALIDADE || 10}</span>
          </div>
          <div class="bg-amber-950/30 p-1.5 rounded-lg border border-amber-500/30">
            <span class="text-amber-400 font-bold block">DIS</span>
            <span>${character.atributos?.DISCIPLINA || 8}</span>
          </div>
        </div>
      </div>

      <!-- Matchmaking CTA (Right 7 Cols) -->
      <div class="lg:col-span-7 rounded-3xl glass-panel p-8 border border-rose-500/30 shadow-glow-crimson text-center space-y-6">
        
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400 p-1 shadow-glow-crimson animate-bounce flex items-center justify-center">
          <span class="text-4xl">⚔️</span>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl sm:text-3xl font-black font-rpg text-slate-100 uppercase">
            Entrar na Fila de Batalha
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            O sistema sincronizará você com um oponente online de nível e classificação similares. Cada golpe desferido consumirá sua estratégia e atributos!
          </p>
        </div>

        <div class="pt-2">
          <button onclick="window.gymforge.startMatchmaking()" class="py-4 px-10 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-rpg font-black text-base uppercase tracking-widest shadow-glow-crimson transition-all transform hover:scale-105 active:scale-95">
            ⚔️ BUSCAR OPONENTE ONLINE ⚡
          </button>
        </div>

        <div class="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 pt-2">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Guerreiros Online: <strong>48 Ativos</strong>
          </span>
          <span>•</span>
          <span>Tempo Médio: <strong>3 segundos</strong></span>
        </div>

      </div>

    </div>
  `;
}

function renderMatchmakingView() {
  return `
    <div class="rounded-3xl glass-panel p-12 border border-rose-500/50 shadow-glow-crimson text-center space-y-8 max-w-2xl mx-auto animate-fadeIn">
      
      <!-- Radar Pulse Circle -->
      <div class="relative w-36 h-36 mx-auto flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></div>
        <div class="absolute inset-4 rounded-full bg-amber-500/30 animate-pulse"></div>
        <div class="relative z-10 w-20 h-20 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-3xl shadow-glow-crimson">
          ⚔️
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-2xl font-black font-rpg text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-200 uppercase tracking-widest animate-pulse">
          BUSCANDO OPONENTE NA ARENA...
        </h3>
        <p class="text-xs font-mono text-slate-400">Sincronizando guerreiros da guilda através do servidor...</p>
      </div>

      <button onclick="window.gymforge.cancelMatchmaking()" class="py-2.5 px-6 rounded-xl btn-secondary text-xs font-mono">
        Cancelar Busca
      </button>

    </div>
  `;
}

function renderFightingStage(user, character) {
  const playerHpPercent = Math.max(0, Math.round((playerHp / playerMaxHp) * 100));
  const oppHpPercent = Math.max(0, Math.round((opponentHp / opponentMaxHp) * 100));

  return `
    <div id="battle-arena-stage" class="space-y-6 animate-fadeIn select-none">
      
      <!-- FIGHTING GAME HUD HEADER (HP BARS & FURY METERS) -->
      <div class="p-4 sm:p-6 rounded-3xl glass-panel border border-slate-800 shadow-2xl bg-gradient-to-b from-slate-900/90 to-forge-950">
        
        <div class="grid grid-cols-12 gap-2 sm:gap-4 items-center">
          
          <!-- Player Side (Left 5 Cols) -->
          <div class="col-span-5 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold">
              <span class="text-amber-400 truncate">${character.nomePersonagem}</span>
              <span class="text-emerald-400">${playerHp} / ${playerMaxHp} HP</span>
            </div>

            <!-- Player Health Bar (Mortal Kombat Style) -->
            <div class="w-full h-5 rounded-lg bg-slate-950 border border-slate-700 p-0.5 relative overflow-hidden shadow-inner">
              <div class="h-full rounded transition-all duration-300 ${playerHpPercent > 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : playerHpPercent > 25 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-600 to-red-500'}" style="width: ${playerHpPercent}%;"></div>
            </div>

            <!-- Player Fury / Ultimate Meter -->
            <div class="flex items-center gap-2 text-[10px] font-mono">
              <span class="text-rose-400 font-bold uppercase">FÚRIA</span>
              <div class="flex-1 h-2 rounded bg-slate-950 overflow-hidden border border-rose-500/30">
                <div class="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300" style="width: ${playerFury}%;"></div>
              </div>
              <span class="text-slate-400">${playerFury}%</span>
            </div>
          </div>

          <!-- Center VS Emblem (2 Cols) -->
          <div class="col-span-2 text-center">
            <div class="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black font-rpg text-white shadow-glow-crimson text-sm sm:text-base animate-pulse">
              VS
            </div>
            <span class="text-[10px] font-mono text-slate-400 block mt-1 uppercase">ROUND 1</span>
          </div>

          <!-- Opponent Side (Right 5 Cols) -->
          <div class="col-span-5 space-y-2 text-right">
            <div class="flex items-center justify-between text-xs font-mono font-bold">
              <span class="text-rose-400">${opponentHp} / ${opponentMaxHp} HP</span>
              <span class="text-slate-200 truncate">${currentOpponent.nomePersonagem}</span>
            </div>

            <!-- Opponent Health Bar -->
            <div class="w-full h-5 rounded-lg bg-slate-950 border border-slate-700 p-0.5 relative overflow-hidden shadow-inner flex justify-end">
              <div class="h-full rounded transition-all duration-300 ${oppHpPercent > 50 ? 'bg-gradient-to-l from-emerald-500 to-green-400' : oppHpPercent > 25 ? 'bg-gradient-to-l from-amber-500 to-yellow-400' : 'bg-gradient-to-l from-rose-600 to-red-500'}" style="width: ${oppHpPercent}%;"></div>
            </div>

            <!-- Opponent Fury Meter -->
            <div class="flex items-center justify-end gap-2 text-[10px] font-mono">
              <span class="text-slate-400">${opponentFury}%</span>
              <div class="w-24 h-2 rounded bg-slate-950 overflow-hidden border border-rose-500/30">
                <div class="h-full bg-gradient-to-l from-rose-500 to-amber-400 transition-all duration-300" style="width: ${opponentFury}%;"></div>
              </div>
              <span class="text-rose-400 font-bold uppercase">FÚRIA</span>
            </div>
          </div>

        </div>

      </div>

      <!-- COMBAT STAGE VIEW (AVATARS FACING OFF) -->
      <div class="relative h-64 sm:h-80 rounded-3xl overflow-hidden glass-panel border border-slate-800 flex items-center justify-between px-6 sm:px-16 bg-gradient-to-b from-slate-900/60 via-forge-950 to-black">
        
        <!-- Background Fighting Ring Particles -->
        <div class="absolute inset-0 bg-radial-gradient from-rose-500/10 via-transparent to-black pointer-events-none"></div>

        <!-- Left Fighter (Player) -->
        <div id="player-avatar-stage" class="relative z-10 flex flex-col items-center transition-transform duration-200">
          <div class="transform scale-110">
            ${renderCharacterAvatar(character, user, { size: 160, showAura: true, interactive: false })}
          </div>
          ${isPlayerBlocking ? `
            <span class="px-2.5 py-0.5 rounded-full bg-blue-500 text-forge-950 font-bold font-mono text-[10px] shadow-glow-cyan animate-bounce mt-1">
              🛡️ BLOQUEANDO
            </span>
          ` : ''}
        </div>

        <!-- Combat Floater Area (Damage text popups) -->
        <div id="combat-floater" class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"></div>

        <!-- Right Fighter (Opponent) -->
        <div id="opponent-avatar-stage" class="relative z-10 flex flex-col items-center transition-transform duration-200">
          <div class="transform scale-110 -scale-x-100">
            ${renderCharacterAvatar({ atributos: currentOpponent.atributos, customizacaoVisual: { pele: '#e0ac69', corCabelo: '#ef4444' } }, currentOpponent, { size: 160, showAura: true, interactive: false })}
          </div>
          ${isOpponentBlocking ? `
            <span class="px-2.5 py-0.5 rounded-full bg-blue-500 text-forge-950 font-bold font-mono text-[10px] shadow-glow-cyan animate-bounce mt-1">
              🛡️ BLOQUEANDO
            </span>
          ` : ''}
        </div>

      </div>

      <!-- COMBAT ACTIONS & CONTROLS HUD -->
      <div class="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-mono text-slate-400 uppercase font-bold">
            ${isPlayerTurn ? '⚡ SEU TURNO: ESCOLHA SUA AÇÃO DE COMBATE' : '⏳ TURNO DO ADVERSÁRIO...'}
          </span>
          <span class="text-xs font-mono text-amber-400">Tempo de Reação Livre</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <!-- Quick Strike -->
          <button onclick="window.gymforge.executeBattleAction('quick_strike')" 
                  class="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-left transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  ${!isPlayerTurn ? 'disabled' : ''}>
            <div class="flex items-center gap-2 text-sm font-bold text-slate-100 font-rpg">
              <span>⚔️</span>
              <span>Golpe Rápido</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Baseado em <strong>Agilidade</strong>. Alta precisão (+15 Fúria).</p>
          </button>

          <!-- Heavy Strike -->
          <button onclick="window.gymforge.executeBattleAction('heavy_strike')" 
                  class="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 hover:from-amber-900/60 border border-amber-500/40 text-left transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  ${!isPlayerTurn ? 'disabled' : ''}>
            <div class="flex items-center gap-2 text-sm font-bold text-amber-400 font-rpg">
              <span>🔨</span>
              <span>Pancada Pesada</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Baseado em <strong>Força</strong>. Chance crítica (+25 Fúria).</p>
          </button>

          <!-- Iron Block -->
          <button onclick="window.gymforge.executeBattleAction('iron_block')" 
                  class="p-4 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 hover:from-blue-900/60 border border-blue-500/40 text-left transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  ${!isPlayerTurn ? 'disabled' : ''}>
            <div class="flex items-center gap-2 text-sm font-bold text-blue-400 font-rpg">
              <span>🛡️</span>
              <span>Bloqueio de Ferro</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Baseado em <strong>Resistência</strong>. Reduz 65% do próximo dano.</p>
          </button>

          <!-- Forge Ultimate Special Attack -->
          <button onclick="window.gymforge.executeBattleAction('forge_ultimate')" 
                  class="p-4 rounded-2xl bg-gradient-to-b from-rose-900/80 via-red-800 to-amber-600 border-2 border-rose-400 text-left transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none ${playerFury >= 100 ? 'shadow-glow-crimson animate-pulse' : ''}"
                  ${(!isPlayerTurn || playerFury < 100) ? 'disabled' : ''}>
            <div class="flex items-center gap-2 text-sm font-black text-white font-rpg uppercase">
              <span>⚡</span>
              <span>Fúria Suprema</span>
            </div>
            <p class="text-[11px] text-rose-100 mt-1 font-semibold">Requer <strong>100% Fúria</strong>. Golpe devastador inbloqueável!</p>
          </button>

        </div>

      </div>

      <!-- COMBAT LOG TICKER -->
      <div class="p-4 rounded-2xl glass-panel border border-slate-800 text-xs font-mono space-y-1 max-h-36 overflow-y-auto">
        <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Registro dos Golpes:</span>
        ${combatLogs.map(log => `
          <div class="text-slate-300 py-0.5">• ${log}</div>
        `).join('')}
      </div>

    </div>
  `;
}

function renderBattleResultView(user) {
  const isVictory = battleWinner === 'player';
  const ratingChange = isVictory ? +25 : -15;
  const xpReward = isVictory ? 120 : 35;

  return `
    <div class="rounded-3xl glass-panel p-8 sm:p-12 border-2 ${isVictory ? 'border-amber-400/80 shadow-glow-gold' : 'border-rose-500/80 shadow-glow-crimson'} text-center space-y-6 max-w-xl mx-auto animate-level-up">
      
      <!-- Trophy or Defeat Emblem -->
      <div class="text-6xl animate-bounce">
        ${isVictory ? '🏆' : '💀'}
      </div>

      <div class="space-y-2">
        <h2 class="text-3xl sm:text-4xl font-black font-rpg uppercase tracking-wider ${isVictory ? 'text-amber-400' : 'text-rose-400'}">
          ${isVictory ? 'VITÓRIA NA ARENA!' : 'DERROTA EM COMBATE!'}
        </h2>
        <p class="text-sm text-slate-300">
          ${isVictory ? 'Você superou seu oponente com bravura e maestria marcial!' : 'O combate foi árduo. Treine seus atributos na academia para voltar mais forte!'}
        </p>
      </div>

      <!-- Rewards Summary Card -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div class="flex items-center justify-around font-mono">
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">Glória (Rating)</span>
            <span class="text-xl font-bold ${isVictory ? 'text-emerald-400' : 'text-rose-400'}">
              ${ratingChange > 0 ? `+${ratingChange}` : ratingChange} RP
            </span>
          </div>
          <div class="h-8 w-px bg-slate-800"></div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">XP Conquistado</span>
            <span class="text-xl font-bold text-amber-400">+${xpReward} XP</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button onclick="window.gymforge.startMatchmaking()" class="flex-1 py-3 px-6 rounded-xl btn-forge font-bold text-xs">
          BUSCAR NOVA BATALHA
        </button>
        <button onclick="window.gymforge.setArenaTab('ranking')" class="py-3 px-6 rounded-xl btn-secondary font-bold text-xs">
          VER CLASSIFICAÇÃO
        </button>
      </div>

    </div>
  `;
}

function renderLeaderboardSection(user) {
  const leaderboard = [
    { rank: 1, name: "Brunhilde de Ferro", class: "tita", rating: 2150, league: "Mestre da Forja", icon: "👑", wins: 84, losses: 12, streak: 7 },
    { rank: 2, name: "Leonidas do Aço", class: "guerreiro", rating: 1940, league: "Diamante", icon: "💎", wins: 65, losses: 18, streak: 4 },
    { rank: 3, name: "Kael das Sombras", class: "ladino", rating: 1780, league: "Platina", icon: "⚔️", wins: 52, losses: 21, streak: 3 },
    { rank: 4, name: "Athena Sagrada", class: "paladino", rating: 1520, league: "Ouro", icon: "🥇", wins: 38, losses: 16, streak: 2 },
    { rank: 5, name: user.nome, class: "guerreiro", rating: user.pvpRating || 1000, league: getLeagueFromRating(user.pvpRating || 1000).name, icon: "🛡️", wins: user.pvpWins || 0, losses: user.pvpLosses || 0, streak: user.pvpStreak || 0, isCurrent: true }
  ];

  return `
    <div class="rounded-3xl glass-panel p-6 border border-slate-800 space-y-6">
      
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 class="font-rpg font-bold text-xl text-slate-100 uppercase tracking-wider">Ranque de Classificação Global</h3>
          <p class="text-xs text-slate-400">Os guerreiros mais temidos do GymForge disputando a coroa da Forja.</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
          Temporada 1 • Ativa
        </span>
      </div>

      <!-- Leaderboard Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="text-slate-400 border-b border-slate-800 text-[11px]">
              <th class="py-3 px-3 text-center w-16">POSIÇÃO</th>
              <th class="py-3 px-4">GUERREIRO</th>
              <th class="py-3 px-3">LIGA</th>
              <th class="py-3 px-3 text-center">VITÓRIAS</th>
              <th class="py-3 px-3 text-center">STREAK</th>
              <th class="py-3 px-4 text-right">RATING (RP)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            ${leaderboard.map(player => `
              <tr class="transition-colors ${player.isCurrent ? 'bg-amber-950/30 border-l-4 border-amber-400' : 'hover:bg-slate-900/40'}">
                <td class="py-3.5 px-3 text-center font-black ${player.rank === 1 ? 'text-amber-400 text-base' : player.rank === 2 ? 'text-slate-300' : player.rank === 3 ? 'text-amber-600' : 'text-slate-400'}">
                  #${player.rank}
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-200 flex items-center gap-2">
                  <span>${player.isCurrent ? '⭐' : '👤'}</span>
                  <span>${player.name}</span>
                  ${player.isCurrent ? '<span class="text-[10px] text-amber-400 font-mono font-bold">(Você)</span>' : ''}
                </td>
                <td class="py-3.5 px-3">
                  <span class="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                    ${player.icon} ${player.league}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-center text-emerald-400 font-bold">${player.wins}W / ${player.losses}L</td>
                <td class="py-3.5 px-3 text-center text-orange-400 font-bold">🔥 ${player.streak}</td>
                <td class="py-3.5 px-4 text-right font-black font-rpg text-amber-400 text-sm">${player.rating} RP</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

function getLeagueFromRating(rating = 1000) {
  if (rating >= 2100) return { name: "Mestre da Forja", icon: "👑" };
  if (rating >= 1800) return { name: "Diamante", icon: "💎" };
  if (rating >= 1500) return { name: "Platina", icon: "⚔️" };
  if (rating >= 1200) return { name: "Ouro", icon: "🥇" };
  if (rating >= 1000) return { name: "Prata", icon: "🥈" };
  return { name: "Bronze", icon: "🥉" };
}

// Global Arena Handlers
window.gymforge = window.gymforge || {};

window.gymforge.setArenaTab = function(tab) {
  soundService.playClick();
  activeTab = tab;
  window.gymforge.refreshPage();
};

window.gymforge.startMatchmaking = function() {
  soundService.playClick();
  arenaState = 'matchmaking';
  window.gymforge.refreshPage();

  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();

  // Matchmake delay simulation
  setTimeout(async () => {
    try {
      const matchRes = await apiClient.request('/api/arena/matchmake', {
        method: 'POST',
        body: JSON.stringify({ userLevel: user.nivel || 1, userRating: user.pvpRating || 1000 })
      });
      currentOpponent = matchRes.opponent;
      currentMatch = matchRes.matchId;
    } catch {
      // Fallback opponent
      currentOpponent = {
        userId: 'bot_tita',
        nome: 'Thorin o Quebrador',
        nomePersonagem: 'Titã da Montanha',
        nivel: user.nivel || 1,
        classe: 'guerreiro',
        atributos: { FORCA: 15, RESISTENCIA: 14, AGILIDADE: 8, VITALIDADE: 14, DISCIPLINA: 10 },
        maxHp: 100 + (14 * 15) + ((user.nivel || 1) * 10),
        currentHp: 100 + (14 * 15) + ((user.nivel || 1) * 10),
        fury: 0,
        rating: (user.pvpRating || 1000) + 15
      };
    }

    const attrs = character.atributos || { VITALIDADE: 10 };
    playerMaxHp = 100 + (attrs.VITALIDADE * 15) + ((user.nivel || 1) * 10);
    playerHp = playerMaxHp;
    playerFury = 0;
    opponentMaxHp = currentOpponent.maxHp || 250;
    opponentHp = opponentMaxHp;
    opponentFury = 0;
    combatLogs = ["⚔️ O árbitro da arena sinaliza o início do combate! FIGHT!"];
    isPlayerTurn = true;
    isPlayerBlocking = false;
    isOpponentBlocking = false;

    soundService.playFightStart();
    arenaState = 'battle';
    window.gymforge.refreshPage();
  }, 2000);
};

window.gymforge.cancelMatchmaking = function() {
  soundService.playClick();
  arenaState = 'lobby';
  window.gymforge.refreshPage();
};

window.gymforge.executeBattleAction = function(actionType) {
  if (!isPlayerTurn) return;

  isPlayerTurn = false;
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();
  const attrs = character.atributos || { FORCA: 10, RESISTENCIA: 8, AGILIDADE: 6, VITALIDADE: 10, DISCIPLINA: 8 };

  let damage = 0;
  let isCrit = false;
  let logText = "";

  if (actionType === 'iron_block') {
    soundService.playBlock();
    isPlayerBlocking = true;
    playerFury = Math.min(100, playerFury + 20);
    logText = `🛡️ ${character.nomePersonagem} assumiu Postura Defensiva (+20% Fúria)!`;
    combatLogs.unshift(logText);
  } else {
    isPlayerBlocking = false;
    if (actionType === 'quick_strike') {
      soundService.playHit();
      damage = (attrs.FORCA * 1.4) + (attrs.AGILIDADE * 1.6) + Math.floor(Math.random() * 8);
      playerFury = Math.min(100, playerFury + 15);
      logText = `⚔️ ${character.nomePersonagem} desferiu um Golpe Rápido veloz causando ${Math.round(damage)} de dano!`;
    } else if (actionType === 'heavy_strike') {
      soundService.playHeavyHit();
      isCrit = Math.random() < 0.3;
      damage = ((attrs.FORCA * 2.8) + (user.nivel * 3)) * (isCrit ? 1.8 : 1.0);
      playerFury = Math.min(100, playerFury + 25);
      logText = isCrit 
        ? `🔥 GOLPE CRÍTICO! ${character.nomePersonagem} acertou uma Pancada Pesada devastadora causando ${Math.round(damage)} de dano!`
        : `🔨 ${character.nomePersonagem} acertou uma Pancada Pesada causando ${Math.round(damage)} de dano!`;
    } else if (actionType === 'forge_ultimate') {
      soundService.playSpecial();
      damage = (attrs.FORCA * 4.0) + (attrs.DISCIPLINA * 2.5) + 30;
      playerFury = 0;
      logText = `⚡ FÚRIA SUPREMA DA FORJA! ${character.nomePersonagem} liberou todo o seu poder causando ${Math.round(damage)} de dano explosivo!`;
    }

    if (isOpponentBlocking) {
      damage = Math.round(damage * 0.35);
      logText += " (Oponente bloqueou parte do dano!)";
      isOpponentBlocking = false;
    }

    damage = Math.max(5, Math.round(damage));
    opponentHp = Math.max(0, opponentHp - damage);
    combatLogs.unshift(logText);
    showDamageFloater(damage, isCrit);
  }

  window.gymforge.refreshPage();

  // Check victory
  if (opponentHp <= 0) {
    soundService.playKO();
    setTimeout(() => {
      endBattle('player');
    }, 1200);
    return;
  }

  // Opponent Turn AI Counter-Attack
  setTimeout(() => {
    executeOpponentTurn();
  }, 1200);
};

function executeOpponentTurn() {
  const oppAttrs = currentOpponent.atributos || { FORCA: 12, RESISTENCIA: 10, AGILIDADE: 10, VITALIDADE: 12, DISCIPLINA: 10 };
  const rand = Math.random();
  let damage = 0;
  let isCrit = false;
  let logText = "";

  if (opponentFury >= 100) {
    soundService.playSpecial();
    damage = (oppAttrs.FORCA * 3.5) + (oppAttrs.DISCIPLINA * 2.0) + 20;
    opponentFury = 0;
    logText = `⚡ ${currentOpponent.nomePersonagem} disparou seu Ataque Especial Supremo causando ${Math.round(damage)} de dano!`;
  } else if (rand < 0.25) {
    soundService.playBlock();
    isOpponentBlocking = true;
    opponentFury = Math.min(100, opponentFury + 20);
    logText = `🛡️ ${currentOpponent.nomePersonagem} ergueu seu escudo em Bloqueio!`;
  } else if (rand < 0.70) {
    soundService.playHit();
    damage = (oppAttrs.FORCA * 1.3) + (oppAttrs.AGILIDADE * 1.4) + Math.floor(Math.random() * 6);
    opponentFury = Math.min(100, opponentFury + 15);
    logText = `⚔️ ${currentOpponent.nomePersonagem} atacou rapidamente causando ${Math.round(damage)} de dano!`;
  } else {
    soundService.playHeavyHit();
    isCrit = Math.random() < 0.25;
    damage = (oppAttrs.FORCA * 2.5) * (isCrit ? 1.7 : 1.0);
    opponentFury = Math.min(100, opponentFury + 25);
    logText = isCrit 
      ? `🔥 CRÍTICO DO ADVERSÁRIO! ${currentOpponent.nomePersonagem} atingiu você em cheio causando ${Math.round(damage)} de dano!`
      : `🔨 ${currentOpponent.nomePersonagem} deferiu um golpe pesado causando ${Math.round(damage)} de dano!`;
  }

  if (isPlayerBlocking) {
    damage = Math.round(damage * 0.35);
    logText += " (Você bloqueou 65% do impacto!)";
    isPlayerBlocking = false;
  }

  damage = Math.max(5, Math.round(damage));
  playerHp = Math.max(0, playerHp - damage);
  combatLogs.unshift(logText);
  showDamageFloater(damage, isCrit);

  isPlayerTurn = true;
  window.gymforge.refreshPage();

  if (playerHp <= 0) {
    soundService.playKO();
    setTimeout(() => {
      endBattle('opponent');
    }, 1200);
  }
}

function showDamageFloater(damage, isCrit = false) {
  const floater = document.getElementById('combat-floater');
  if (!floater) return;

  const textEl = document.createElement('div');
  textEl.className = `text-2xl sm:text-3xl font-black font-rpg ${isCrit ? 'text-amber-300 scale-125' : 'text-rose-400'} animate-ping duration-700`;
  textEl.innerText = isCrit ? `-${damage} CRÍTICO!` : `-${damage}`;
  floater.appendChild(textEl);
  setTimeout(() => textEl.remove(), 700);
}

function endBattle(winner) {
  battleWinner = winner;
  arenaState = 'result';

  const user = storageService.getUserProfile();
  const isVictory = winner === 'player';

  if (isVictory) {
    soundService.playLevelUp();
    user.pvpWins = (user.pvpWins || 0) + 1;
    user.pvpStreak = (user.pvpStreak || 0) + 1;
    user.pvpRating = (user.pvpRating || 1000) + 25;
    user.xp = (user.xp || 0) + 120;
    toast.showXP(120, 'Vitória no Coliseu PVP!');
  } else {
    user.pvpLosses = (user.pvpLosses || 0) + 1;
    user.pvpStreak = 0;
    user.pvpRating = Math.max(800, (user.pvpRating || 1000) - 15);
    user.xp = (user.xp || 0) + 35;
    toast.showXP(35, 'XP de Bravura em Combate');
  }

  storageService.saveUserProfile(user);
  window.gymforge.refreshPage();
}
