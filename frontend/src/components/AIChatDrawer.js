// GymForge — AI Assistant Chat Drawer Component (Mestre da Forja)
import { apiClient } from '../services/api.js';
import { storageService } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';

class AIChatDrawer {
  constructor() {
    this.isOpen = false;
    this.messages = [
      {
        sender: 'ai',
        text: '⚔️ **Saudações, valoroso(a) Guerreiro(a)!**\n\nEu sou o **Mestre da Forja**, seu guardião e conselheiro fitness RPG. Estou pronto para analisar seus treinos, prescrever rotinas personalizadas ou tirar dúvidas sobre seus atributos.\n\nComo posso guiar sua jornada hoje?'
      }
    ];
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    soundService.playClick();
    this.render();
  }

  close() {
    this.isOpen = false;
    const drawer = document.getElementById('ai-chat-drawer-container');
    if (drawer) {
      drawer.remove();
    }
  }

  async sendMessage(userInput) {
    const text = userInput || document.getElementById('ai-chat-input')?.value;
    if (!text || !text.trim()) return;

    soundService.playClick();
    this.messages.push({ sender: 'user', text: text.trim() });
    
    // Clear input
    const inputEl = document.getElementById('ai-chat-input');
    if (inputEl) inputEl.value = '';

    this.renderMessages();

    // Show typing placeholder
    this.messages.push({ sender: 'ai', text: '⚡ _Consultando os manuscritos da Forja..._', isTyping: true });
    this.renderMessages();

    const user = storageService.getUserProfile();
    const character = storageService.getCharacter();
    const history = storageService.getWorkoutHistory();

    try {
      const response = await apiClient.askAI(text, { user, character, history });
      // Remove typing placeholder
      this.messages = this.messages.filter(m => !m.isTyping);
      this.messages.push({ sender: 'ai', text: response.response || response.text || 'O Mestre da Forja escutou seu chamado.' });
    } catch {
      this.messages = this.messages.filter(m => !m.isTyping);
      this.messages.push({
        sender: 'ai',
        text: '🛡️ *A forja está aquecida! Continue treinando com constância para colher os melhores frutos.*'
      });
    }

    this.renderMessages();
  }

  render() {
    const existing = document.getElementById('ai-chat-drawer-container');
    if (existing) existing.remove();

    const drawerHtml = `
      <div id="ai-chat-drawer-container" class="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
        
        <!-- Backdrop click to close -->
        <div class="flex-1" onclick="window.gymforge.closeAIDrawer()"></div>

        <!-- Slide-out Drawer Panel -->
        <div class="w-full max-w-lg h-full bg-forge-900 border-l border-cyan-500/30 shadow-2xl flex flex-col transform transition-transform duration-300">
          
          <!-- Header -->
          <div class="p-4 bg-forge-950 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-glow-cyan">
                <div class="w-full h-full bg-forge-950 rounded-[10px] flex items-center justify-center text-lg">
                  🤖
                </div>
              </div>
              <div>
                <h3 class="font-rpg font-bold text-base text-cyan-400">MESTRE DA FORJA (IA)</h3>
                <span class="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Conectado ao MCP & Firestore
                </span>
              </div>
            </div>

            <button onclick="window.gymforge.closeAIDrawer()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          <!-- Quick Prompt Suggestions -->
          <div class="p-3 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
            <button onclick="window.gymforge.sendAIPrompt('Sugerir um treino de Peito focado em Força')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30">
              🏋️ Treino de Peito
            </button>
            <button onclick="window.gymforge.sendAIPrompt('Como devo distribuir meus pontos de atributos?')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30">
              🧙‍♂️ Atributos RPG
            </button>
            <button onclick="window.gymforge.sendAIPrompt('Analise minha evolução e streak')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30">
              📊 Análise de Progresso
            </button>
            <button onclick="window.gymforge.sendAIPrompt('O que é sobrecarga progressiva?')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30">
              ⚡ Sobrecarga Progressiva
            </button>
          </div>

          <!-- Messages Area -->
          <div id="ai-messages-list" class="flex-1 p-4 overflow-y-auto space-y-4 text-sm"></div>

          <!-- Input Area -->
          <div class="p-4 bg-forge-950 border-t border-slate-800">
            <form onsubmit="event.preventDefault(); window.gymforge.sendAIMessage();" class="flex gap-2">
              <input id="ai-chat-input" type="text" placeholder="Pergunte ao Mestre da Forja..." class="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm" autocomplete="off" />
              <button type="submit" class="px-5 py-2.5 rounded-xl btn-cyan font-bold text-sm flex items-center gap-1">
                <span>Enviar</span>
                <span>⚡</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = drawerHtml;
    document.body.appendChild(container.firstElementChild);

    this.renderMessages();
  }

  renderMessages() {
    const listEl = document.getElementById('ai-messages-list');
    if (!listEl) return;

    listEl.innerHTML = this.messages.map(msg => {
      const isUser = msg.sender === 'user';
      return `
        <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[85%] p-3.5 rounded-2xl ${
            isUser 
              ? 'bg-amber-600 text-forge-950 font-medium rounded-tr-none' 
              : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none prose prose-invert prose-sm'
          }">
            ${this.formatMarkdown(msg.text)}
          </div>
        </div>
      `;
    }).join('');

    listEl.scrollTop = listEl.scrollHeight;
  }

  formatMarkdown(text = '') {
    // Basic Markdown converter for lists, bold, italics, titles
    let formatted = text
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-amber-400 mt-2 mb-1 text-xs uppercase tracking-wider">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<span class="text-slate-400 italic">$1</span>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n- (.*?)/g, '<li class="ml-4 list-disc">$1</li>');
    return formatted;
  }
}

export const aiChatDrawer = new AIChatDrawer();
