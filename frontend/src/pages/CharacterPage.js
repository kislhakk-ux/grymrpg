// GymForge — Character Evolution & Customization Page
import { renderCharacterAvatar } from '../components/CharacterAvatar.js';
import { ATTRIBUTE_CONFIG, ARCHETYPES, getXPProgress } from '../utils/rpgCalculator.js';
import { storageService } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';
import { toast } from '../components/Toast.js';

let pendingAttrs = null;
let pendingPoints = null;

export function renderCharacterPage() {
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();
  const xpInfo = getXPProgress(user.xp);

  // Initialize pending state for point distribution if not already set
  if (pendingAttrs === null) {
    pendingAttrs = { ...(character.atributos || { FORCA: 10, RESISTENCIA: 8, AGILIDADE: 6, VITALIDADE: 10, DISCIPLINA: 8 }) };
    pendingPoints = user.pontosAtributoDisponiveis || 0;
  }

  const currentArchetype = ARCHETYPES.find(a => a.id === character.classe) || ARCHETYPES[0];

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono mb-1">
            <span>🧙‍♂️</span>
            <span>FORJA DO HERÓI</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Evolução de Personagem</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Distribua seus pontos de atributos e personalize a aparência de seu avatar.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-4 py-2 rounded-2xl bg-slate-900 border border-amber-500/40 text-center">
            <span class="text-[10px] font-mono text-slate-400 block uppercase">Nível Atual</span>
            <span class="text-xl font-bold font-rpg text-amber-400">${xpInfo.level}</span>
          </div>
          <div class="px-4 py-2 rounded-2xl ${pendingPoints > 0 ? 'bg-rose-950/40 border-rose-500/60 shadow-glow-crimson animate-pulse' : 'bg-slate-900 border-slate-800'} border text-center">
            <span class="text-[10px] font-mono text-slate-400 block uppercase">Pontos Livres</span>
            <span class="text-xl font-bold font-rpg ${pendingPoints > 0 ? 'text-rose-400' : 'text-slate-300'}">+${pendingPoints}</span>
          </div>
        </div>
      </div>

      <!-- Main Layout: Avatar Studio (Left) + Attribute Allocator & Customizer (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Avatar Preview Card (Left 5 Cols) -->
        <div class="lg:col-span-5 rounded-3xl glass-panel p-6 border border-amber-500/30 shadow-glow-gold flex flex-col items-center text-center space-y-4">
          
          <div class="w-full flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <span>VISUALIZAÇÃO EM TEMPO REAL</span>
            <span class="text-amber-400">${currentArchetype.name}</span>
          </div>

          <!-- Dynamic Avatar Render -->
          <div id="character-avatar-container" class="py-4">
            ${renderCharacterAvatar({ ...character, atributos: pendingAttrs }, user, { size: 240, showAura: true, interactive: true })}
          </div>

          <!-- Hero Name & Class Tag -->
          <div class="w-full space-y-1">
            <h2 class="text-2xl font-black font-rpg text-amber-400">${character.nomePersonagem}</h2>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
              <span>${currentArchetype.icon}</span>
              <span>${currentArchetype.name}</span>
            </div>
          </div>

          <!-- Archetype Switcher Carousel -->
          <div class="w-full pt-2 border-t border-slate-800/80">
            <label class="text-[11px] font-mono text-slate-400 block mb-2 uppercase text-left">Escolha seu Arquétipo:</label>
            <div class="grid grid-cols-2 gap-2">
              ${ARCHETYPES.map(arch => `
                <button onclick="window.gymforge.selectArchetype('${arch.id}')" 
                        class="p-2.5 rounded-xl border text-left transition-all ${
                          character.classe === arch.id 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-gold' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }">
                  <div class="flex items-center gap-1.5 text-xs font-bold font-rpg">
                    <span>${arch.icon}</span>
                    <span class="truncate">${arch.name.split(' ')[0]}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block mt-0.5 truncate">${arch.primaryAttr}</span>
                </button>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Attribute Allocator & Customization Tabs (Right 7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Attribute Points Allocator Card -->
          <div class="rounded-3xl glass-panel p-6 border border-slate-800 space-y-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 class="font-rpg font-bold text-lg text-slate-100 uppercase tracking-wider">Distribuição de Atributos</h3>
                <p class="text-xs text-slate-400">Aumente seus atributos para melhorar seu poder e desbloquear melhorias visuais.</p>
              </div>

              ${pendingPoints > 0 ? `
                <span class="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs font-mono animate-pulse">
                  ${pendingPoints} PONTOS DISPONÍVEIS
                </span>
              ` : ''}
            </div>

            <!-- Attribute Sliders / Controls -->
            <div class="space-y-4">
              ${Object.entries(pendingAttrs).map(([key, val]) => {
                const cfg = ATTRIBUTE_CONFIG[key] || { name: key, color: '#f59e0b', icon: '⚡', description: '' };
                const originalVal = (character.atributos && character.atributos[key]) || 10;
                const pointsAdded = val - originalVal;

                return `
                  <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">${cfg.icon}</span>
                        <h4 class="font-bold text-sm text-slate-200">${cfg.name} (${cfg.abbr})</h4>
                        ${pointsAdded > 0 ? `
                          <span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
                            +${pointsAdded}
                          </span>
                        ` : ''}
                      </div>
                      <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">${cfg.description}</p>
                    </div>

                    <!-- Counter Controls -->
                    <div class="flex items-center gap-3 self-end sm:self-center">
                      <button onclick="window.gymforge.decrementAttr('${key}')" 
                              class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              ${val <= originalVal ? 'disabled' : ''}>
                        -
                      </button>

                      <span class="w-8 text-center font-mono font-bold text-base" style="color: ${cfg.color};">
                        ${val}
                      </span>

                      <button onclick="window.gymforge.incrementAttr('${key}')" 
                              class="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-forge-950 font-bold flex items-center justify-center shadow-glow-gold disabled:opacity-30 disabled:cursor-not-allowed"
                              ${pendingPoints <= 0 ? 'disabled' : ''}>
                        +
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Save / Reset Controls -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button onclick="window.gymforge.resetAttrDistribution()" class="py-2.5 px-4 rounded-xl btn-secondary text-xs font-semibold">
                Restaurar
              </button>
              <button onclick="window.gymforge.saveAttrDistribution()" class="py-2.5 px-6 rounded-xl btn-forge text-xs font-bold shadow-glow-gold">
                Salvar Atributos
              </button>
            </div>
          </div>

          <!-- Appearance Customizer Card -->
          <div class="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
            <h3 class="font-rpg font-bold text-lg text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
              Customização Cosmética
            </h3>

            <!-- Skin Color Selector -->
            <div>
              <label class="text-xs font-mono text-slate-400 block mb-2 uppercase">Tom de Pele:</label>
              <div class="flex items-center gap-2">
                ${['#f5d0b0', '#e0ac69', '#c68642', '#8d5524', '#3c2005'].map(tone => `
                  <button onclick="window.gymforge.setCosmetic('pele', '${tone}')" 
                          class="w-8 h-8 rounded-full border-2 transition-transform ${
                            character.customizacaoVisual?.pele === tone ? 'border-amber-400 scale-110 shadow-glow-gold' : 'border-slate-700'
                          }" style="background: ${tone};">
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Hair Color Selector -->
            <div>
              <label class="text-xs font-mono text-slate-400 block mb-2 uppercase">Cor do Cabelo:</label>
              <div class="flex items-center gap-2">
                ${['#1e293b', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#e2e8f0'].map(hair => `
                  <button onclick="window.gymforge.setCosmetic('corCabelo', '${hair}')" 
                          class="w-8 h-8 rounded-full border-2 transition-transform ${
                            character.customizacaoVisual?.corCabelo === hair ? 'border-amber-400 scale-110 shadow-glow-gold' : 'border-slate-700'
                          }" style="background: ${hair};">
                  </button>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
}

// Global Handlers for Character Page
window.gymforge = window.gymforge || {};

window.gymforge.incrementAttr = function(key) {
  if (pendingPoints <= 0) return;
  soundService.playClick();
  pendingAttrs[key] = (pendingAttrs[key] || 10) + 1;
  pendingPoints--;
  window.gymforge.refreshPage();
};

window.gymforge.decrementAttr = function(key) {
  const character = storageService.getCharacter();
  const original = (character.atributos && character.atributos[key]) || 10;
  if (pendingAttrs[key] <= original) return;

  soundService.playClick();
  pendingAttrs[key]--;
  pendingPoints++;
  window.gymforge.refreshPage();
};

window.gymforge.resetAttrDistribution = function() {
  soundService.playClick();
  pendingAttrs = null;
  pendingPoints = null;
  window.gymforge.refreshPage();
};

window.gymforge.saveAttrDistribution = function() {
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();

  character.atributos = { ...pendingAttrs };
  user.pontosAtributoDisponiveis = pendingPoints;

  storageService.saveCharacter(character);
  storageService.saveUserProfile(user);

  soundService.playEquip();
  toast.show({
    title: '✨ Atributos Forjados!',
    message: 'Seus novos atributos foram salvos com sucesso.',
    type: 'success',
    icon: '⚔️'
  });

  pendingAttrs = null;
  pendingPoints = null;
  window.gymforge.refreshPage();
};

window.gymforge.selectArchetype = function(archetypeId) {
  const character = storageService.getCharacter();
  character.classe = archetypeId;
  storageService.saveCharacter(character);
  soundService.playEquip();
  toast.show({
    title: '🛡️ Arquétipo Alterado',
    message: `Classe alterada para ${archetypeId.toUpperCase()}`,
    type: 'info',
    icon: '✨'
  });
  window.gymforge.refreshPage();
};

window.gymforge.setCosmetic = function(key, val) {
  const character = storageService.getCharacter();
  if (!character.customizacaoVisual) character.customizacaoVisual = {};
  character.customizacaoVisual[key] = val;
  storageService.saveCharacter(character);
  soundService.playClick();
  window.gymforge.refreshPage();
};
