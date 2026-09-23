# ACADEMIA RPG (GYMFORGE) — DOCUMENTO DIRETOR ARQUITETURAL

> **Versão**: 1.0.0  
> **Status**: Em Produção / Desenvolvimento Ativo  
> **Arquitetura**: Jamstack PWA (Netlify) + REST API Python (PythonAnywhere) + Firebase Auth / Firestore + MCP + IA  

---

## 1. VISÃO GERAL DO PROJETO

O **GymForge (Academia RPG)** é um aplicativo fitness gamificado, moderno e 100% online, projetado para transformar a rotina de exercícios em uma jornada de RPG (Role-Playing Game). O usuário evolui seu personagem no jogo conforme treina no mundo real, ganhando XP, subindo de nível, distribuindo pontos de atributos (Força, Resistência, Agilidade, Vitalidade, Disciplina), duelando em uma **Arena de Batalha PVP** estilo jogo de luta com matchmaking sincronizado e ranque de classificação, completando missões diárias, desbloqueando conquistas, mantendo streaks e interagindo com um assistente inteligente ("Mestre da Forja") alimentado por IA e MCP (Model Context Protocol).

---

## 2. ARQUITETURA GERAL DO SISTEMA

```text
                                USUÁRIO
                                   │
                                   ▼
                   PROGRESSIVE WEB APP (PWA / SPA)
                      (HTML5 + Tailwind CSS + Vanilla JS)
                                   │
                                   ▼
                            NETLIFY HOSTING
                      (Deploy Contínuo via GitHub)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
     FIREBASE AUTHENTICATION                   API REST PYTHON (FastAPI)
         (Google Login)                        (Hospedado no PythonAnywhere)
              │                                         │
              │                                         ▼
              │                                 REGRAS DE NEGÓCIO
              │                           (Validação XP, Níveis, Streaks)
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                            CLOUD FIRESTORE
                      (Banco de Dados NoSQL em Nuvem)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
       SISTEMAS DE RPG                           IA + MCP TOOLS
   (Personagem, Atributos,                  (Mestre da Forja, Análise de
    Treinos, Missões, Conquistas)            Progresso, RAG Estruturado)
```

---

## 3. COMPONENTES E TECNOLOGIAS

| Camada | Tecnologia | Função Principal |
| :--- | :--- | :--- |
| **Front-End PWA** | Vanilla JS (ES Modules) + Tailwind CSS + Vite | Interface ultra-responsiva, SPA, funcionamento offline, PWA instalável |
| **Hospedagem Front** | Netlify | Deploy contínuo via GitHub, redirecionamento de rotas SPA (`/* -> /index.html 200`), SSL/HTTPS automático |
| **Autenticação** | Firebase Authentication | Login seguro com Google, emissão de tokens JWT para o backend |
| **Banco de Dados** | Google Cloud Firestore | Persistência NoSQL em tempo real, multi-usuário, regras de segurança |
| **Backend API** | Python 3.10+ / FastAPI | Validação de regras de negócio, motor de cálculo de XP/Níveis, sanitização de requisições |
| **Hospedagem Back** | PythonAnywhere | Execução da API Python com suporte WSGI/ASGI |
| **Inteligência Artificial** | Google Gemini API + Prompts Markdown | Assistente virtual, análise de treino e motivação contextualizada |
| **Protocolo MCP** | Model Context Protocol | Exposição padronizada de ferramentas do sistema para a IA com isolamento de usuário |
| **RAG** | Estruturado (Firestore) + Semântico | Recuperação de dados reais do usuário e base de conhecimento fitness |

---

## 4. ESTRUTURA DE DIRETÓRIOS

```text
GymForge/
├── GEMINI.md                     # Documento diretor arquitetural do projeto
├── README.md                     # Documentação para desenvolvedores e guia de deploy
├── .gitignore                    # Arquivos ignorados no versionamento
├── .env.example                  # Variáveis de ambiente modelo
├── netlify.toml                  # Configuração de build, SPA redirects e headers no Netlify
├── firestore.rules               # Regras de segurança do Cloud Firestore
│
├── frontend/                     # Progressive Web App
│   ├── index.html                # Entrypoint SPA
│   ├── manifest.webmanifest      # Manifesto PWA com ícones e cores
│   ├── sw.js                     # Service Worker PWA (cache & offline support)
│   ├── package.json              # Dependências e scripts de build
│   ├── tailwind.config.js        # Design System RPG Dark Slate & Neon
│   ├── vite.config.js            # Build bundle estático
│   ├── public/                   # Favicons, ícones, assets
│   └── src/
│       ├── main.js               # Router SPA & inicializador
│       ├── styles/main.css       # Tailwind + estilos RPG (HUD, Neon, Glass)
│       ├── auth/authService.js   # Autenticação Firebase & Guest Mode
│       ├── components/           # Componentes UI (Navbar, Modais, Avatar, Timers)
│       ├── pages/                # Telas (Dashboard, Character, Workouts, History, Quests, AI)
│       ├── services/             # API Client, Firebase Client, Sound FX
│       └── utils/                # Fórmulas de XP, formatação e validadores
│
├── backend/                      # API Python FastAPI
│   ├── app.py                    # Servidor FastAPI principal
│   ├── wsgi.py                   # Adaptador WSGI para PythonAnywhere
│   ├── requirements.txt          # Dependências Python
│   ├── config.py                 # Configurações de ambiente & CORS
│   ├── routes/                   # Endpoints REST (auth, character, workouts, missions, ai, mcp)
│   ├── services/                 # Lógica de cálculo (XP, Níveis, Atributos, Streaks, IA)
│   ├── models/                   # Schemas Pydantic
│   ├── middleware/               # Validação de JWT Firebase & CORS
│   ├── database/                 # Conexão Firestore Admin SDK com fallback Mock
│   └── mcp/                      # Servidor de ferramentas Model Context Protocol
│
└── prompts/                      # Prompts da IA em Markdown
    ├── system.md                 # Persona do Mestre da Forja
    ├── workout_assistant.md      # Prescrição e adaptação de treinos
    ├── progress_analysis.md      # Análise de evolução e métricas de desempenho
    └── character_assistant.md    # Dicas de progressão de atributos e classes
```

---

## 5. MODELO DE DADOS (CLOUD FIRESTORE)

### 5.1. Coleções Principais

1. **`users`**
   - `userId` (string, Firebase UID): Chave primária
   - `nome` (string): Nome do usuário
   - `email` (string): E-mail da conta
   - `foto` (string): URL do avatar do Google
   - `dataCriacao` (timestamp): Data de criação
   - `ultimoLogin` (timestamp): Último acesso
   - `nivel` (int): Nível atual (ex: 1)
   - `xp` (int): XP total acumulado (ex: 350)
   - `pontosAtributoDisponiveis` (int): Pontos não distribuídos (ex: 3)
   - `streakAtual` (int): Dias consecutivos treinando (ex: 7)
   - `maiorStreak` (int): Recorde de sequência (ex: 14)
   - `ultimoTreinoData` (string YYYY-MM-DD): Data do último treino concluído

2. **`characters`** (Subdocumento ou coleção vinculada)
   - `userId` (string)
   - `nomePersonagem` (string)
   - `classe` (string: "Guerreiro de Ferro", "Titã da Força", "Ladino Ágil", "Paladino da Resistência")
   - `atributos` (map):
     - `FORCA` (int): Nível de Força (influencia volume de peso)
     - `RESISTENCIA` (int): Nível de Resistência (influencia repetições e cardio)
     - `AGILIDADE` (int): Nível de Agilidade (influencia velocidade e agilidade)
     - `VITALIDADE` (int): Nível de Vitalidade (influencia tempo de descanso e recuperação)
     - `DISCIPLINA` (int): Nível de Disciplina (influencia bônus de streak e consistência)
   - `customizacaoVisual` (map):
     - `genero` (string: "masculino", "feminino", "neutro")
     - `pele` (string: hex/id)
     - `cabelo` (string: id)
     - `corCabelo` (string: hex)
     - `camiseta` (string: id)
     - `calca` (string: id)
     - `tenis` (string: id)
     - `acessorio` (string: id)
     - `aura` (string: id)

3. **`workouts` & `workout_templates`**
   - `id` (string)
   - `nome` (string, ex: "Treino A — Peito e Tríceps")
   - `categoria` (string: "Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio", "Corpo Inteiro")
   - `exercicios` (array de maps):
     - `idExercicio` (string)
     - `nome` (string)
     - `series` (int)
     - `repeticoes` (int)
     - `descansoSegundos` (int)
     - `grupoMuscular` (string)
     - `instrucoes` (string)

4. **`workout_records` (Histórico de Treinos)**
   - `id` (string)
   - `userId` (string)
   - `workoutId` (string)
   - `nomeTreino` (string)
   - `data` (timestamp / ISO)
   - `duracaoMinutos` (int)
   - `volumeTotalKg` (float)
   - `totalSeries` (int)
   - `totalRepeticoes` (int)
   - `xpGanho` (int)
   - `detalhesExercicios` (array de maps com pesos, reps e séries realizadas)

5. **`missions` & `user_missions`**
   - `id` (string)
   - `titulo` (string, ex: "Forja de Titãs")
   - `descricao` (string, ex: "Conclua 3 treinos de membros superiores esta semana")
   - `tipo` (string: "diaria", "semanal", "epica")
   - `progressoAtual` (int)
   - `meta` (int)
   - `recompensaXP` (int)
   - `concluida` (bool)
   - `reivindicada` (bool)

6. **`achievements` & `user_achievements`**
   - `id` (string, ex: "primeiro_treino", "streak_7", "nivel_10")
   - `titulo` (string)
   - `descricao` (string)
   - `icone` (string)
   - `recompensaXP` (int)
   - `desbloqueada` (bool)
   - `dataDesbloqueio` (timestamp)

---

## 6. REGRAS DE NEGÓCIO E FÓRMULAS DE RPG

### 6.1. Fórmula de Nível e XP

A curva de experiência necessária para alcançar o nível $N$ é calculada por:
$$\text{XP Necessário para o Nível } N = \lfloor 100 \times N^{1.5} \rfloor$$

Ao subir de nível:
- O nível do usuário é incrementado ($N \leftarrow N + 1$).
- O usuário recebe $+3$ Pontos de Atributo para distribuição livre.
- O sistema dispara uma notificação e animação de celebração com sintetizador sonoro Web Audio API.

### 6.2. Recompensas de XP

- **Exercício Realizado**: $+10\text{ XP}$ por exercício com séries completas
- **Treino Concluído**: $+50\text{ XP}$ base $+ 1\text{ XP}$ a cada $100\text{ kg}$ de volume levantado
- **Bônus de Streak Diário**: $+15\text{ XP} \times \min(\text{dias consecutivas}, 7)$
- **Missão Diária**: $+100\text{ XP}$ a $+250\text{ XP}$
- **Missão Semanal**: $+300\text{ XP}$ a $+600\text{ XP}$
- **Conquista Desbloqueada**: $+200\text{ XP}$ a $+1000\text{ XP}$

### 6.3. Distribuição e Impacto dos Atributos

1. **FORÇA (FOR)**: Aumenta o dano do avatar em desafios e desbloqueia definição muscular no renderizador visual.
2. **RESISTÊNCIA (RES)**: Aumenta a tolerância a volume de treino e desbloqueia armaduras de maior nível.
3. **AGILIDADE (AGI)**: Reduz o tempo de fadiga e desbloqueia efeitos de velocidade visual (auras dinâmicas).
4. **VITALIDADE (VIT)**: Aumenta a velocidade de recuperação e stamina visual do avatar.
5. **DISCIPLINA (DIS)**: Concede multiplicador de proteção de streak contra dias perdidos.

---

## 7. PROTOCOLO MCP (MODEL CONTEXT PROTOCOL)

A API REST Python implementa endpoints MCP em `/api/mcp/tools` e `/api/mcp/execute`. A IA utiliza estas ferramentas com autorização estrita (UID do usuário extraído do token autenticado):

1. `get_user_profile(user_id)`: Retorna nível, XP atual, próximo nível e streak.
2. `get_character(user_id)`: Retorna classe, atributos e cosméticos equipados.
3. `get_attributes(user_id)`: Retorna valores detalhados de Força, Resistência, Agilidade, Vitalidade e Disciplina.
4. `get_workout_history(user_id, limit)`: Retorna os últimos treinos com volume, duração e exercícios.
5. `get_exercise_history(user_id, exercise_name)`: Retorna histórico de cargas e repetições para sugerir sobrecarga progressiva.
6. `get_available_workouts()`: Retorna catálogo de fichas de treino por grupo muscular.
7. `get_user_missions(user_id)`: Retorna missões ativas e progresso.
8. `calculate_progress(user_id)`: Calcula métricas agregadas de volume levantado, frequência e consistência.

---

## 8. DIRETRIZES DE SEGURANÇA

1. **Nunca Confiar no Front-End**:
   - O front-end envia a lista de exercícios e repetições executadas; o backend Python recalcula o XP legítimo e atualiza o Firestore de forma atômica.
   - A distribuição de atributos é validada no backend: a soma de novos pontos não pode exceder `pontosAtributoDisponiveis`.
2. **CORS & Autenticação**:
   - Todas as requisições autenticadas requerem cabeçalho `Authorization: Bearer <Firebase_ID_Token>`.
   - O CORS é restrito aos domínios do Netlify em produção e ao `localhost` durante o desenvolvimento.
3. **Regras do Firestore (`firestore.rules`)**:
   - Um usuário só pode ler e escrever em documentos cujo `userId == request.auth.uid`.

---

## 9. FLUXO DE DEPLOY E HOSPEDAGEM

### 9.1. Front-End (Netlify + GitHub)
1. Repositório no GitHub conectado ao Netlify.
2. Comando de Build: `cd frontend && npm install && npm run build`.
3. Diretório de Publicação: `frontend/dist`.
4. Arquivo `netlify.toml` gerencia redirects para SPA (`/* -> /index.html 200`).

### 9.2. Back-End (PythonAnywhere)
1. Criação do Web App tipo Manual / FastAPI / Flask com WSGI.
2. Instalação das dependências via `pip install -r backend/requirements.txt`.
3. Configuração do `wsgi.py` apontando para `backend.app:app`.
4. Configuração das variáveis de ambiente no painel do PythonAnywhere.
