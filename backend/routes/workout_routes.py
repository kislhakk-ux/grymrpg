# GymForge — Workout Routes
from fastapi import APIRouter, Depends
from models.workout import FinishWorkoutRequest
from services.workout_service import process_finish_workout
from middleware.auth_middleware import get_current_user_id
from services.workout_presets import PRESET_WORKOUTS

router = APIRouter(prefix="/api/workouts", tags=["workouts"])

@router.get("/templates")
def get_workout_templates():
    return {"workouts": PRESET_WORKOUTS}

@router.post("/finish")
def finish_workout_endpoint(req: FinishWorkoutRequest, user_id: str = Depends(get_current_user_id)):
    return process_finish_workout(user_id, req.model_dump())
