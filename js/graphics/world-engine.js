/**
 * VESUVIO.EXE - World Engine & Interactive Background
 * Fullscreen animated environment, frequent clickable magma drops, walkers,
 * volcanic eruptions, dynamic city life (smoke, drones, flickering windows)
 */
"use strict";

let worldTickerInterval = null;
let lavaDropSpawnTimer = null;
let cityLifeInterval = null;

function initWorldEngine() {
  initEmbers();
  initCityWindows();
  refreshWorldBots();
  startWorldEvents();
  setupInteractiveLayer();
}

function initEmbers() {
  const em = document.getElementById("embers");
  if (!em) return;
  em.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const d = document.createElement("div");
    d.className = "ember";
    d.style.left = Math.random() * 100 + "%";
    d.style.setProperty("--dx", (Math.random() * 180 - 90) + "px");
    d.style.animationDuration = (7 + Math.random() * 10) + "s";
    d.style.animationDelay = (Math.random() * 8) + "s";
    d.style.transform = `scale(${0.4 + Math.random() * 0.9})`;
    em.appendChild(d);
  }
}

// BLINKING WINDOWS ON RUINED SKYLINE
function initCityWindows() {
  const bg = document.getElementById("worldbg");
  if (!bg || bg.querySelector(".cwindow")) return;
  
  // Windows positioned over the ruined buildings (matches SVG skyline %)
  const windowSpots = [
    { x: 17.5, y: 74 }, { x: 18.5, y: 78 }, { x: 27, y: 65 }, { x: 28.5, y: 70 },
    { x: 44, y: 76 }, { x: 45.5, y: 80 }, { x: 56.5, y: 81 }, { x: 57.5, y: 84 },
    { x: 78, y: 69 }, { x: 79.5, y: 74 }, { x: 90, y: 58 }, { x: 91, y: 63 },
    { x: 104, y: 66 }, { x: 105.5, y: 71 }, { x: 116, y: 79 }, { x: 117, y: 83 },
    { x: 127, y: 61 }, { x: 128.5, y: 66 }, { x: 139, y: 73 }, { x: 140.5, y: 77 }
  ];
  
  windowSpots.forEach((spot, i) => {
    if (spot.x > 100) return; // skip out-of-bounds
    const w = document.createElement("div");
    w.className = "cwindow";
    w.style.left = spot.x + "%";
    w.style.top = spot.y + "%";
    w.style.animationDelay = (i * 0.7) + "s";
    w.style.animationDuration = (4 + Math.random() * 6) + "s";
    bg.appendChild(w);
  });
}

function refreshWorldBots() {
  const layer = document.getElementById("botsLayer");
  if (!layer) return;
  
  let totalGenerators = 0;
  if (S.gen) {
    totalGenerators = Object.values(S.gen).reduce((a, b) => a + b, 0);
  }
  
  const targetCount = Math.min(12, totalGenerators);
  
  while (layer.children.length < targetCount) {
    const d = document.createElement("div");
    d.className = "bot";
    const hue = Math.floor(Math.random() * 360);
    d.innerHTML = `<svg viewBox="0 0 24 30" width="22" height="30">
      <rect x="6" y="2" width="12" height="10" rx="3" fill="hsl(${hue}, 65%, 55%)"/>
      <rect x="9" y="5" width="6" height="4" fill="#061208"/>
      <circle cx="11" cy="7" r="1.5" fill="#5ff5c5"/>
      <rect x="4" y="12" width="16" height="8" rx="2" fill="hsl(${hue + 40}, 75%, 60%)"/>
      <rect x="9" y="20" width="3" height="6" rx="1" fill="#8ca0b5"/>
      <rect x="13" y="20" width="3" height="6" rx="1" fill="#8ca0b5"/>
    </svg>`;
    d.style.animationDuration = (7 + Math.random() * 8) + "s";
    d.style.animationDelay = (-Math.random() * 12) + "s";
    layer.appendChild(d);
  }
  
  while (layer.children.length > targetCount) {
    layer.removeChild(layer.lastChild);
  }
}

function startWorldEvents() {
  if (worldTickerInterval) clearInterval(worldTickerInterval);
  // Reduced FX for framerate: explosions less frequent
  worldTickerInterval = setInterval(() => {
    triggerVolcanicExplosion();
  }, 5200); // was 2600
  
  if (lavaDropSpawnTimer) clearTimeout(lavaDropSpawnTimer);
  scheduleNextLavaDrop();
  
  // CITY LIFE: fewer smoke puffs (main framerate killer)
  if (cityLifeInterval) clearInterval(cityLifeInterval);
  cityLifeInterval = setInterval(spawnCitySmoke, 5000); // was 1800
  setInterval(spawnDrone, 30000); // was 22000
  setTimeout(spawnDrone, 8000);
}

// CAP on simultaneous ambient particles — keeps the compositor cheap
function countAmbientFX() {
  return document.querySelectorAll(".smoke, .boom, .drone").length;
}

function triggerVolcanicExplosion() {
  const layer = document.getElementById("boomLayer");
  if (!layer) return;
  
  const prod = typeof calcProd === "function" ? calcProd() : 0;
  const intensity = Math.min(1, Math.log10(prod + 1) / 8);
  
  if (Math.random() < 0.4 + intensity * 0.5) {
    const b = document.createElement("div");
    b.className = "boom";
    b.style.left = (Math.random() * (window.innerWidth - 80) + 40) + "px";
    b.style.top = (Math.random() * (window.innerHeight - 120) + 40) + "px";
    layer.appendChild(b);
    setTimeout(() => b.remove(), 850);
    
    // Explosions often eject a collectable magma drop!
    if (Math.random() < 0.35) {
      setTimeout(() => spawnLavaDrop(), 300);
    }
  }
}

// CITY SMOKE PUFFS from chimney & ruins
function spawnCitySmoke() {
  const bg = document.getElementById("worldbg");
  if (!bg) return;
  if (countAmbientFX() > 8) return; // FX cap for framerate
  
  const spots = [
    { x: 90.5, base: 82 },   // chimney top
    { x: 16, base: 60 },     // ruin vents
    { x: 52, base: 68 },
    { x: 87, base: 50 }      // vesuvio flank
  ];
  
  const s = spots[Math.floor(Math.random() * spots.length)];
  const puff = document.createElement("div");
  puff.className = "smoke";
  puff.style.left = (s.x + (Math.random() * 2 - 1)) + "%";
  puff.style.top = s.base + "%";
  bg.appendChild(puff);
  setTimeout(() => puff.remove(), 9000);
}

// PATROL DRONES crossing the sky
function spawnDrone() {
  if (document.hidden) return;
  const drone = document.createElement("div");
  drone.className = "drone";
  drone.style.top = (8 + Math.random() * 25) + "%";
  const duration = (14 + Math.random() * 10) + "s";
  drone.style.animationDuration = duration;
  document.body.appendChild(drone);
  setTimeout(() => drone.remove(), parseFloat(duration) * 1000 + 1000);
}

// ==================== INTERACTIVE CLICKABLE MAGMA DROPS ====================
function setupInteractiveLayer() {
  let layer = document.getElementById("interactiveLayer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "interactiveLayer";
    document.body.appendChild(layer);
  }
}

function scheduleNextLavaDrop() {
  // Much more frequent now: every 6-14 seconds
  const nextDelay = (6 + Math.random() * 8) * 1000;
  lavaDropSpawnTimer = setTimeout(() => {
    // Sometimes spawn a burst of 2-3 drops!
    const burst = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < burst; i++) {
      setTimeout(() => spawnLavaDrop(), i * 400);
    }
    scheduleNextLavaDrop();
  }, nextDelay);
}

function spawnLavaDrop() {
  const layer = document.getElementById("interactiveLayer");
  if (!layer) return;
  if (layer.children.length > 3) return; // reduced cap on-screen drops
  
  const drop = document.createElement("div");
  drop.className = "lava-drop";
  drop.style.width = (38 + Math.random() * 14) + "px";
  drop.style.height = drop.style.width;
  
  const icons = ["🔥", "🌋", "⚡", "✨", "💎"];
  const type = icons[Math.floor(Math.random() * icons.length)];
  drop.innerHTML = type;
  drop.dataset.dropType = type;
  
  const startX = Math.random() * (window.innerWidth - 140) + 60;
  const startY = Math.random() * (window.innerHeight - 260) + 150;
  
  drop.style.left = startX + "px";
  drop.style.top = startY + "px";
  
  drop.onclick = (e) => {
    e.stopPropagation();
    collectLavaDrop(drop, startX, startY, type);
  };
  
  layer.appendChild(drop);
  
  setTimeout(() => {
    if (drop.parentNode) drop.remove();
  }, 4200);
}

function collectLavaDrop(element, x, y, type) {
  if (!element.parentNode) return;
  element.remove();
  
  if (typeof sLavaDrop === "function") sLavaDrop();
  
  S.stats.lavaDropsCollected = (S.stats.lavaDropsCollected || 0) + 1;
  
  let label = "";
  const dps = typeof totalDPS === "function" ? totalDPS() : 10;
  const prod = typeof calcProd === "function" ? calcProd() : 10;
  
  if (type === "🔥") {
    const lireGains = Math.round(prod * 45 + dps * 25 + 800);
    S.lire += lireGains;
    S.totalLire += lireGains;
    label = `+${fmt(lireGains)} Lire!`;
  } else if (type === "⚡") {
    if (typeof addBuff === "function") {
      addBuff("dmg", 2.5, 20, "FRENZIA MAGMATICA");
      label = "×2.5 Danno Click (20s)!";
    }
  } else if (type === "✨") {
    const rottamiGains = Math.floor(Math.random() * 35) + 15;
    S.rottami += rottamiGains;
    label = `+${rottamiGains} Rottami!`;
  } else if (type === "💎") {
    if (Math.random() < 0.40) {
      S.biglietti = (S.biglietti || 0) + 1;
      label = "+1 🎟️ Biglietto Raro!";
      if (typeof sTicket === "function") sTicket();
    } else {
      S.rottami += 60;
      label = "+60 Rottami Preziosi!";
    }
  } else {
    S.heat = Math.min(S.heatMax, (S.heat || 0) + 45);
    label = "+45% Calore Sovraccarico!";
  }
  
  const pop = document.createElement("div");
  pop.className = "lava-drop-pop";
  pop.textContent = label;
  pop.style.left = (x - 30) + "px";
  pop.style.top = y + "px";
  pop.style.position = "fixed";
  pop.style.zIndex = "200";
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 850);
  
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
}
