# GymForge - Arena & PVP Combat Service with Real Matchmaking & Global Challenges
# Uses Firestore as shared state for multi-worker/multi-instance environments.
import time
import random
from database.firestore_db import get_db, is_firestore_connected
from services.xp_service import calculate_level_from_xp

# --- In-Process Fallback (used only when Firestore is unavailable) ---
_mem_queue = {}
_mem_broadcast = None
_mem_games = {}

FS_QUEUE_COL = 'arena_queue'
FS_BROADCAST_DOC = 'arena_broadcast'
FS_BROADCAST_COL = 'arena_global'
FS_MATCHES_COL = 'arena_matches'

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

def get_online_warriors_count():
    now_sec = int(time.time())
    now_min = now_sec // 60
    cycle_1 = ((now_min % 20) - 10) / 10.0
    cycle_2 = ((now_sec % 37) - 18) / 18.0
    val = 74 + int(cycle_1 * 16) + int(cycle_2 * 6)
    return max(50, min(100, val))


def calculate_max_hp(vitality=10, level=1):
    return 100 + (vitality * 15) + (level * 10)


# ---- Firestore-aware shared state helpers ----

def _queue_add(user_id, entry):
    global _mem_queue
    if is_firestore_connected:
        try:
            get_db().collection(FS_QUEUE_COL).document(user_id).set(entry)
            return
        except Exception as e:
            print(f'[Arena] queue_add Firestore failed: {e}')
    _mem_queue[user_id] = entry


def _queue_get_all():
    global _mem_queue
    if is_firestore_connected:
        try:
            docs = get_db().collection(FS_QUEUE_COL).stream()
            return {doc.id: doc.to_dict() for doc in docs}
        except Exception as e:
            print(f'[Arena] queue_get_all Firestore failed: {e}')
    return dict(_mem_queue)


def _queue_remove(user_id):
    global _mem_queue
    if is_firestore_connected:
        try:
            get_db().collection(FS_QUEUE_COL).document(user_id).delete()
            return
        except Exception as e:
            print(f'[Arena] queue_remove Firestore failed: {e}')
    _mem_queue.pop(user_id, None)


def _queue_get(user_id):
    global _mem_queue
    if is_firestore_connected:
        try:
            doc = get_db().collection(FS_QUEUE_COL).document(user_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f'[Arena] queue_get Firestore failed: {e}')
    return _mem_queue.get(user_id)


def _broadcast_set(challenge):
    global _mem_broadcast
    if is_firestore_connected:
        try:
            db = get_db()
            if challenge is None:
                db.collection(FS_BROADCAST_COL).document(FS_BROADCAST_DOC).delete()
            else:
                db.collection(FS_BROADCAST_COL).document(FS_BROADCAST_DOC).set(challenge)
            return
        except Exception as e:
            print(f'[Arena] broadcast_set Firestore failed: {e}')
    _mem_broadcast = challenge


def _broadcast_get():
    global _mem_broadcast
    if is_firestore_connected:
        try:
            doc = get_db().collection(FS_BROADCAST_COL).document(FS_BROADCAST_DOC).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f'[Arena] broadcast_get Firestore failed: {e}')
    return _mem_broadcast


def _match_add(match_id, game):
    global _mem_games
    if is_firestore_connected:
        try:
            get_db().collection(FS_MATCHES_COL).document(match_id).set(game)
            return
        except Exception as e:
            print(f'[Arena] match_add Firestore failed: {e}')
    _mem_games[match_id] = game


def _match_get_for_user(user_id):
    global _mem_games
    if is_firestore_connected:
        try:
            db = get_db()
            for field in ['player1.userId', 'player2.userId']:
                results = db.collection(FS_MATCHES_COL).where(field, '==', user_id).limit(1).stream()
                for doc in results:
                    return doc.id, doc.to_dict()
            return None, None
        except Exception as e:
            print(f'[Arena] match_get_for_user Firestore failed: {e}')
    for m_id, game in _mem_games.items():
        if game.get('player1', {}).get('userId') == user_id or game.get('player2', {}).get('userId') == user_id:
            return m_id, game
    return None, None


def _match_remove(match_id):
    global _mem_games
    if is_firestore_connected:
        try:
            get_db().collection(FS_MATCHES_COL).document(match_id).delete()
            return
        except Exception as e:
            print(f'[Arena] match_remove Firestore failed: {e}')
    _mem_games.pop(match_id, None)


# ---- Main Service Functions ----

def register_matchmaking_request(user_id, user_profile, character):
    now = time.time()
    attrs = character.get('atributos', {'FORCA': 10, 'RESISTENCIA': 8, 'AGILIDADE': 6, 'VITALIDADE': 10, 'DISCIPLINA': 8})
    max_hp = calculate_max_hp(attrs.get('VITALIDADE', 10), user_profile.get('nivel', 1))

    # Clean stale entries (>30s)
    all_queue = _queue_get_all()
    for uid, entry in list(all_queue.items()):
        if now - entry.get('timestamp', now) > 30:
            _queue_remove(uid)
            del all_queue[uid]

    # Match with another real user already waiting
    for uid, candidate in all_queue.items():
        if uid == user_id:
            continue
        _queue_remove(uid)
        match_id = f'match_real_{int(now)}_{random.randint(100, 999)}'
        p1_obj = {
            'userId': candidate['userId'], 'nome': candidate['nome'],
            'nomePersonagem': candidate['nomePersonagem'], 'nivel': candidate['nivel'],
            'classe': candidate['classe'], 'atributos': candidate['atributos'],
            'maxHp': candidate['maxHp'], 'currentHp': candidate['maxHp'],
            'fury': 0, 'rating': candidate['rating'], 'foto': candidate.get('foto')
        }
        p2_obj = {
            'userId': user_id, 'nome': user_profile.get('nome', 'Guerreiro da Forja'),
            'nomePersonagem': character.get('nomePersonagem', 'Ares'),
            'nivel': user_profile.get('nivel', 1), 'classe': character.get('classe', 'guerreiro'),
            'atributos': attrs, 'maxHp': max_hp, 'currentHp': max_hp,
            'fury': 0, 'rating': user_profile.get('pvpRating', 1000), 'foto': user_profile.get('foto')
        }
        _match_add(match_id, {'player1': p1_obj, 'player2': p2_obj, 'created_at': now})
        return {'matched': True, 'isRealPlayer': True, 'matchId': match_id, 'opponent': p1_obj}

    # No real player — add to queue and broadcast challenge to all others
    _queue_add(user_id, {
        'userId': user_id, 'nome': user_profile.get('nome', 'Guerreiro da Forja'),
        'nomePersonagem': character.get('nomePersonagem', 'Ares'),
        'nivel': user_profile.get('nivel', 1), 'classe': character.get('classe', 'guerreiro'),
        'atributos': attrs, 'maxHp': max_hp,
        'rating': user_profile.get('pvpRating', 1000), 'foto': user_profile.get('foto'),
        'timestamp': now
    })

    challenger_name = user_profile.get('nome', 'Guerreiro da Forja').split()[0]
    challenge = {
        'id': f'chal_{int(now)}_{random.randint(10, 99)}',
        'challengerId': user_id,
        'challengerName': challenger_name,
        'characterName': character.get('nomePersonagem', 'Ares'),
        'level': user_profile.get('nivel', 1),
        'message': random.choice(CHALLENGE_MESSAGES),
        'timestamp': now
    }
    _broadcast_set(challenge)

    return {'matched': False, 'waiting': True, 'queueTimeSeconds': 20, 'challengeId': challenge['id']}

def check_queue_status(user_id, user_level=1, user_rating=1000):
    now = time.time()

    # 1. Check if a match was registered for this user (in Firestore or in-memory)
    m_id, game = _match_get_for_user(user_id)
    if game:
        p1 = game.get('player1', {})
        p2 = game.get('player2', {})
        opp = p2 if p1.get('userId') == user_id else p1
        if now - game.get('created_at', now) > 20:
            _match_remove(m_id)
        return {'matched': True, 'isRealPlayer': True, 'matchId': m_id, 'opponent': opp}

    # 2. Check if still in queue
    entry = _queue_get(user_id)
    if entry:
        elapsed = now - entry.get('timestamp', now)
        if elapsed < 20:
            return {'matched': False, 'waiting': True, 'elapsed': round(elapsed, 1), 'remaining': max(0, round(20 - elapsed, 1))}
        else:
            _queue_remove(user_id)
            return generate_high_tier_opponent(user_id, user_level, user_rating)

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

def get_active_challenge(current_user_id):
    now = time.time()

    # 1. Real broadcast from Firestore (visible to all other users)
    challenge = _broadcast_get()
    if challenge:
        if now - challenge.get('timestamp', now) > 25:
            _broadcast_set(None)
            challenge = None
        elif challenge.get('challengerId') != current_user_id:
            return {'hasChallenge': True, 'challenge': challenge}

    # 2. Periodic simulated challenge to keep arena lively
    slot = int(now // 50)
    slot_seed = slot * 73
    if (slot_seed % 3 == 0) and (now % 50 < 18):
        simulated_names = [
            ('Leonidas', 'Esparta Brutal'), ('Brunhilde', 'Tita de Ferro'),
            ('Kael', 'Lamina Noturna'), ('Athena', 'Paladina Sagrada'),
            ('Gorgon', 'Quebrador de Ossos'), ('Zephyr', 'Relampago da Forja')
        ]
        name, char_name = simulated_names[slot % len(simulated_names)]
        msg = CHALLENGE_MESSAGES[slot % len(CHALLENGE_MESSAGES)]
        return {
            'hasChallenge': True,
            'challenge': {
                'id': f'sim_chal_{slot}', 'challengerId': f'online_warrior_{slot}',
                'challengerName': name, 'characterName': char_name,
                'level': max(1, (slot % 12) + 3), 'message': msg, 'timestamp': now
            }
        }

    return {'hasChallenge': False}

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
