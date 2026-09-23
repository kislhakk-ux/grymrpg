# GymForge — Pydantic Arena & PVP Models
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BattleFighter(BaseModel):
    userId: str
    nome: str
    nomePersonagem: str
    nivel: int
    classe: str
    atributos: Dict[str, int]
    maxHp: int
    currentHp: int
    fury: int = 0
    rating: int = 1000
    foto: Optional[str] = None

class BattleActionRequest(BaseModel):
    matchId: str
    actionType: str  # 'quick_strike', 'heavy_strike', 'iron_block', 'forge_ultimate'
    attackerId: str

class BattleResultRequest(BaseModel):
    matchId: str
    winnerId: str
    loserId: str
    roundsPlayed: int = 1

class LeaderboardPlayer(BaseModel):
    userId: str
    nome: str
    nomePersonagem: str
    nivel: int
    classe: str
    rating: int = 1000
    liga: str = "Bronze"  # Bronze, Prata, Ouro, Platina, Diamante, Mestre da Forja
    vitorias: int = 0
    derrotas: int = 0
    streakVitorias: int = 0
    foto: Optional[str] = None
