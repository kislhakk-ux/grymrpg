# ⚔️ GymForge — Academia RPG 🛡️

> **Aplicativo Fitness Gamificado Online**  
> Transforme sua rotina de musculação e condicionamento físico em uma jornada épica de RPG. Evolua seu personagem, ganhe XP, distribua atributos, cumpra missões diárias, desbloqueie conquistas e conte com a mentoria do **Mestre da Forja (IA com MCP & RAG)**.

---

## 🌟 Funcionalidades Principais

- 📱 **Progressive Web App (PWA)**: Instalável no celular, tablet ou desktop com funcionamento offline.
- 🧙‍♂️ **Personagem & Atributos**: Evolução modular com distribuição de pontos (Força, Resistência, Agilidade, Vitalidade, Disciplina) e avatar visual dinâmico.
- ⚡ **Sistema de XP & Níveis**: Fórmula matemática centralizada de progressão com efeitos visuais e sonoros de Level Up.
- 🏋️ **Registro de Treinos Ao Vivo**: Fichas de treino, registro de peso (kg) e repetições, histórico de sobrecarga e cronômetro de descanso interativo com áudio.
- 🔥 **Streak Diário**: Acompanhamento de sequência de dias consecutivos com bônus de consistência.
- 📜 **Missões & Conquistas**: Quests diárias/semanais e troféus desbloqueáveis com recompensas de XP.
- 🤖 **Mestre da Forja (IA + MCP + RAG)**: Assistente virtual integrado que consulta seus dados reais de treino e prescreve orientações inteligentes.
- ☁️ **Arquitetura em Nuvem**: Frontend no **Netlify**, Backend Python no **PythonAnywhere**, Autenticação e Banco de Dados no **Firebase / Cloud Firestore**.

---

## 🏗️ Arquitetura

```text
                 USUÁRIO
                    │
                    ▼
               PWA / WEB (Tailwind CSS + Vanilla JS)
                    │
                 NETLIFY
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    FIREBASE AUTH       API REST PYTHON (FastAPI)
    (Google Login)      (PythonAnywhere)
          │                   │
          └─────────┬─────────┘
                    ▼
             CLOUD FIRESTORE
                    │
        XP / TREINOS / PERSONAGEM
                    │
                IA + MCP
                    │
               RAG / DADOS
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- **Node.js** 18+ e npm
- **Python** 3.10+ e pip

### 2. Configurar o Front-End
```bash
cd frontend
npm install
npm run dev
```
O aplicativo abrirá em `http://localhost:5173`.

### 3. Configurar o Back-End
```bash
cd backend
pip install -r requirements.txt
python app.py
```
A API RESTful estará rodando em `http://localhost:8000`.

---

## 🌐 Deploy em Produção

### 🟣 Deploy no Render (Recomendado)
Consulte o guia completo [DEPLOY_RENDER.md](file:///c:/Users/kgmf2/Desktop/GymForge/DEPLOY_RENDER.md) para subir o Back-End e Front-End em 1 clique usando o [render.yaml](file:///c:/Users/kgmf2/Desktop/GymForge/render.yaml).

### 📄 Documento Diretor
Consulte o documento diretor [GEMINI.md](file:///c:/Users/kgmf2/Desktop/GymForge/GEMINI.md) para detalhes arquiteturais completos.
