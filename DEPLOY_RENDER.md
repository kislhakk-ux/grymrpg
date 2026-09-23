# 🚀 Guia de Deploy no Render — GymForge (Academia RPG)

Este guia explica como colocar o **GymForge** 100% online no **Render.com** (tanto o **Backend Python FastAPI** quanto o **Frontend PWA**).

---

## 📦 Método 1: Deploy Automático via Blueprint (Recomendado — 1 Clique)

O projeto já inclui o arquivo [`render.yaml`](file:///c:/Users/kgmf2/Desktop/GymForge/render.yaml) configurado.

### Passo a Passo:
1. Envie seu código para um repositório no **GitHub** (veja a seção [Subir para o GitHub](#-como-subir-o-código-para-o-github) abaixo).
2. Acesse sua conta no [Render Dashboard](https://dashboard.render.com/).
3. Clique no botão **New +** no canto superior direito e selecione **Blueprint**.
4. Conecte seu repositório do GitHub (`GymForge`).
5. O Render detectará automaticamente o arquivo `render.yaml` e criará os 2 serviços:
   - **`gymforge-api`** (Web Service Python FastAPI)
   - **`gymforge-pwa`** (Static Site Frontend)
6. Clique em **Apply** e aguarde o build finalizar!

---

## 🛠️ Método 2: Deploy Manual Passo a Passo

Caso prefira criar os serviços individualmente no painel do Render:

### 1️⃣ Subir o Back-End (FastAPI)
1. No painel do Render, clique em **New +** > **Web Service**.
2. Conecte seu repositório do GitHub.
3. Preencha as configurações:
   - **Name**: `gymforge-api`
   - **Region**: `Oregon (US West)` ou a mais próxima
   - **Branch**: `main` (ou `master`)
   - **Root Directory**: *(deixe em branco ou `./`)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Em **Environment Variables**, adicione:
   - `ENVIRONMENT`: `production`
   - `ALLOWED_ORIGINS`: `*`
   - `GEMINI_API_KEY`: *(sua chave do Google Gemini se for usar IA)*
5. Clique em **Create Web Service**.
6. Copie a URL gerada (exemplo: `https://gymforge-api.onrender.com`).

---

### 2️⃣ Subir o Front-End (PWA)
1. No painel do Render, clique em **New +** > **Static Site**.
2. Conecte seu repositório do GitHub.
3. Preencha as configurações:
   - **Name**: `gymforge-pwa`
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Em **Environment Variables**, adicione:
   - `VITE_API_BASE_URL`: `https://gymforge-api.onrender.com` *(URL do seu backend criado no passo 1)*
5. Em **Redirects/Rewrites** (menu lateral esquerdo do Static Site):
   - Clique em **Add Rule**
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - *(Isso garante que rotas como `#arena` e `#workouts` funcionem perfeitamente sem erro 404)*
6. Clique em **Create Static Site**.

---

## 🐙 Como Subir o Código para o GitHub

Abra o terminal na pasta do projeto (`c:\Users\kgmf2\Desktop\GymForge`) e execute:

```bash
# 1. Inicializar o Git (se ainda não inicializou)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar o commit inicial
git commit -m "feat: Academia RPG GymForge com Arena PVP e deploy Render"

# 4. Conectar ao seu repositório no GitHub (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/GymForge.git

# 5. Enviar os arquivos
git branch -M main
git push -u origin main
```

---

## ✅ Pronto!
Após esses passos, seu aplicativo estará online com:
- **Frontend PWA**: `https://gymforge-pwa.onrender.com` (instalável no celular e desktop)
- **API Python REST / IA / MCP**: `https://gymforge-api.onrender.com`
- **Arena de Batalha PVP** e **Sistema de RPG** funcionando 100% em nuvem!
