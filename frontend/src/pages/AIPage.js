// GymForge — AI Assistant Hub Page (Mestre da Forja)
import { apiClient } from '../services/api.js';
import { storageService } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';

export function renderAIPage() {
  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();

  return `
    <div class="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono mb-1">
            <span>🤖</span>
            <span>INTELIGÊNCIA ARTIFICIAL & MCP</span>
          </div>
          <h1 class="text-3xl font-black font-rpg text-slate-100">Mestre da Forja (IA)</h1>
          <p class="text-slate-400 text-xs sm:text-sm">Seu mentor RPG e estrategista físico conectado aos seus dados reais no Firestore.</p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>MCP Protocol Ativo</span>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <span class="text-2xl">🏋️</span>
          <h3 class="font-rpg font-bold text-sm text-slate-100">Adaptação de Treinos</h3>
          <p class="text-xs text-slate-400">Sugestões de exercícios e volumes sob medida para seu nível de Força e Resistência.</p>
        </div>

        <div class="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <span class="text-2xl">🧙‍♂️</span>
          <h3 class="font-rpg font-bold text-sm text-slate-100">Consultoria de Atributos</h3>
          <p class="text-xs text-slate-400">Recomendações estratégicas para alocar pontos em Força, Vitalidade ou Disciplina.</p>
        </div>

        <div class="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <span class="text-2xl">📊</span>
          <h3 class="font-rpg font-bold text-sm text-slate-100">Análise de Sobrecarga</h3>
          <p class="text-xs text-slate-400">Verificação de recordes pessoais (PRs) e consistência na sequência de treinos (Streak).</p>
        </div>

      </div>

      <!-- Main Chat Interface Container -->
      <div class="rounded-3xl glass-panel border border-cyan-500/30 shadow-glow-cyan overflow-hidden flex flex-col h-[520px]">
        
        <!-- Chat Header -->
        <div class="p-4 bg-forge-950 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan">
              <div class="w-full h-full bg-forge-950 rounded-[10px] flex items-center justify-center text-lg">
                🤖
              </div>
            </div>
            <div>
              <h3 class="font-rpg font-bold text-sm text-cyan-300">ORÁCULO DA FORJA</h3>
              <span class="text-[11px] font-mono text-slate-400">Contexto: ${user.nome} • Nível ${user.nivel || 1} • ${character.classe}</span>
            </div>
          </div>

          <div class="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>⚡ Modelo:</span>
            <strong class="text-cyan-400">Gemini Pro / Flash</strong>
          </div>
        </div>

        <!-- Messages Flow -->
        <div id="ai-page-messages-list" class="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
          <div class="flex justify-start">
            <div class="max-w-[85%] p-4 rounded-2xl bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none prose prose-invert prose-sm">
              ⚔️ <strong>Saudações, Guerreiro(a)!</strong><br/><br/>
              Estou pronto para analisar seus registros ou planejar sua próxima vitória. Escolha uma das sugestões abaixo ou digite sua pergunta:
            </div>
          </div>
        </div>

        <!-- Quick Prompts Toolbar -->
        <div class="px-4 py-2 bg-slate-950/70 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
          <button onclick="window.gymforge.sendPageAIPrompt('Prescreva um treino avançado de Pernas com foco em Força')" class="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30">
            🦵 Treino de Pernas
          </button>
          <button onclick="window.gymforge.sendPageAIPrompt('Analise meus atributos e me diga em que focar')" class="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30">
            🧙‍♂️ Consultar Atributos
          </button>
          <button onclick="window.gymforge.sendPageAIPrompt('Como posso aumentar minha carga no supino com segurança?')" class="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30">
            ⚔️ Sobrecarga de Supino
          </button>
        </div>

        <!-- Chat Input Form -->
        <div class="p-4 bg-forge-950 border-t border-slate-800">
          <form onsubmit="event.preventDefault(); window.gymforge.sendPageAIMessage();" class="flex gap-2">
            <input id="ai-page-chat-input" type="text" placeholder="Pergunte sobre treinos, biomecânica, atributos..." class="flex-1 px-4 py-3 rounded-xl glass-input text-sm" autocomplete="off" />
            <button type="submit" class="px-6 py-3 rounded-xl btn-cyan font-bold text-sm flex items-center gap-2">
              <span>Perguntar</span>
              <span>⚡</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  `;
}

// Global AI Page Handlers
window.gymforge = window.gymforge || {};

window.gymforge.sendPageAIPrompt = function(text) {
  const input = document.getElementById('ai-page-chat-input');
  if (input) input.value = text;
  window.gymforge.sendPageAIMessage();
};

window.gymforge.sendPageAIMessage = async function() {
  const input = document.getElementById('ai-page-chat-input');
  const text = input ? input.value : '';
  if (!text || !text.trim()) return;

  const messagesList = document.getElementById('ai-page-messages-list');
  if (!messagesList) return;

  soundService.playClick();

  // Append user bubble
  messagesList.innerHTML += `
    <div class="flex justify-end">
      <div class="max-w-[85%] p-3.5 rounded-2xl bg-amber-600 text-forge-950 font-semibold rounded-tr-none">
        ${text}
      </div>
    </div>
  `;

  input.value = '';
  messagesList.scrollTop = messagesList.scrollHeight;

  // Placeholder
  const typingId = `typing_${Date.now()}`;
  messagesList.innerHTML += `
    <div id="${typingId}" class="flex justify-start">
      <div class="max-w-[85%] p-3.5 rounded-2xl bg-slate-800/90 text-cyan-300 italic rounded-tl-none animate-pulse">
        ⚡ O Mestre da Forja está elaborando a resposta...
      </div>
    </div>
  `;
  messagesList.scrollTop = messagesList.scrollHeight;

  const user = storageService.getUserProfile();
  const character = storageService.getCharacter();
  const history = storageService.getWorkoutHistory();

  try {
    const res = await apiClient.askAI(text, { user, character, history });
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const formatted = (res.response || res.text || 'O oráculo foi consultado.')
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-amber-400 mt-2 mb-1 text-xs uppercase tracking-wider">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300 font-bold">$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n- (.*?)/g, '<li class="ml-4 list-disc">$1</li>');

    messagesList.innerHTML += `
      <div class="flex justify-start">
        <div class="max-w-[85%] p-4 rounded-2xl bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none prose prose-invert prose-sm">
          ${formatted}
        </div>
      </div>
    `;
  } catch {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    messagesList.innerHTML += `
      <div class="flex justify-start">
        <div class="max-w-[85%] p-4 rounded-2xl bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none">
          🛡️ <em>Continue firme em sua jornada! A disciplina diária é o maior poder de um herói.</em>
        </div>
      </div>
    `;
  }

  messagesList.scrollTop = messagesList.scrollHeight;
};
