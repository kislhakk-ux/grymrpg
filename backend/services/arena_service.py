# GymForge — Arena & PVP Combat Service
import random
from database.firestore_db import get_db
from services.xp_service import calculate_level_from_xp

DEFAULT_LEADERBOARD = [
    {
        "userId": "warrior_top_1",
        "nome": "Valkíria Imortal",
        "nomePersonagem": "Brunhilde de Ferro",
        "nivel": 24,
        "classe": "tita",
        "rating": 2150,
        "liga": "Mestre da Forja",
        "vitorias": 84,
        "derrotas": 12,
        "streakVitorias": 7,
        "foto": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80"
    },
    {
        "userId": "warrior_top_2",
        "nome": "Leonidas do Aço",
        "nomePersonagem": "Esparta Brutal",
        "nivel": 20,
        "classe": "guerreiro",
        "rating": 1940,
        "liga": "Diamante",
        "vitorias": 65,
        "derrotas": 18,
        "streakVitorias": 4,
        "foto": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80"
    },
    {
        "userId": "warrior_top_3",
        "nome": "Kael das Sombras",
        "nomePersonagem": "Lâmina Ágil",
        "nivel": 18,
        "classe": "ladino",
        "rating": 1780,
        "liga": "Platina",
        "vitorias": 52,
        "derrotas": 21,
        "streakVitorias": 3,
        "foto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
    },
    {
        "userId": "warrior_top_4",
        "nome": "Athena da Disciplina",
        "nomePersonagem": "Paladina Sagrada",
        "nivel": 15,
        "classe": "paladino",
        "rating": 1520,
        "liga": "Ouro",
        "vitorias": 38,
        "derrotas": 16,
        "streakVitorias": 2,
        "foto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80"
    }
]

def calculate_max_hp(vitality: int = 10, level: int = 1) -> int:
    return 100 + (vitality * 15) + (level * 10)

def find_arena_opponent(user_id: str, user_level: int = 1, user_rating: int = 1000):
    """Finds or matches a suitable opponent warrior based on level & rating."""
    bot_archetypes = [
        {"name": "Gorgon o Quebrador", "charName": "Titã Furioso", "class": "guerreiro", "for": 16, "res": 14, "agi": 8, "vit": 15, "dis": 10},
        {"name": "Zephyr a Relâmpago", "charName": "Sombra Ágil", "class": "ladino", "for": 12, "res": 10, "agi": 18, "vit": 11, "dis": 14},
        {"name": "Darius o Bastião", "charName": "Muralha de Ferro", "class": "tita", "for": 14, "res": 18, "agi": 7, "vit": 16, "dis": 15},
        {"name": "Aurelius o Justo", "charName": "Paladino da Forja", "class": "paladino", "for": 15, "res": 13, "agi": 10, "vit": 14, "dis": 18}
    ]

    selected = random.choice(bot_archetypes)
    opponent_level = max(1, user_level + random.choice([-1, 0, 1]))
    opponent_hp = calculate_max_hp(selected["vit"], opponent_level)

    opponent = {
        "userId": f"bot_{random.randint(100, 999)}",
        "nome": selected["name"],
        "nomePersonagem": selected["charName"],
        "nivel": opponent_level,
        "classe": selected["class"],
        "atributos": {
            "FORCA": selected["for"],
            "RESISTENCIA": selected["res"],
            "AGILIDADE": selected["agi"],
            "VITALIDADE": selected["vit"],
            "DISCIPLINA": selected["dis"]
        },
        "maxHp": opponent_hp,
        "currentHp": opponent_hp,
        "fury": 0,
        "rating": max(800, user_rating + random.randint(-50, 60)),
        "foto": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=128&q=80"
    }

    match_id = f"match_{int(random.random()*1000000)}"
    return {
        "matchId": match_id,
        "opponent": opponent
    }

def process_battle_action(action_type: str, attacker: dict, defender: dict):
    """Calculates turn outcome based on fighter attributes."""
    att_attrs = attacker.get("atributos", {})
    def_attrs = defender.get("atributos", {})

    strength = att_attrs.get("FORCA", 10)
    agility = att_attrs.get("AGILIDADE", 10)
    discipline = att_attrs.get("DISCIPLINA", 10)
    def_res = def_attrs.get("RESISTENCIA", 10)
    def_agi = def_attrs.get("AGILIDADE", 10)

    is_crit = False
    is_dodge = False
    is_blocked = defender.get("isBlocking", False)
    damage = 0
    fury_gain = 0
    msg = ""

    # Check dodge chance based on opponent agi
    dodge_chance = min(0.25, max(0.05, (def_agi - agility) * 0.02))
    if action_type != "forge_ultimate" and random.random() < dodge_chance:
        is_dodge = True
        msg = f"{defender.get('nomePersonagem')} esquivou com agilidade acrobática!"
        return {
            "damage": 0,
            "isCrit": False,
            "isDodge": True,
            "isBlocked": False,
            "furyGain": 5,
            "message": msg
        }

    if action_type == "quick_strike":
        base_dmg = (strength * 1.4) + (agility * 1.6)
        damage = base_dmg + random.randint(3, 8)
        fury_gain = 15
        msg = f"{attacker.get('nomePersonagem')} desferiu um Golpe Rápido veloz!"

    elif action_type == "heavy_strike":
        base_dmg = (strength * 2.8) + (attacker.get("nivel", 1) * 3)
        crit_chance = min(0.40, 0.10 + (discipline * 0.015))
        if random.random() < crit_chance:
            is_crit = True
            damage = base_dmg * 1.8 + random.randint(10, 20)
            msg = f"🔥 GOLPE CRÍTICO! {attacker.get('nomePersonagem')} quebrou as defesas com um Martelo Titânico!"
        else:
            damage = base_dmg + random.randint(5, 12)
            msg = f"{attacker.get('nomePersonagem')} acertou uma Pancada Pesada!"
        fury_gain = 25

    elif action_type == "iron_block":
        return {
            "damage": 0,
            "isCrit": False,
            "isDodge": False,
            "isBlocked": True,
            "furyGain": 20,
            "message": f"🛡️ {attacker.get('nomePersonagem')} assumiu a Postura do Ferro Inabalável!"
        }

    elif action_type == "forge_ultimate":
        damage = (strength * 4.0) + (discipline * 2.5) + random.randint(20, 40)
        is_crit = True
        fury_gain = -100
        msg = f"⚡ IMPACTO SUPREMO DA FORJA! {attacker.get('nomePersonagem')} canalizou todo o seu poder em uma explosão devastadora!"

    # Apply defense mitigation
    mitigation_factor = min(0.60, def_res * 0.012)
    if is_blocked:
        damage = damage * 0.35  # Block blocks 65%
        msg += " (Bloqueio reduziu o dano!)"
    else:
        damage = damage * (1.0 - mitigation_factor)

    damage = max(5, int(damage))

    return {
        "damage": damage,
        "isCrit": is_crit,
        "isDodge": is_dodge,
        "isBlocked": is_blocked,
        "furyGain": fury_gain,
        "message": msg
    }

def get_arena_leaderboard():
    """Retrieves current global PVP Leaderboard rankings."""
    return {"leaderboard": DEFAULT_LEADERBOARD}
