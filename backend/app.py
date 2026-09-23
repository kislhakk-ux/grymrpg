# GymForge — Main FastAPI Backend Application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import ALLOWED_ORIGINS, ENVIRONMENT, PORT
from routes.character_routes import router as character_router
from routes.workout_routes import router as workout_router
from routes.history_routes import router as history_router
from routes.mission_routes import router as mission_router
from routes.achievement_routes import router as achievement_router
from routes.ai_routes import router as ai_router
from routes.mcp_routes import router as mcp_router
from routes.arena_routes import router as arena_router

app = FastAPI(
    title="GymForge — Academia RPG API",
    description="API RESTful para sistema fitness gamificado, progressão de RPG, MCP e IA.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENVIRONMENT == "development" else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-routers
app.include_router(character_router)
app.include_router(workout_router)
app.include_router(history_router)
app.include_router(mission_router)
app.include_router(achievement_router)
app.include_router(ai_router)
app.include_router(mcp_router)
app.include_router(arena_router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "GymForge API",
        "version": "1.0.0",
        "environment": ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    print(f"[GymForge API] Iniciando em http://localhost:{PORT}")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
