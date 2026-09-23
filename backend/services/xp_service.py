# GymForge — XP & Level Service
import math

def xp_for_level(level: int) -> int:
    """Calculates cumulative XP needed to reach a specific level."""
    if level <= 1:
        return 0
    total = 0
    for i in range(1, level):
        total += math.floor(100 * (i ** 1.5))
    return total

def calculate_level_from_xp(total_xp: int):
    """Calculates level and current level progress from total XP."""
    level = 1
    while True:
        next_level_total = xp_for_level(level + 1)
        if total_xp < next_level_total:
            break
        level += 1
        if level >= 100:
            break

    current_base = xp_for_level(level)
    next_base = xp_for_level(level + 1)
    xp_in_level = total_xp - current_base
    needed = next_base - current_base
    progress_percent = min(100, max(0, round((xp_in_level / needed) * 100)))

    return {
        "level": level,
        "total_xp": total_xp,
        "xp_in_level": xp_in_level,
        "needed_for_next": needed,
        "progress_percent": progress_percent
    }

def calculate_workout_rewards(exercises: list, streak_days: int = 1):
    """Server-side calculation and validation of workout XP reward."""
    total_volume_kg = 0.0
    total_sets_completed = 0

    for ex in exercises:
        sets = ex.get("sets", []) if isinstance(ex, dict) else getattr(ex, "sets", [])
        for s in sets:
            is_completed = s.get("completed", False) if isinstance(s, dict) else getattr(s, "completed", False)
            if is_completed:
                total_sets_completed += 1
                w = float(s.get("weight", 0.0) if isinstance(s, dict) else getattr(s, "weight", 0.0))
                r = int(s.get("reps", 0) if isinstance(s, dict) else getattr(s, "reps", 0))
                total_volume_kg += w * r

    base_xp = 50
    exercise_bonus = len(exercises) * 10
    volume_bonus = int(total_volume_kg // 100)
    streak_multiplier = min(streak_days, 7)
    streak_bonus = streak_multiplier * 5

    total_xp = base_xp + exercise_bonus + volume_bonus + streak_bonus

    return {
        "total_xp": total_xp,
        "total_volume_kg": total_volume_kg,
        "total_sets_completed": total_sets_completed,
        "base_xp": base_xp,
        "volume_bonus": volume_bonus,
        "streak_bonus": streak_bonus
    }
