# GymForge — Pydantic Workout & History Models
from pydantic import BaseModel, Field
from typing import List, Optional

class ExerciseSet(BaseModel):
    setNumber: int
    weight: float = 0.0
    reps: int = 10
    completed: bool = False

class Exercise(BaseModel):
    id: str
    nome: str
    grupoMuscular: str
    descansoSegundos: int = 60
    sets: List[ExerciseSet] = []

class WorkoutTemplate(BaseModel):
    id: str
    nome: str
    categoria: str
    icone: Optional[str] = "⚔️"
    dificuldade: Optional[str] = "Intermediário"
    duracaoEstimada: Optional[str] = "45 min"
    xpRecompensa: int = 80
    exercicios: List[dict] = []

class WorkoutRecord(BaseModel):
    id: str
    userId: str
    workoutId: str
    nomeTreino: str
    categoria: str
    data: str
    duracaoMinutos: int
    volumeTotalKg: float
    totalSeries: int
    xpGanho: int
    detalhesExercicios: List[dict] = []

class FinishWorkoutRequest(BaseModel):
    templateId: str
    nomeTreino: str
    categoria: str
    duracaoMinutos: int
    exercicios: List[Exercise]
