// GymForge — Dynamic Modular RPG Character Avatar Component

export function renderCharacterAvatar(character = {}, user = {}, options = {}) {
  const { size = 220, showAura = true, interactive = false } = options;
  const attrs = character.atributos || { FORCA: 10, RESISTENCIA: 8, AGILIDADE: 6, VITALIDADE: 10, DISCIPLINA: 8 };
  const visual = character.customizacaoVisual || {};
  const level = user.nivel || 1;

  // Visual scaling based on RPG stats
  const strengthScale = Math.min(1.25, 0.9 + (attrs.FORCA / 50));
  const auraOpacity = Math.min(0.85, 0.2 + (attrs.VITALIDADE / 40) + (level * 0.02));
  const skinColor = visual.pele || '#f5d0b0';
  const hairColor = visual.corCabelo || '#1e293b';

  return `
    <div class="relative flex items-center justify-center select-none" style="width: ${size}px; height: ${size}px;">
      <!-- Glowing Power Aura (Vitality & Level) -->
      ${showAura ? `
        <div class="absolute inset-0 rounded-full animate-pulse-slow filter blur-xl pointer-events-none" 
             style="background: radial-gradient(circle, rgba(245, 158, 11, ${auraOpacity}) 0%, rgba(6, 182, 212, ${auraOpacity * 0.7}) 50%, transparent 80%);">
        </div>
      ` : ''}

      <!-- Modular SVG Avatar -->
      <svg viewBox="0 0 200 240" width="${size}" height="${size}" class="relative z-10 filter drop-shadow-lg transition-transform duration-300 ${interactive ? 'hover:scale-105' : ''}">
        <defs>
          <linearGradient id="armorMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#67e8f9"/>
            <stop offset="100%" stop-color="#06b6d4"/>
          </radialGradient>
        </defs>

        <!-- Dynamic Aura Ring -->
        <circle cx="100" cy="120" r="92" fill="none" stroke="url(#goldTrim)" stroke-width="1.5" stroke-dasharray="6 8" class="animate-spin-slow opacity-60" style="animation-duration: 20s;"/>

        <!-- Shadow Base -->
        <ellipse cx="100" cy="225" rx="55" ry="12" fill="rgba(0,0,0,0.4)"/>

        <!-- Legs & Boots (Resistência / Agilidade) -->
        <g id="legs">
          <rect x="76" y="150" width="18" height="60" rx="6" fill="#1e293b"/>
          <rect x="106" y="150" width="18" height="60" rx="6" fill="#1e293b"/>
          <!-- Combat Boots -->
          <rect x="73" y="195" width="23" height="24" rx="5" fill="#0f172a" stroke="url(#goldTrim)" stroke-width="1.5"/>
          <rect x="104" y="195" width="23" height="24" rx="5" fill="#0f172a" stroke="url(#goldTrim)" stroke-width="1.5"/>
        </g>

        <!-- Torso & Musculature (Scaled by Strength) -->
        <g id="torso" transform="translate(100, 110) scale(${strengthScale}) translate(-100, -110)">
          <!-- Chest / Core Base -->
          <path d="M 65 75 L 135 75 L 122 155 L 78 155 Z" fill="url(#armorMetal)" stroke="url(#goldTrim)" stroke-width="2"/>
          
          <!-- Chest Plate Armor Highlights -->
          <path d="M 75 85 L 96 85 L 96 115 L 78 115 Z" fill="#334155" opacity="0.8"/>
          <path d="M 104 85 L 125 85 L 122 115 L 104 115 Z" fill="#334155" opacity="0.8"/>
          
          <!-- Forge Core Emblem on Chest -->
          <polygon points="100,95 106,105 100,115 94,105" fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)"/>
          
          <!-- Belt with GymForge Buckle -->
          <rect x="76" y="145" width="48" height="12" rx="2" fill="#0f172a"/>
          <circle cx="100" cy="151" r="5" fill="url(#goldTrim)"/>
        </g>

        <!-- Muscular Arms (Força) -->
        <g id="arms" transform="translate(100, 110) scale(${strengthScale}) translate(-100, -110)">
          <!-- Left Arm -->
          <rect x="42" y="78" width="22" height="60" rx="10" fill="${skinColor}"/>
          <!-- Shoulder Guard (Pauldrons) -->
          <path d="M 38 72 Q 52 60 66 75 L 62 90 Q 50 82 38 72 Z" fill="url(#goldTrim)"/>
          <!-- Wrist Gauntlet -->
          <rect x="41" y="118" width="22" height="20" rx="4" fill="url(#armorMetal)" stroke="url(#goldTrim)" stroke-width="1"/>

          <!-- Right Arm -->
          <rect x="136" y="78" width="22" height="60" rx="10" fill="${skinColor}"/>
          <!-- Right Shoulder Guard -->
          <path d="M 134 75 Q 148 60 162 72 L 162 72 Q 150 82 138 90 Z" fill="url(#goldTrim)"/>
          <!-- Right Wrist Gauntlet -->
          <rect x="137" y="118" width="22" height="20" rx="4" fill="url(#armorMetal)" stroke="url(#goldTrim)" stroke-width="1"/>
        </g>

        <!-- Neck & Head -->
        <g id="head">
          <rect x="91" y="60" width="18" height="18" fill="${skinColor}"/>
          
          <!-- Face Base -->
          <ellipse cx="100" cy="52" rx="20" ry="24" fill="${skinColor}"/>

          <!-- Glowing Eyes -->
          <ellipse cx="93" cy="50" rx="3.5" ry="2.5" fill="url(#eyeGlow)"/>
          <ellipse cx="107" cy="50" rx="3.5" ry="2.5" fill="url(#eyeGlow)"/>
          <circle cx="93" cy="50" r="1" fill="#ffffff"/>
          <circle cx="107" cy="50" r="1" fill="#ffffff"/>

          <!-- Determined Brow -->
          <path d="M 88 45 L 97 48" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
          <path d="M 112 45 L 103 48" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>

          <!-- Hair / Heroic Helm -->
          <path d="M 78 45 C 78 26 122 26 122 45 C 122 36 114 30 100 30 C 86 30 78 36 78 45 Z" fill="${hairColor}"/>
          <!-- Warrior Spikes / Crown -->
          <polygon points="100,20 106,32 94,32" fill="url(#goldTrim)"/>
        </g>
      </svg>
    </div>
  `;
}
