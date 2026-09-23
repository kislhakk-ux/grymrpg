# GymForge — Pydantic User Models
from pydantic import BaseModel, Field
from typing import Optional

class UserProfile(BaseModel):
    userId: str
    nome: str
    email: str
    foto: Optional[str] = None
    dataCriacao: str
    ultimoLogin: str
    nivel: int = 1
    xp: int = 0
    pontosAtributoDisponiveis: int = 3
    streakAtual: int = 1
    maiorStreak: int = 1
    ultimoTreinoData: Optional[str] = None

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    foto: Optional[str] = None
