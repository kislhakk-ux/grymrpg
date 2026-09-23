// GymForge — API Client Service
import { auth, isFirebaseConfigured } from './firebase.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.warn('Não foi possível obter o ID Token do Firebase:', err);
      }
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      // In local dev without backend active, log gracefully
      console.warn(`[API] Requisição para ${endpoint} falhou (${err.message}). Utilizando processamento local/offline.`);
      throw err;
    }
  }

  // AI & MCP Endpoints
  async askAI(prompt, context = {}) {
    try {
      return await this.request('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, context })
      });
    } catch {
      // Fallback local intelligent response generator
      return this.generateFallbackAIResponse(prompt, context);
    }
  }

  async getMCPTools() {
    try {
      return await this.request('/api/mcp/tools');
    } catch {
      return {
        tools: [
          'get_user_profile',
          'get_character',
          'get_attributes',
          'get_workout_history',
          'get_available_workouts',
          'get_user_missions',
          'calculate_progress'
        ]
      };
    }
  }

  // Fallback AI simulation for offline testing
  generateFallbackAIResponse(prompt, context = {}) {
    const lower = prompt.toLowerCase();
    const user = context.user || {};
    const char = context.character || {};

    if (lower.includes('treino') || lower.includes('peito') || lower.includes('costas') || lower.includes('perna')) {
      return {
        response: `⚔️ **Saudações, nobre Guerreiro(a)!**\n\nCom base no seu nível atual (**Nível ${user.nivel || 1}**) e no atributo de **Força (${char.atributos?.FORCA || 10})**, recomendo focar na execução correta e na **sobrecarga progressiva**.\n\n### 🛡️ Sugestão da Forja:\n1. **Aquecimento**: 5-10 min de mobilidade articular.\n2. **Exercício Principal**: 4 séries de 8-10 repetições com carga desafiadora.\n3. **Isoladores**: 3 séries de 12 repetições focando em contração máxima.\n4. **Descanso**: 60 a 90 segundos entre as séries para recuperar sua estamina!\n\nLembre-se: a consistência é a melhor forja para o corpo!`
      };
    }

    if (lower.includes('atributo') || lower.includes('força') || lower.includes('vitalidade') || lower.includes('pontos')) {
      return {
        response: `🛡️ **Oráculo dos Atributos:**\n\nVocê possui **${user.pontosAtributoDisponiveis || 0} pontos de atributo** disponíveis para distribuir!\n\n- **⚔️ Força**: Aumenta sua capacidade de carga máxima.\n- **🛡️ Resistência**: Permite suportar treinos longos e mais repetições.\n- **⚡ Agilidade**: Melhora a velocidade de execução e resposta rápida.\n- **❤️ Vitalidade**: Acelera a recuperação e stamina.\n- **🔥 Disciplina**: Concede bônus de streak e foco nos treinos diários.\n\nAcesse a aba **Personagem** para distribuir seus pontos!`
      };
    }

    if (lower.includes('progresso') || lower.includes('evolução') || lower.includes('streak') || lower.includes('histórico')) {
      return {
        response: `🔥 **Análise do Mestre da Forja:**\n\nSua chama de treino está viva com **${user.streakAtual || 1} dias de sequência**!\n\nVocê já acumulou **${user.xp || 0} XP**. Cada repetição conta para forjar sua melhor versão. Mantenha o ritmo para desbloquear novas conquistas e missões épicas!`
      };
    }

    return {
      response: `⚡ **Palavras do Mestre da Forja:**\n\n"O ferro se molda pelo fogo e pelo martelo; o guerreiro se molda pela disciplina e repetição."\n\nPosso te ajudar com:\n- 🏋️ **Sugestões de Treinos** para Peito, Costas, Pernas ou Corpo Inteiro\n- 🧙‍♂️ **Distribuição de Atributos** para seu personagem\n- 📊 **Análise de Evolução** e sobrecarga de cargas\n- 📜 **Dicas para Missões e Conquistas**\n\nO que deseja forjar hoje?`
    };
  }
}

export const apiClient = new ApiClient();
