# GymForge — Arena & PVP Combat Service with Real Matchmaking & Global Challenges
import time
import random
from database.firestore_db import get_db
from services.xp_service import calculate_level_from_xp

# In-Memory Real Matchmaking Queue and Active Global Challenges
active_match_queue = {}  # user_id -> { user_id, name, char_name, level, rating, attrs, hp, foto, timestamp }
active_challenge_broadcast = None  # { id, challenger_name, char_name, message, timestamp }
matched_games = {}  # match_id -> { player1, player2, status, turn, created_at }

CHALLENGE_MESSAGES = [
    "⚔️ Um guerreiro quer testar suas habilidades na arena!",
    "🔥 Desafio na Forja! Quem aceita medir forças agora?",
    "⚡ Um rival quer provar quem tem mais técnica no duelo!",
    "🛡️ Duelo no Coliseu! Um herói convocou você para lutar!",
    "🥊 Desafio lançado! Mostre seu poder neste combate!",
    "⚔️ Um combatente quer testar seus limites marciais!",
    "💥 Alguém ergueu a lâmina na arena e procura duelo!",
    "🏆 Duelo rápido! Um titã busca adversário à altura!"
]

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

def get_online_warriors_count() -> int:
    """Returns a realistic online warriors count smoothly fluctuating between 50 and 100."""
    now_sec = int(time.time())
    now_min = now_sec // 60
    # Base online count around 75, varying smoothly between 54 and 96
    cycle_1 = ((now_min % 20) - 10) / 10.0  # -1.0 to 1.0
    cycle_2 = ((now_sec % 37) - 18) / 18.0  # -1.0 to 1.0
    val = 74 + int(cycle_1 * 16) + int(cycle_2 * 6)
    return max(50, min(100, val))

def calculate_max_hp(vitality: int = 10, level: int = 1) -> int:
    return 100 + (vitality * 15) + (level * 10)

def register_matchmaking_request(user_id: str, user_profile: dict, character: dict):
    """Registers user in the real queue and broadcasts short creative challenge to other users."""
    global active_challenge_broadcast
    now = time.time()
    
    attrs = character.get("atributos", {"FORCA": 10, "RESISTENCIA": 8, "AGILIDADE": 6, "VITALIDADE": 10, "DISCIPLINA": 8})
    max_hp = calculate_max_hp(attrs.get("VITALIDADE", 10), user_profile.get("nivel", 1))

    # Clean old queue items (> 30s)
    for uid in list(active_match_queue.keys()):
        if now - active_match_queue[uid]["timestamp"] > 30:
            del active_match_queue[uid]

    # Check if another REAL user is already in the queue waiting
    for uid, candidate in active_match_queue.items():
        if uid != user_id:
            # Match found with REAL player!
            del active_match_queue[uid]
            match_id = f"match_real_{int(now)}_{random.randint(100, 999)}"
            
            matched_games[match_id] = {
                "player1_id": uid,
                "player2_id": user_id,
                "status": "ready"
            }

            return {
                "matched": True,
                "isRealPlayer": True,
                "matchId": match_id,
                "opponent": {
                    "userId": candidate["userId"],
                    "nome": candidate["nome"],
                    "nomePersonagem": candidate["nomePersonagem"],
                    "nivel": candidate["nivel"],
                    "classe": candidate["classe"],
                    "atributos": candidate["atributos"],
                    "maxHp": candidate["maxHp"],
                    "currentHp": candidate["maxHp"],
                    "fury": 0,
                    "rating": candidate["rating"],
                    "foto": candidate["foto"]
                }
            }

    # If no real player yet, add self to queue
    active_match_queue[user_id] = {
        "userId": user_id,
        "nome": user_profile.get("nome", "Guerreiro da Forja"),
        "nomePersonagem": character.get("nomePersonagem", "Ares"),
        "nivel": user_profile.get("nivel", 1),
        "classe": character.get("classe", "guerreiro"),
        "atributos": attrs,
        "maxHp": max_hp,
        "rating": user_profile.get("pvpRating", 1000),
        "foto": user_profile.get("foto"),
        "timestamp": now
    }

    # Broadcast notification for all other active users with a creative short challenge
    challenger_name = user_profile.get("nome", "Guerreiro da Forja").split()[0]
    active_challenge_broadcast = {
        "id": f"chal_{int(now)}_{random.randint(10, 99)}",
        "challengerId": user_id,
        "challengerName": challenger_name,
        "characterName": character.get("nomePersonagem", "Ares"),
        "level": user_profile.get("nivel", 1),
        "message": random.choice(CHALLENGE_MESSAGES),
        "timestamp": now
    }

    return {
        "matched": False,
        "waiting": True,
        "queueTimeSeconds": 20
    }

def check_queue_status(user_id: str, user_level: int = 1, user_rating: int = 1000):
    """Checks if a real player was matched within the window, or returns high-tier warrior fallback."""
    now = time.time()

    # 1. Check if another player matched with this user
    for m_id, game in matched_games.items():
        if game.get("player1_id") == user_id or game.get("player2_id") == user_id:
            opp_id = game["player1_id"] if game["player2_id"] == user_id else game["player2_id"]
            # Clean match from memory
            del matched_games[m_id]
            return {
                "matched": True,
                "isRealPlayer": True,
                "matchId": m_id
            }

    # 2. Check if still in queue
    if user_id in active_match_queue:
        elapsed = now - active_match_queue[user_id]["timestamp"]
        if elapsed < 20:
            # Still looking for real users within the 20 seconds
            return {
                "matched": False,
                "waiting": True,
                "elapsed": round(elapsed, 1),
                "remaining": max(0, round(20 - elapsed, 1))
            }
        else:
            # 20 seconds elapsed: pair with realistic online warrior seamlessly
            del active_match_queue[user_id]
            return generate_high_tier_opponent(user_id, user_level, user_rating)

    # If not in queue, generate realistic warrior
    return generate_high_tier_opponent(user_id, user_level, user_rating)

def generate_high_tier_opponent(user_id: str, user_level: int = 1, user_rating: int = 1000):
    """Generates opponent with authentic stats matching user level seamlessly."""
    warrior_roster = [
        {"name": "Gorgon o Quebrador", "charName": "Titã Furioso", "class": "guerreiro", "for": 16, "res": 14, "agi": 8, "vit": 15, "dis": 10, "foto": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=128&q=80"},
        {"name": "Zephyr a Relâmpago", "charName": "Sombra Ágil", "class": "ladino", "for": 12, "res": 10, "agi": 18, "vit": 11, "dis": 14, "foto": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"},
        {"name": "Darius o Bastião", "charName": "Muralha de Ferro", "class": "tita", "for": 14, "res": 18, "agi": 7, "vit": 16, "dis": 15, "foto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"},
        {"name": "Aurelius o Justo", "charName": "Paladino da Forja", "class": "paladino", "for": 15, "res": 13, "agi": 10, "vit": 14, "dis": 18, "foto": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"},
        {"name": "Maya Corta-Vento", "charName": "Lâmina Celeste", "class": "ladino", "for": 13, "res": 11, "agi": 17, "vit": 12, "dis": 13, "foto": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80"},
        {"name": "Ragnar da Nevasca", "charName": "Urso do Norte", "class": "tita", "for": 18, "res": 16, "agi": 6, "vit": 17, "dis": 12, "foto": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=128&q=80"}
    ]

    selected = random.choice(warrior_roster)
    opponent_level = max(1, user_level + random.choice([-1, 0, 1]))
    opponent_hp = calculate_max_hp(selected["vit"], opponent_level)

    return {
        "matched": True,
        "isRealPlayer": True,
        "matchId": f"match_colosseum_{int(time.time())}_{random.randint(100, 999)}",
        "opponent": {
            "userId": f"warrior_{random.randint(1000, 9999)}",
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
            "rating": max(800, user_rating + random.randint(-40, 55)),
            "foto": selected["foto"]
        }
    }

def get_active_challenge(current_user_id: str):
    """Retrieves broadcasted battle challenge with creative short notifications."""
    global active_challenge_broadcast
    now = time.time()
    
    if active_challenge_broadcast:
        if now - active_challenge_broadcast["timestamp"] > 25:
            active_challenge_broadcast = None
        elif active_challenge_broadcast["challengerId"] == current_user_id:
            return {"hasChallenge": False}
        else:
            return {
                "hasChallenge": True,
                "challenge": active_challenge_broadcast
            }

    # Spontaneous periodic challenge from active online colosseum warriors (simulating 50-100 active community)
    # Triggers roughly every 45-75 seconds based on deterministic timestamp slot
    slot = int(now // 50)
    slot_seed = slot * 73
    if (slot_seed % 3 == 0) and (now % 50 < 18):
        simulated_names = [
            ("Leonidas", "Esparta Brutal"),
            ("Brunhilde", "Titã de Ferro"),
            ("Kael", "Lâmina Noturna"),
            ("Athena", "Paladina Sagrada"),
            ("Gorgon", "Quebrador de Ossos"),
            ("Zephyr", "Relâmpago da Forja")
        ]
        name, char_name = simulated_names[slot % len(simulated_names)]
        msg = CHALLENGE_MESSAGES[slot % len(CHALLENGE_MESSAGES)]
        return {
            "hasChallenge": True,
            "challenge": {
                "id": f"sim_chal_{slot}",
                "challengerId": f"online_warrior_{slot}",
                "challengerName": name,
                "characterName": char_name,
                "level": max(1, (slot % 12) + 3),
                "message": msg,
                "timestamp": now
            }
        }

    return {"hasChallenge": False}

def process_battle_action(action_type: str, attacker: dict, defender: dict):
    """Calculates combat turn outcome based on fighter attributes."""
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
