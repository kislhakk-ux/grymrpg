# GymForge — Arena & PVP Routes
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.arena_service import (
    register_matchmaking_request,
    check_queue_status,
    get_active_challenge,
    get_online_warriors_count,
    process_battle_action,
    get_arena_leaderboard
)
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/api/arena", tags=["arena"])

class MatchmakingInitRequest(BaseModel):
    userProfile: Dict[str, Any]
    character: Dict[str, Any]

class BattleTurnRequest(BaseModel):
    actionType: str
    attacker: Dict[str, Any]
    defender: Dict[str, Any]

@router.get("/online-count")
def online_count():
    """Returns dynamic realistic warriors count (50-100)."""
    return {"count": get_online_warriors_count()}

@router.post("/matchmake")
def search_opponent(req: MatchmakingInitRequest, user_id: str = Depends(get_current_user_id)):
    """Registers user in the real matchmaking queue and broadcasts challenge."""
    uid = req.userProfile.get("userId") or user_id
    return register_matchmaking_request(uid, req.userProfile, req.character)

@router.get("/match-status")
def match_status(userLevel: int = 1, userRating: int = 1000, user_id: str = Depends(get_current_user_id)):
    """Polls queue status during the 20 seconds window."""
    return check_queue_status(user_id, userLevel, userRating)

@router.get("/active-challenge")
def active_challenge(user_id: str = Depends(get_current_user_id)):
    """Retrieves active broadcasted challenge for other players."""
    return get_active_challenge(user_id)

@router.post("/turn")
def battle_turn(req: BattleTurnRequest, user_id: str = Depends(get_current_user_id)):
    return process_battle_action(req.actionType, req.attacker, req.defender)

@router.get("/leaderboard")
def leaderboard():
    return get_arena_leaderboard()
