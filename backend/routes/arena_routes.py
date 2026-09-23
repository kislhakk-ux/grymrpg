# GymForge — Arena & PVP Routes
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from services.arena_service import find_arena_opponent, process_battle_action, get_arena_leaderboard
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/api/arena", tags=["arena"])

class MatchmakingRequest(BaseModel):
    userLevel: int = 1
    userRating: int = 1000

class BattleTurnRequest(BaseModel):
    actionType: str
    attacker: Dict[str, Any]
    defender: Dict[str, Any]

@router.post("/matchmake")
def search_opponent(req: MatchmakingRequest, user_id: str = Depends(get_current_user_id)):
    return find_arena_opponent(user_id, req.userLevel, req.userRating)

@router.post("/turn")
def battle_turn(req: BattleTurnRequest, user_id: str = Depends(get_current_user_id)):
    return process_battle_action(req.actionType, req.attacker, req.defender)

@router.get("/leaderboard")
def leaderboard():
    return get_arena_leaderboard()
