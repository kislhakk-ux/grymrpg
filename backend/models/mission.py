# GymForge — Pydantic Mission & Achievement Models
from pydantic import BaseModel
from typing import Optional

class Mission(BaseModel):
    id: str
    titulo: str
    descricao: str
    tipo: str  # 'diaria', 'semanal', 'epica'
    icone: Optional[str] = "📜"
    progressoAtual: int = 0
    meta: int = 1
    recompensaXP: int = 100
    concluida: bool = False
    reivindicada: bool = False

class Achievement(BaseModel):
    id: str
    titulo: str
    descricao: str
    icone: Optional[str] = "🏆"
    recompensaXP: int = 100
    desbloqueada: bool = False
    dataDesbloqueio: Optional[str] = None
