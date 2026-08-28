/**
 * VESUVIO.EXE - SVG Asset Factory
 * High-definition procedural SVGs for 8 Lore Bosses, Character customizer & Item Sets
 */
"use strict";

const SWATCHES = [
  "3fa8d8", "ffd25a", "ff4824", "5ff5c5", "bb86fc", "ff7ab6", "8fb2cc", "e7d3b0", "d0524d", "6ee7d0", "e6f6ff", "182336"
];

const CHASSIS_LIST = [
  { id: "ferro", name: "Ferro Vecchio", desc: "Anni '60, bulloni a vista, onesto e indistruttibile." },
  { id: "andro", name: "Androide Avanzato", cost: 120, desc: "Raro, polimeri lucidi e linee Frutiger Aero." },
  { id: "mario", name: "Mariuolo", cost: 180, desc: "Agile, scarno, con schermo CRT di recupero." },
  { id: "enforce", name: "Enforcer", cost: 350, desc: "Corazza d'acciaio pesante saldata, piastre balistiche." }
];

const EYES_LIST = [
  { id: "visore", name: "Visore Cyan", cost: 0 },
  { id: "due", name: "Fessure Ambrate", cost: 50 },
  { id: "mono", name: "Monocolo Tattico", cost: 40 },
  { id: "crt", name: "Schermo CRT 0x00", cost: 150 }
];

const ANTENNAS_LIST = [
  { id: "none", name: "Nessuna", cost: 0 },
  { id: "p", name: "Antennina", cost: 30 },
  { id: "g", name: "Traliccio Radio", cost: 100 },
  { id: "d", name: "Parabola Y2K", cost: 220 }
];

const HATS_LIST = [
  { id: "none", name: "Nessuno", cost: 0 },
  { id: "b", name: "Berretto", cost: 35 },
  { id: "c", name: "Coppola in Titanio", cost: 120 },
  { id: "boss", name: "Cappello del Boss", cost: 250 }
];

const ACCS_LIST = [
  { id: "none", name: "Nessuno", cost: 0 },
  { id: "grem", name: "Grembiule Barista", cost: 60 },
  { id: "attx", name: "Cintura Attrezzi", cost: 90 },
  { id: "sun", name: "Occhiali Scintillanti", cost: 80 },
  { id: "oro", name: "Catenaccio d'Oro", cost: 200 }
];

const WEPS_LIST = [
  { id: "none", name: "Nessuna", cost: 0 },
  { id: "chia", name: "Chiave Meccanico", cost: 40 },
  { id: "spad", name: "Tubo al Plasma", cost: 110 },
  { id: "pist", name: "Pistola a Lava", cost: 160 }
];

// 8 LORE BOSS SVG GENERATORS
function getBossSVG(bossIdx) {
  switch (bossIdx % 8) {
    case 0: return getBossCapitanoSVG();
    case 1: return getBossMisterKSVG();
    case 2: return getBossMadonninaSVG();
    case 3: return getBossGemelliSVG();
    case 4: return getBossViperaSVG();
    case 5: return getBossBombaSVG();
    case 6: return getBossRuggineSVG();
    case 7: return getBossSMC_SVG();
    default: return getBossCapitanoSVG();
  }
}

function getBossCapitanoSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <defs>
      <linearGradient id="capG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a3d54"/><stop offset="100%" stop-color="#121a24"/></linearGradient>
      <linearGradient id="capGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd76a"/><stop offset="100%" stop-color="#ff9a3c"/></linearGradient>
    </defs>
    <!-- Exhaust pipes -->
    <rect x="36" y="24" width="12" height="40" rx="3" fill="#1e2630" stroke="#0e1318" stroke-width="2"/>
    <rect x="112" y="24" width="12" height="40" rx="3" fill="#1e2630" stroke="#0e1318" stroke-width="2"/>
    <!-- Torso -->
    <path d="M42 80 L118 80 L110 145 L50 145 Z" fill="url(#capG)" stroke="#0e1620" stroke-width="3"/>
    <!-- Epaulettes & Medals -->
    <rect x="34" y="80" width="22" height="12" rx="3" fill="url(#capGold)"/>
    <rect x="104" y="80" width="22" height="12" rx="3" fill="url(#capGold)"/>
    <circle cx="60" cy="104" r="5" fill="#ff4d64"/><circle cx="74" cy="104" r="5" fill="#ffd76a"/><circle cx="88" cy="104" r="5" fill="#4dd0ff"/>
    <!-- Head & Visor -->
    <rect x="56" y="38" width="48" height="42" rx="8" fill="#1a2536" stroke="#0e1620" stroke-width="3"/>
    <rect x="62" y="52" width="36" height="10" rx="4" fill="#ff3344" filter="drop-shadow(0 0 6px #ff3344)"/>
    <!-- Peaked Cap -->
    <path d="M46 38 Q80 18 114 38 L114 44 Q80 34 46 44 Z" fill="#16202c"/>
    <rect x="58" y="38" width="44" height="4" fill="url(#capGold)"/>
    <circle cx="80" cy="30" r="5" fill="url(#capGold)"/>
  </svg>`;
}

function getBossMisterKSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <defs>
      <radialGradient id="mkChrome" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#d4f1f9"/><stop offset="85%" stop-color="#557f99"/><stop offset="100%" stop-color="#1f3747"/>
      </radialGradient>
    </defs>
    <!-- Shroud/Cloak -->
    <path d="M40 70 Q80 45 120 70 L135 150 L25 150 Z" fill="#0c1017" stroke="#1f2c3d" stroke-width="2"/>
    <path d="M55 70 Q80 55 105 70 L115 150 L45 150 Z" fill="#141a24"/>
    <!-- Chrome Mirror Sphere (No face) -->
    <circle cx="80" cy="65" r="32" fill="url(#mkChrome)" stroke="#ffffff" stroke-width="1.5" filter="drop-shadow(0 0 16px rgba(127,230,255,0.7))"/>
    <!-- Glitch Waveform -->
    <path d="M62 65 h8 l4 -10 l6 20 l5 -16 l5 10 h8" fill="none" stroke="#7fe6ff" stroke-width="2" opacity="0.85"/>
  </svg>`;
}

function getBossMadonninaSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <defs>
      <radialGradient id="madHalo" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stop-color="#ffd76a"/><stop offset="100%" stop-color="#ff4824" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Stained glass halo -->
    <circle cx="80" cy="55" r="42" fill="url(#madHalo)" opacity="0.45"/>
    <circle cx="80" cy="55" r="38" fill="none" stroke="#ffd76a" stroke-width="2" stroke-dasharray="8,4"/>
    <!-- Veil & Body -->
    <path d="M48 40 C48 20 112 20 112 40 C118 70 130 110 134 150 L26 150 C30 110 42 70 48 40 Z" fill="#080c14" stroke="#ffd76a" stroke-width="1.5"/>
    <!-- Black Titanium Mask -->
    <ellipse cx="80" cy="62" rx="18" ry="24" fill="#141c28" stroke="#3a4f68" stroke-width="2"/>
    <!-- Weeping Lava Tears -->
    <circle cx="73" cy="58" r="3.5" fill="#ff4824"/><path d="M73 60 L72 74" stroke="#ff4824" stroke-width="2"/>
    <circle cx="87" cy="58" r="3.5" fill="#ff4824"/><path d="M87 60 L88 74" stroke="#ff4824" stroke-width="2"/>
  </svg>`;
}

function getBossGemelliSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <!-- Torso -->
    <rect x="44" y="86" width="72" height="60" rx="8" fill="#1c2738" stroke="#0e1622" stroke-width="3"/>
    <rect x="76" y="92" width="8" height="50" fill="#ff9a3c"/>
    <!-- Left Head (Cyan CRT) -->
    <rect x="36" y="36" width="38" height="42" rx="6" fill="#121c28" stroke="#4dd0ff" stroke-width="2"/>
    <rect x="42" y="44" width="26" height="24" fill="#04121a" rx="3"/>
    <text x="55" y="60" font-family="monospace" font-size="12" fill="#4dd0ff" text-anchor="middle">01</text>
    <!-- Right Head (Red CRT) -->
    <rect x="86" y="36" width="38" height="42" rx="6" fill="#121c28" stroke="#ff4d64" stroke-width="2"/>
    <rect x="92" y="44" width="26" height="24" fill="#1a0408" rx="3"/>
    <text x="105" y="60" font-family="monospace" font-size="12" fill="#ff4d64" text-anchor="middle">10</text>
    <!-- Connecting sync beam -->
    <line x1="74" y1="56" x2="86" y2="56" stroke="#ffd76a" stroke-width="3" stroke-dasharray="3,2"/>
  </svg>`;
}

function getBossViperaSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <!-- Copper & Emerald Serpentine Body -->
    <path d="M80 30 Q120 50 80 80 Q40 110 80 145" fill="none" stroke="#229974" stroke-width="24" stroke-linecap="round"/>
    <path d="M80 30 Q120 50 80 80 Q40 110 80 145" fill="none" stroke="#5ff5c5" stroke-width="6" stroke-dasharray="10,6" stroke-linecap="round"/>
    <!-- Hood/Head -->
    <path d="M60 30 Q80 10 100 30 L94 48 Q80 54 66 48 Z" fill="#17362a" stroke="#5ff5c5" stroke-width="2"/>
    <!-- Twin Emerald Slits -->
    <line x1="72" y1="32" x2="76" y2="30" stroke="#ffd76a" stroke-width="3"/>
    <line x1="88" y1="32" x2="84" y2="30" stroke="#ffd76a" stroke-width="3"/>
    <!-- Poison Blade -->
    <path d="M80 130 L80 156 L84 150 Z" fill="#5ff5c5"/>
  </svg>`;
}

function getBossBombaSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <defs>
      <radialGradient id="bombGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#4a5568"/><stop offset="70%" stop-color="#1a202c"/><stop offset="100%" stop-color="#0d1117"/>
      </radialGradient>
    </defs>
    <!-- Fuse & Spark -->
    <path d="M80 40 Q95 20 115 22" fill="none" stroke="#ffd76a" stroke-width="4"/>
    <circle cx="118" cy="22" r="6" fill="#ff4824" filter="drop-shadow(0 0 8px #ff4824)"/>
    <!-- Spherical Body -->
    <circle cx="80" cy="90" r="48" fill="url(#bombGrad)" stroke="#ff4824" stroke-width="3"/>
    <rect x="72" y="38" width="16" height="10" fill="#2d3748" rx="2"/>
    <!-- Detonator Core / Pressure Gauge -->
    <circle cx="80" cy="90" r="20" fill="#111" stroke="#ffd76a" stroke-width="2.5"/>
    <line x1="80" y1="90" x2="90" y2="82" stroke="#ff3344" stroke-width="2.5"/>
    <text x="80" y="125" font-family="monospace" font-size="9" fill="#ff4824" text-anchor="middle">BOOM.EXE</text>
  </svg>`;
}

function getBossRuggineSVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <!-- Heavy Rusted Plates -->
    <rect x="42" y="56" width="76" height="74" rx="8" fill="#7a4422" stroke="#42220f" stroke-width="3.5"/>
    <!-- Welded Patches & Rivets -->
    <rect x="50" y="66" width="30" height="24" fill="#a05a2c" stroke="#331707" stroke-width="2"/>
    <circle cx="54" cy="70" r="2" fill="#222"/><circle cx="76" cy="70" r="2" fill="#222"/>
    <circle cx="54" cy="86" r="2" fill="#222"/><circle cx="76" cy="86" r="2" fill="#222"/>
    <!-- Molten Furnace Chest -->
    <circle cx="80" cy="100" r="14" fill="#ff4824" filter="drop-shadow(0 0 10px #ff4824)"/>
    <circle cx="80" cy="100" r="8" fill="#ffd76a"/>
    <!-- Crude Mechanical Head -->
    <rect x="62" y="24" width="36" height="32" rx="4" fill="#5c3217" stroke="#331707" stroke-width="2"/>
    <rect x="68" y="34" width="24" height="8" rx="2" fill="#ff9a3c"/>
  </svg>`;
}

function getBossSMC_SVG() {
  return `<svg viewBox="0 0 160 160" width="100%" height="100%">
    <defs>
      <radialGradient id="smcGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#bdf2ff"/><stop offset="70%" stop-color="#4aa8d8"/><stop offset="100%" stop-color="#0a2a44"/>
      </radialGradient>
    </defs>
    <!-- Outer Quantum Shockwaves -->
    <circle cx="80" cy="80" r="64" fill="none" stroke="#7fe6ff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>
    <circle cx="80" cy="80" r="54" fill="none" stroke="#ffd76a" stroke-width="2" opacity="0.75"/>
    <!-- Manifested Pure Chrome Orb -->
    <circle cx="80" cy="80" r="38" fill="url(#smcGrad)" stroke="#ffffff" stroke-width="2" filter="drop-shadow(0 0 24px rgba(127,230,255,0.9))"/>
    <!-- Glitch Symbol 0x00 -->
    <text x="80" y="86" font-family="monospace" font-size="13" font-weight="900" fill="#041a2c" text-anchor="middle">SMC</text>
  </svg>`;
}

// CUSTOMIZABLE PLAYER ROBOT SVG GENERATOR
function generatePlayerRobotSVG(rob) {
  const r = rob || S.rob;
  const c1 = r.col1 || "#3fa8d8";
  const c2 = r.col2 || "#ffd25a";
  const ec = r.eyesCol || "#5ff5c5";
  const sh1 = f => shade(c1, f);
  const sh2 = f => shade(c2, f);
  
  let wingsSVG = "";
  let fxSVG = "";
  let legsSVG = "";
  let bodySVG = "";
  let armsSVG = "";
  let weaponSVG = "";
  let headSVG = "";
  let eyesSVG = "";
  let antennaSVG = "";
  let hatSVG = "";
  let accSVG = "";
  
  // WINGS (Behind torso) — legacy IDs + Merceria set items (w_*)
  const isMercWing = typeof ITEM_CATALOG !== "undefined" && ITEM_CATALOG.find(x => x.id === r.wing && x.slot === "wings");
  if (r.wing === "aLatta") {
    wingsSVG = `<path d="M58 92 L14 58 Q28 90 24 124 L58 110 Z" fill="#8fa8b5" stroke="#5a707c" stroke-width="1.5"/><path d="M142 92 L186 58 Q172 90 176 124 L142 110 Z" fill="#8fa8b5" stroke="#5a707c" stroke-width="1.5"/>`;
  } else if (r.wing === "aPiume") {
    wingsSVG = `<path d="M60 94 Q16 72 24 48 Q42 62 48 86 L60 98 Z" fill="#e8f2f8" stroke="#90b8d0" stroke-width="1.5"/><path d="M140 94 Q184 72 176 48 Q158 62 152 86 L140 98 Z" fill="#e8f2f8" stroke="#90b8d0" stroke-width="1.5"/>`;
  } else if (r.wing === "aFerro") {
    wingsSVG = `<path d="M58 94 L22 54 L36 104 L66 126 Z" fill="#8a6c3a" stroke="#473516" stroke-width="2"/><path d="M142 94 L178 54 L164 104 L134 126 Z" fill="#8a6c3a" stroke="#473516" stroke-width="2"/>`;
  } else if (r.wing === "w_vesuvio" || r.wing === "aVesuvio") {
    wingsSVG = `<path d="M56 96 C16 70 18 36 50 30 C70 44 64 82 78 112 Z" fill="${c2}" stroke="#ff4824" stroke-width="2" filter="drop-shadow(0 0 6px #ff4824)"/><path d="M144 96 C184 70 182 36 150 30 C130 44 136 82 122 112 Z" fill="${c2}" stroke="#ff4824" stroke-width="2" filter="drop-shadow(0 0 6px #ff4824)"/>`;
  } else if (r.wing === "w_frutiger" || r.wing === "aQuantica") {
    // Reduced FX: no blur filter, flat glow circles
    wingsSVG = `<g fill="#bdf2ff" opacity="0.85"><circle cx="192" cy="70" r="12"/><circle cx="172" cy="52" r="8"/><circle cx="8" cy="70" r="12"/><circle cx="28" cy="52" r="8"/></g>`;
  } else if (r.wing === "w_enforcer") {
    wingsSVG = `<path d="M58 92 L18 64 L30 110 L60 118 Z" fill="#6a7480" stroke="#3c444e" stroke-width="2.5"/><path d="M142 92 L182 64 L170 110 L140 118 Z" fill="#6a7480" stroke="#3c444e" stroke-width="2.5"/>`;
  } else if (isMercWing) {
    // Generic fallback for any future Merceria wings
    wingsSVG = `<path d="M58 94 Q20 70 28 46 L60 96 Z" fill="${c2}" stroke="${sh2(0.6)}" stroke-width="1.5"/><path d="M142 94 Q180 70 172 46 L140 96 Z" fill="${c2}" stroke="${sh2(0.6)}" stroke-width="1.5"/>`;
  }
  
  // EFFECTS (Behind body) — reduced FX for framerate: fewer elements, no heavy blur
  if (r.fx === "f_frutiger") {
    fxSVG = `<circle cx="100" cy="116" r="80" fill="#7fd4ff" opacity="0.10"/><circle cx="100" cy="116" r="55" fill="#7fd4ff" opacity="0.08"/>`;
  } else if (r.fx === "fxAura") {
    fxSVG = `<circle cx="100" cy="116" r="80" fill="${c2}" opacity="0.12"/>`;
  } else if (r.fx === "fxCappa") {
    fxSVG = `<path d="M66 102 Q100 132 134 104 L130 172 Q100 190 70 174 Z" fill="#2d101e" stroke="#871a2a" stroke-width="2"/>`;
  } else if (r.fx === "fxHalo") {
    fxSVG = `<ellipse cx="100" cy="42" rx="42" ry="13" fill="#ffd76a" opacity="0.75"/>`;
  } else if (r.fx === "fxScintille") {
    fxSVG = `<g fill="#ffe9a8"><circle cx="46" cy="32" r="3"/><circle cx="156" cy="26" r="2.5"/></g>`;
  } else if (r.fx === "fxFiori") {
    fxSVG = `<g fill="#ff7ab6" opacity="0.85"><ellipse cx="52" cy="166" rx="4" ry="2.5"/><ellipse cx="148" cy="182" rx="4" ry="2.5"/></g>`;
  } else if (typeof ITEM_CATALOG !== "undefined" && ITEM_CATALOG.find(x => x.id === r.fx && x.slot === "fx")) {
    // Generic Merceria FX — subtle single ring
    fxSVG = `<circle cx="100" cy="116" r="76" fill="none" stroke="${c2}" stroke-width="2" opacity="0.35"/>`;
  }
  
  // LEGS
  const isEnforce = r.chassis === "enforce";
  const isMario = r.chassis === "mario";
  if (isEnforce) {
    legsSVG = `<rect x="74" y="174" width="22" height="44" fill="${sh1(0.7)}" rx="5"/><rect x="106" y="174" width="22" height="44" fill="${sh1(0.7)}" rx="5"/><rect x="64" y="214" width="34" height="12" fill="#18202c" rx="4"/><rect x="104" y="214" width="34" height="12" fill="#18202c" rx="4"/>`;
  } else if (isMario) {
    legsSVG = `<rect x="82" y="184" width="14" height="28" fill="${sh1(0.85)}" rx="4"/><rect x="104" y="184" width="14" height="28" fill="${sh1(0.85)}" rx="4"/><ellipse cx="89" cy="214" rx="13" ry="5" fill="#18202c"/><ellipse cx="111" cy="214" rx="13" ry="5" fill="#18202c"/>`;
  } else {
    legsSVG = `<rect x="78" y="178" width="18" height="34" fill="${sh1(0.8)}" rx="4"/><rect x="104" y="178" width="18" height="34" fill="${sh1(0.8)}" rx="4"/><ellipse cx="87" cy="214" rx="15" ry="6" fill="#141c28"/><ellipse cx="113" cy="214" rx="15" ry="6" fill="#141c28"/>`;
  }
  
  // BODY & ARMS
  if (isEnforce) {
    bodySVG = `<rect x="52" y="96" width="96" height="84" rx="10" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="3"/><rect x="42" y="88" width="26" height="24" fill="${sh1(0.7)}" rx="6"/><rect x="132" y="88" width="26" height="24" fill="${sh1(0.7)}" rx="6"/><circle cx="100" cy="132" r="15" fill="${c2}" stroke="${sh2(0.6)}" stroke-width="2"/><circle cx="100" cy="132" r="7" fill="${ec}" filter="drop-shadow(0 0 6px ${ec})"/>`;
    armsSVG = `<rect x="40" y="102" width="20" height="54" rx="7" fill="${sh1(0.85)}"/><rect x="140" y="102" width="20" height="54" rx="7" fill="${sh1(0.85)}"/>`;
  } else if (isMario) {
    bodySVG = `<rect x="72" y="106" width="56" height="72" rx="8" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="2"/><circle cx="100" cy="146" r="13" fill="${c2}" stroke="${sh2(0.6)}" stroke-width="2"/><circle cx="100" cy="146" r="5" fill="${ec}"/>`;
    armsSVG = `<rect x="52" y="112" width="16" height="50" rx="5" fill="${sh1(0.85)}"/><rect x="132" y="112" width="16" height="50" rx="5" fill="${sh1(0.85)}"/>`;
  } else {
    bodySVG = `<rect x="66" y="100" width="68" height="78" rx="12" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="2"/><circle cx="100" cy="136" r="14" fill="${c2}" stroke="${sh2(0.6)}" stroke-width="2"/><circle cx="100" cy="136" r="6" fill="${ec}" filter="drop-shadow(0 0 6px ${ec})"/>`;
    armsSVG = `<rect x="46" y="106" width="18" height="60" rx="7" fill="${sh1(0.85)}"/><rect x="136" y="106" width="18" height="60" rx="7" fill="${sh1(0.85)}"/>`;
  }
  
  // WEAPONS
  if (r.weapon === "chia") {
    weaponSVG = `<rect x="150" y="122" width="42" height="8" rx="3" fill="#aab" stroke="#687280" stroke-width="1.5"/><circle cx="193" cy="126" r="13" fill="none" stroke="#aab" stroke-width="4"/>`;
  } else if (r.weapon === "spad") {
    weaponSVG = `<rect x="156" y="96" width="8" height="86" rx="3" fill="#5ff5c5" transform="rotate(-18 160 140)" filter="drop-shadow(0 0 8px #5ff5c5)"/><rect x="150" y="138" width="22" height="6" fill="#ffd76a" transform="rotate(82 160 138)"/>`;
  } else if (r.weapon === "pist") {
    weaponSVG = `<rect x="148" y="124" width="40" height="12" rx="3" fill="#2d3748"/><rect x="180" y="134" width="10" height="20" rx="2" fill="#4a5568"/><rect x="148" y="127" width="8" height="4" fill="${ec}" filter="drop-shadow(0 0 4px ${ec})"/>`;
  }
  
  // HEAD
  if (isEnforce) {
    headSVG = `<rect x="70" y="18" width="60" height="58" rx="9" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="2"/><rect x="60" y="12" width="18" height="20" rx="4" fill="${sh1(0.7)}"/><rect x="122" y="12" width="18" height="20" rx="4" fill="${sh1(0.7)}"/>`;
  } else if (isMario) {
    headSVG = `<path d="M72 66 L74 24 Q100 12 126 24 L128 66 Z" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="2"/><rect x="80" y="28" width="40" height="22" rx="4" fill="#061208"/><text x="100" y="44" font-family="monospace" font-size="9" fill="#5ff5c5" text-anchor="middle">0x00</text>`;
  } else {
    headSVG = `<rect x="74" y="20" width="52" height="56" rx="16" fill="${c1}" stroke="${sh1(0.5)}" stroke-width="2"/>`;
  }
  
  // ANTENNA — legacy + Merceria (a_sistema)
  if (r.antenna === "a_sistema") {
    antennaSVG = `<line x1="100" y1="20" x2="100" y2="0" stroke="#bb86fc" stroke-width="2.5"/><circle cx="100" cy="0" r="5" fill="#bb86fc"/>`;
  } else if (r.antenna === "p") {
    antennaSVG = `<line x1="100" y1="20" x2="100" y2="2" stroke="#99a" stroke-width="2"/><circle cx="100" cy="0" r="4" fill="${ec}" filter="drop-shadow(0 0 4px ${ec})"/>`;
  } else if (r.antenna === "g") {
    antennaSVG = `<line x1="100" y1="20" x2="100" y2="0" stroke="#99a" stroke-width="3"/><line x1="100" y1="12" x2="112" y2="4" stroke="#99a" stroke-width="2"/><line x1="100" y1="12" x2="88" y2="4" stroke="#99a" stroke-width="2"/>`;
  } else if (r.antenna === "d") {
    antennaSVG = `<line x1="100" y1="20" x2="100" y2="2" stroke="#99a" stroke-width="2"/><path d="M92 6 a14 8 0 0 1 10 0 a14 8 0 0 0 -10 0 z" fill="${c2}" transform="rotate(-60 100 4)"/>`;
  }
  
  // HAT — legacy + Merceria (h_*)
  if (r.hat === "b") {
    hatSVG = `<path d="M68 22 q32 -18 64 0 q0 8 -32 8 q-32 0 -32 -8 z" fill="${c2}"/>`;
  } else if (r.hat === "c" || r.hat === "h_mafia") {
    hatSVG = `<path d="M72 26 q28 -12 56 0 q0 12 -28 12 q-28 0 -28 -12 z" fill="#1c2533"/><rect x="86" y="26" width="28" height="5" fill="#111"/>`;
  } else if (r.hat === "boss") {
    hatSVG = `<ellipse cx="100" cy="20" rx="38" ry="7" fill="#111824"/><path d="M84 2 h26 v22 q-13 10 -26 0 z" fill="#111824"/><rect x="90" y="4" width="14" height="5" fill="${c2}"/>`;
  } else if (r.hat === "h_vesuvio") {
    hatSVG = `<path d="M70 24 L86 2 L96 16 L106 4 L118 20 L130 10 L132 26 q-32 14 -62 -2 z" fill="#c41f0f" stroke="#ff8c3a" stroke-width="2"/>`;
  } else if (r.hat === "h_frutiger") {
    // Aureola Aurora — reduced FX: flat ellipse
    hatSVG = `<ellipse cx="100" cy="18" rx="40" ry="10" fill="none" stroke="#7fe6c5" stroke-width="4" opacity="0.8"/>`;
  }
  
  // EYES — legacy + Merceria (e_*)
  if (r.eyes === "visore") {
    eyesSVG = `<rect x="83" y="42" width="34" height="15" rx="7" fill="${ec}" stroke="#0a141c" stroke-width="2"/><rect x="88" y="45" width="8" height="5" fill="#ffffff" opacity="0.6"/>`;
  } else if (r.eyes === "due") {
    eyesSVG = `<ellipse cx="90" cy="48" rx="9" ry="8" fill="${ec}" stroke="#0a141c" stroke-width="2"/><ellipse cx="110" cy="48" rx="9" ry="8" fill="${ec}" stroke="#0a141c" stroke-width="2"/>`;
  } else if (r.eyes === "mono") {
    eyesSVG = `<circle cx="100" cy="48" r="15" fill="#10141c" stroke="${c2}" stroke-width="3"/><circle cx="100" cy="48" r="6" fill="${ec}"/>`;
  } else if (r.eyes === "crt") {
    eyesSVG = `<rect x="80" y="36" width="40" height="24" rx="5" fill="#041208"/><path d="M85 50 l6 -8 l6 14 l5 -12 l4 8 h8" fill="none" stroke="#5ff5c5" stroke-width="2"/>`;
  } else if (r.eyes === "e_enforcer") {
    // Visore Tattico
    eyesSVG = `<rect x="78" y="42" width="44" height="14" rx="4" fill="#101820" stroke="#3c6a50" stroke-width="2"/><rect x="82" y="45" width="36" height="3" fill="#5ff585"/>`;
  } else if (r.eyes === "e_mafia") {
    // Fessure Ambrate
    eyesSVG = `<path d="M84 46 h22 v7 h-22 z M104 46 h14 v7 h-14 z" fill="#ffb020" stroke="#0a141c" stroke-width="1.5"/>`;
  } else if (r.eyes === "e_sistema") {
    // Visore 0x00
    eyesSVG = `<rect x="80" y="38" width="40" height="20" rx="4" fill="#04101a" stroke="#bb86fc" stroke-width="2"/><text x="100" y="52" font-family="monospace" font-size="10" fill="#bb86fc" text-anchor="middle">👁</text>`;
  }
  
  // ACCESSORIES
  if (r.acc === "grem") {
    accSVG = `<path d="M74 112 q26 10 52 0 v44 q-26 8 -52 -6 z" fill="#ffe28f" stroke="#b8860b" stroke-width="2"/>`;
  } else if (r.acc === "attx") {
    accSVG = `<rect x="62" y="112" width="76" height="20" rx="4" fill="#5a3a20"/><rect x="70" y="108" width="16" height="7" fill="#8a6a3a"/><rect x="92" y="108" width="16" height="7" fill="#8a6a3a"/><rect x="114" y="108" width="12" height="7" fill="#8a6a3a"/>`;
  } else if (r.acc === "sun") {
    accSVG = `<rect x="82" y="40" width="36" height="15" rx="5" fill="#0a0a0a" opacity="0.85" stroke="#333" stroke-width="1"/>`;
  } else if (r.acc === "oro") {
    accSVG = `<path d="M82 98 q18 24 36 0" fill="none" stroke="#ffd76a" stroke-width="4"/><circle cx="100" cy="122" r="7" fill="#ffd76a" stroke="#b8860b" stroke-width="1.5"/>`;
  }
  
  return `<svg viewBox="0 0 200 230" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="224" rx="58" ry="7" fill="#000000" opacity="0.4"/>
    ${wingsSVG}${fxSVG}${legsSVG}${bodySVG}${armsSVG}${weaponSVG}${headSVG}${antennaSVG}${hatSVG}${eyesSVG}${accSVG}
  </svg>`;
}
