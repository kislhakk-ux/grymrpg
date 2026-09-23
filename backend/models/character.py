# GymForge — Pydantic Character Models
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class Attributes(BaseModel):
    FORCA: int = Field(default=10, ge=1, le=100)
    RESISTENCIA: int = Field(default=8, ge=1, le=100)
    AGILIDADE: int = Field(default=6, ge=1, le=100)
    VITALIDADE: int = Field(default=10, ge=1, le=100)
    DISCIPLINA: int = Field(default=8, ge=1, le=100)

class VisualCustomization(BaseModel):
    genero: Optional[str] = "masculino"
    pele: Optional[str] = "#f5d0b0"
    cabelo: Optional[str] = "estilo1"
    corCabelo: Optional[str] = "#1e293b"
    camiseta: Optional[str] = "armadura_bronze"
    calca: Optional[str] = "calca_combate"
    tenis: Optional[str] = "botas_forja"
    acessorio: Optional[str] = "manoplas_ferro"
    aura: Optional[str] = "aura_dourada"

class Character(BaseModel):
    userId: str
    nomePersonagem: str = "Ares Forjado"
    classe: str = "guerreiro"
    atributos: Attributes = Field(default_factory=Attributes)
    customizacaoVisual: VisualCustomization = Field(default_factory=VisualCustomization)

class AllocateAttributesRequest(BaseModel):
    atributos: Dict[str, int]
