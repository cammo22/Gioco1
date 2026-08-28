/**
 * VESUVIO.EXE - Upgrades, Infinite Chains, Bots & Bulk Generator Buys
 * Limited upgrades only exist to UNLOCK infinite chains — everything else scales forever
 */
"use strict";

const GENS = [
  { id: "aut", name: "Piccolo Automa", icon: "🤖", desc: "Lucidatore devoto, estrae calore dal suolo.", base: 14, prod: 0.5 },
  { id: "lav", name: "La Lavandaia", icon: "🧽", desc: "Ti pulisce dentro e fuori, e ripulisce i circuiti.", base: 140, prod: 3.2 },
  { id: "bar", name: "Il Barista", icon: "☕", desc: "Caffè bollente di lava e informazioni preziose.", base: 1500, prod: 22 },
  { id: "pacc", name: "Pacco il Corriere", icon: "📦", desc: "Consegna lire e accumulatori in ogni vicolo.", base: 14000, prod: 135 },
  { id: "mec", name: "'O Meccanico", icon: "🔧", desc: "Ripara e raddrizza i generatori senza giudicare.", base: 150000, prod: 850 },
  { id: "pesc", name: "Il Pescatore", icon: "🎣", desc: "Estrae metalli fusi dalle profondità del golfo.", base: 1.6e6, prod: 5200 },
  { id: "art", name: "L'Artista", icon: "🎨", desc: "Plasma sculture termiche che generano energia.", base: 1.8e7, prod: 34000 },
  { id: "carm", name: "La Cartomante", icon: "🔮", desc: "Legge le correnti magmatiche e predice flussi.", base: 2.1e8, prod: 220000 },
  { id: "circ", name: "Don Circuito", icon: "⛪", desc: "Ex prete, benedice gli alternatori del quartiere.", base: 2.4e9, prod: 1.5e6 },
  { id: "ros", name: "Zia Rosetta", icon: "👵", desc: "Conosce ogni conduttura segreta sotto Napoli.", base: 2.8e10, prod: 1.05e7 },
  { id: "maf", name: "Robomafioso", icon: "🕶️", desc: "Due fessure ambrate, calmo e molto produttivo.", base: 3.4e11, prod: 7.2e7 },
  { id: "enf", name: "Enforcer di Quartiere", icon: "🛡️", desc: "Pattuglia le fonderie e garantisce produzione.", base: 4.2e12, prod: 5.2e8 },
  { id: "squ", name: "Squalo del Golfo", icon: "🦈", desc: "Cacciatore oceanico che incanala le maree di lava.", base: 5.5e13, prod: 4.0e9 },
  { id: "sfe", name: "Sfera Cromata", icon: "⚪", desc: "Manifestazione di sinteticoMC. Domina la rete.", base: 7.2e14, prod: 3.2e10 }
];

// AUTOMATION BOTS — INFINITE levels, milestone rewards every 25 total levels
const UBOT = [
  { id: "ab1", name: "Automa Attaccante", desc: "+1 colpo automatico/s", icon: "🤖", base: 10000, grow: 1.32, val: 1 },
  { id: "ab2", name: "Batteria di Rottame", desc: "+2 colpi automatici/s", icon: "🔋", base: 250000, grow: 1.36, val: 2 },
  { id: "ab3", name: "Sniper del Vicolo", desc: "+4 colpi automatici/s", icon: "🎯", base: 5e6, grow: 1.42, val: 4 },
  { id: "ab4", name: "Plotone Enforcer", desc: "+8 colpi automatici/s", icon: "🪖", base: 2e8, grow: 1.46, val: 8 },
  { id: "ab5", name: "Armata della Sfera", desc: "+16 colpi automatici/s", icon: "👽", base: 1.2e10, grow: 1.52, val: 16 }
];

// ==================== ABILITÀ SPECIALE AUTOMA (Lv.100 totale) ====================
// Quando gli automi raggiungono 100 livelli totali si sblocca il PROTOCOLO VESUVIO:
// un'abilità attivabile/disattivabile che fa danno devastante mentre è attiva.
const ULT_UNLOCK_LEVEL = 100;
let ultTickTimer = null;

function totalBotLevelsForUlt() { return typeof totalBotLevels === "function" ? totalBotLevels() : 0; }

function isUltUnlocked() {
  return (S.ultUnlocked || totalBotLevelsForUlt() >= ULT_UNLOCK_LEVEL);
}

function ultCooldownRemaining() {
  return Math.max(0, Math.ceil(((S.ultReadyAt || 0) - Date.now()) / 1000));
}

function isUltActive() {
  return !!(S.ultActiveUntil && S.ultActiveUntil > Date.now());
}

function toggleUlt() {
  if (!isUltUnlocked()) {
    if (typeof toast === "function") toast("🔒", "Protocollo Bloccato", `Sbloccato a ${ULT_UNLOCK_LEVEL} livelli automa totali.`);
    return;
  }
  
  if (isUltActive()) {
    // Manual deactivation
    S.ultActiveUntil = 0;
    stopUltTicker();
    if (typeof toast === "function") toast("⏹️", "PROTOCOLO VESUVIO SPENTO", "Gli automi tornano in modalità standard.");
    renderUltButton();
    saveGame();
    return;
  }
  
  const cd = ultCooldownRemaining();
  if (cd > 0) {
    if (typeof sErr === "function") sErr();
    if (typeof toast === "function") toast("⏳", "In Ricarica", `Protocollo pronto tra ${cd}s.`);
    return;
  }
  
  // ACTIVATE — devastating damage phase
  const durSec = 12;
  S.ultActiveUntil = Date.now() + durSec * 1000;
  S.ultReadyAt = Date.now() + 60000; // 60s cooldown from activation
  if (typeof sOvercharge === "function") sOvercharge();
  if (typeof addBuff === "function") addBuff("dmg", 10, durSec, "PROTOCOLO VESUVIO");
  startUltTicker();
  if (typeof toast === "function") toast("☄️", "☄️ PROTOCOLO VESUVIO!", `Danno ×10 per ${durSec}s — gli automi sparano a raffica!`, { dur: 4000 });
  renderUltButton();
  saveGame();
}

// While active, the protocol fires heavy automated strikes on its own
function startUltTicker() {
  stopUltTicker();
  ultTickTimer = setInterval(() => {
    if (!isUltActive()) { stopUltTicker(); renderUltButton(); return; }
    if (S.down || typeof executeAttack !== "function") return;
    // 15 extra strikes/sec while active
    for (let i = 0; i < 15; i++) executeAttack(true, null);
  }, 1000);
}

function stopUltTicker() {
  if (ultTickTimer) { clearInterval(ultTickTimer); ultTickTimer = null; }
}

function renderUltButton() {
  let btn = document.getElementById("ultBtn");
  if (!btn) {
    const host = document.getElementById("playerBar");
    if (!host) return;
    btn = document.createElement("div");
    btn.id = "ultBtn";
    host.appendChild(btn);
    btn.onclick = toggleUlt;
  }
  
  if (!isUltUnlocked()) {
    btn.style.display = "none";
    return;
  }
  btn.style.display = "";
  
  const active = isUltActive();
  const cd = ultCooldownRemaining();
  btn.className = "ultBtn" + (active ? " active" : (cd > 0 ? " cooldown" : " ready"));
  btn.textContent = active
    ? `☄️ PROTOCOLLO ATTIVO (${Math.ceil((S.ultActiveUntil - Date.now()) / 1000)}s) — CLICCA PER STOPPARLO`
    : (cd > 0 ? `☄️ PROTOCOLO VESUVIO · ${cd}s` : "☄️ PROTOCOLO VESUVIO — PRONTO!");
}

// CLICK UPGRADES — PHASE 1 (limited → unlocks Phase 2)
const UCLICK_PHASE1 = [
  { id: "cv1", name: "Vigore Meccanico", desc: "Danno click ×2", cost: 2500, icon: "🔨", val: 2 },
  { id: "cv2", name: "Dita d'Acciaio", desc: "Danno click ×3", cost: 1.5e5, icon: "🦾", val: 3 },
  { id: "cv3", name: "Pugno del Capitano", desc: "Danno click ×4", cost: 2e7, icon: "👊", val: 4 },
  { id: "cv4", name: "Sisma della Sfera", desc: "Danno click ×6", cost: 2.5e10, icon: "💥", val: 6 },
  { id: "cv5", name: "Detonatore Termico", desc: "Danno click ×8", cost: 4e12, icon: "🧨", val: 8 },
  { id: "cv6", name: "Dito Omnilume", desc: "Danno click ×12", cost: 6e13, icon: "🫰", val: 12 }
];

// CLICK PHASE 2 — SINTONIA DI SILICIO (limited → unlocks ♾️ Sintonia Infinita)
const UCLICK_PHASE2 = [
  { id: "cv7", name: "Furia Frutiger Aero", desc: "Danno click ×18 · Fase 2", cost: 1e14, icon: "🌈", val: 18 },
  { id: "cv8", name: "Onda Quantica", desc: "Danno click ×25 · Fase 2", cost: 8e14, icon: "🌊", val: 25 },
  { id: "cv9", name: "Cuore del Vesuvio", desc: "Danno click ×40 · Fase 2", cost: 5e15, icon: "🌋", val: 40 },
  { id: "cv10", name: "Dominio di sinteticoMC", desc: "Danno click ×100 · Fase 2 finale — sblocca ♾️ Sintonia Infinita", cost: 5e16, icon: "👁️", val: 100 }
];

const UPROD = [
  { id: "pu1", name: "Scintilla Y2K", desc: "Produzione +25% · completando tutti sblocca ♾️ Overdrive", cost: 1.5e4, icon: "✨", val: 1.25 },
  { id: "pu2", name: "Patina Lucida", desc: "Produzione +50%", cost: 3e5, icon: "🪩", val: 1.5 },
  { id: "pu3", name: "Reflex a Bolla", desc: "Produzione +75%", cost: 7e6, icon: "🫧", val: 1.75 },
  { id: "pu4", name: "Cromature a Specchio", desc: "Produzione +100%", cost: 2e8, icon: "🪞", val: 2 },
  { id: "pu5", name: "Riflesso Acqua e Vetro", desc: "Produzione +150%", cost: 8e9, icon: "💧", val: 2.5 },
  { id: "pu6", name: "Bloom e Bagliori", desc: "Produzione +250%", cost: 4e11, icon: "☀️", val: 3.5 },
  { id: "pu7", name: "Lens Flare Divino", desc: "Produzione +400%", cost: 3e13, icon: "🌈", val: 5 }
];

const UCRIT = [
  { id: "uc1", name: "Fortuna di Gamba", desc: "Critico +5%", cost: 5000, icon: "🍀", val: 0.05 },
  { id: "uc2", name: "Cenere del Fortunato", desc: "Critico +10%", cost: 2.5e6, icon: "🌫️", val: 0.10 },
  { id: "uc3", name: "Benedizione di Don Circuito", desc: "Critico +15%", cost: 4e9, icon: "✝️", val: 0.15 },
  { id: "uc4", name: "Occhio di Ruggine", desc: "Critico +20% — completa per ♾️ Occhio Infinito", cost: 3e12, icon: "👁️", val: 0.20 }
];

const UOFF = [
  { id: "uoff1", name: "Raffreddamento Notte", desc: "Ricordo Offline +50%", cost: 2e5, icon: "🌙", val: 0.5 },
  { id: "uoff2", name: "Vigile del Vesuvio", desc: "Ricordo Offline +100%", cost: 5e7, icon: "⭐", val: 1.0 },
  { id: "uoff3", name: "Guardia del Golfo", desc: "Ricordo Offline +200% — completa per ♾️ Memoria Assoluta", cost: 1.5e10, icon: "🛰️", val: 2.0 }
];

// VITA MAX — catena infinita dedicata alla sopravvivenza
const UHP = [
  { id: "uhp1", name: "Piastre Rinforzate", desc: "+50% Energia Max", cost: 8000, icon: "🛡️", val: 0.5 },
  { id: "uhp2", name: "Corazzatura del Golfo", desc: "+75% Energia Max", cost: 4e5, icon: "🧱", val: 0.75 },
  { id: "uhp3", name: "Nucleo di Titanio", desc: "+100% Energia Max", cost: 2e7, icon: "💠", val: 1.0 },
  { id: "uhp4", name: "Scudo di Lava Solidificata", desc: "+150% Energia Max", cost: 9e8, icon: "🌋", val: 1.5 },
  { id: "uhp5", name: "Scheletro Adamantio", desc: "+250% Energia Max — completa per ♾️ Cuore Indistruttibile", cost: 5e10, icon: "⛓️", val: 2.5 }
];

// Rigenerazione energia
const UREGEN = [
  { id: "ureg1", name: "Nanomacchina Riparatrice", desc: "Rigenerazione ×2", cost: 15000, icon: "🩹", val: 2 },
  { id: "ureg2", name: "Campo Rigenerativo", desc: "Rigenerazione ×3", cost: 8e6, icon: "💚", val: 3 },
  { id: "ureg3", name: "Fonte del Golfo", desc: "Rigenerazione ×5", cost: 6e9, icon: "⛲", val: 5 }
];

// STAT TREES — INFINITE ranks with soft-capped effects
const STAT_TREES = [
  {
    key: "multistrike",
    name: "Cadenza Multicolpo",
    icon: "⚡",
    desc: "+5% probabilità di colpi multipli istantanei (2x/3x/4x) — INFINITO",
    baseCost: 50000,
    grow: 2.35,
    effectText: r => `Attuale: ${Math.round((typeof multistrikeChance === "function" ? multistrikeChance() : 0) * 100)}% multicolpo`
  },
  {
    key: "overcharge",
    name: "Potenza Sovraccarico",
    icon: "🔥",
    desc: "+25% danno durante il Sovraccarico Termico — INFINITO",
    baseCost: 100000,
    grow: 2.25,
    effectText: () => "Potenzia la Furia del Vulcano"
  },
  {
    key: "splash",
    name: "Fendente a Dispersione",
    icon: "🪓",
    desc: "+8% danno ad area su tutta l'orda — INFINITO",
    baseCost: 150000,
    grow: 2.45,
    effectText: r => `Attuale: ${Math.round((typeof splashDamagePercent === "function" ? splashDamagePercent() : 0) * 100)}% cleave`
  }
];

// Master upgrade registry
const ALL_UPGRADES = (function() {
  const arr = [];
  UCLICK_PHASE1.forEach(u => arr.push(Object.assign({ type: "click", phase: 1 }, u)));
  UCLICK_PHASE2.forEach(u => arr.push(Object.assign({ type: "click", phase: 2 }, u)));
  UPROD.forEach(u => arr.push(Object.assign({ type: "prod" }, u)));
  UCRIT.forEach(u => arr.push(Object.assign({ type: "crit" }, u)));
  UOFF.forEach(u => arr.push(Object.assign({ type: "off" }, u)));
  UHP.forEach(u => arr.push(Object.assign({ type: "hp" }, u)));
  UREGEN.forEach(u => arr.push(Object.assign({ type: "regen" }, u)));
  
  GENS.forEach(g => {
    arr.push({ id: `${g.id}_x2`, type: "gen", gen: g.id, val: 2, name: `Fiamma ${g.name}`, icon: g.icon, desc: `Produzione ${g.name} ×2`, cost: g.base * 25 });
    arr.push({ id: `${g.id}_x4`, type: "gen", gen: g.id, val: 4, name: `Leghe ${g.name}`, icon: g.icon, desc: `Produzione ${g.name} ×4`, cost: g.base * 600 });
    arr.push({ id: `${g.id}_x10`, type: "gen", gen: g.id, val: 10, name: `Cromatura ${g.name}`, icon: g.icon, desc: `Produzione ${g.name} ×10`, cost: g.base * 15000 });
  });
  return arr;
})();

let currentUpgradeCategory = "click";
let GEN_BUY_AMOUNT = 1; // 1 | 5 | 25 | "max"
const BUY_AMOUNTS = [1, 5, 25, "max"];

// ==================== GENERATORS WITH BULK BUY ====================
function bulkBuyCost(g) {
  const n = GEN_BUY_AMOUNT === "max" ? Math.max(1, maxAffordableGens(g)) : GEN_BUY_AMOUNT;
  return Math.ceil(bulkGenCost(g, n));
}

function buyGenerator(id) {
  const g = GENS.find(x => x.id === id);
  if (!g) return;
  
  let count;
  if (GEN_BUY_AMOUNT === "max") {
    count = maxAffordableGens(g);
    if (count <= 0) { if (typeof sErr === "function") sErr(); return; }
    count = Math.min(count, 500);
  } else {
    count = GEN_BUY_AMOUNT;
  }
  
  const totalCost = Math.ceil(bulkGenCost(g, count));
  if (!canAfford("lire", totalCost)) {
    if (typeof sErr === "function") sErr();
    return;
  }
  
  S.lire -= totalCost;
  S.gen[id] = (S.gen[id] || 0) + count;
  invalidateStatCache();
  if (typeof sBuy === "function") sBuy();
  
  // Milestone toast every 25 owned
  const nowOwned = S.gen[id];
  if (nowOwned >= 25 && Math.floor(nowOwned / 25) > Math.floor((nowOwned - count) / 25)) {
    if (typeof toast === "function") {
      toast("⭐", `${g.name} ×${nowOwned}!`, "Bonus milestone: produzione potenziata!");
    }
  }
  
  if (typeof refreshWorldBots === "function") refreshWorldBots();
  renderGeneratorsGrid();
  if (typeof render === "function") render();
  if (typeof checkAch === "function") checkAch();
  if (typeof saveGame === "function") saveGame();
}

function renderGeneratorHeader() {
  const header = document.getElementById("genBuyRow");
  if (header) {
    header.innerHTML = `
      <span style="font-size:0.74rem; font-weight:900; color:var(--txt-dim);">QUANTITÀ:</span>
      ${BUY_AMOUNTS.map(a =>
        `<div class="upC bamt ${GEN_BUY_AMOUNT === a ? "active" : ""}" data-amt="${a}">${a === "max" ? "MAX" : "×" + a}</div>`
      ).join("")}
    `;
    header.querySelectorAll(".bamt").forEach(b => {
      b.onclick = () => {
        const v = b.dataset.amt;
        GEN_BUY_AMOUNT = (v === "max") ? "max" : parseInt(v);
        renderGeneratorHeader();
        renderGeneratorsGrid();
        if (typeof sClick === "function") sClick();
      };
    });
  }
}

function renderGeneratorsGrid() {
  const container = document.getElementById("genList");
  if (!container) return;
  container.innerHTML = "";
  renderGeneratorHeader();
  
  GENS.forEach(g => {
    const owned = S.gen[g.id] || 0;
    
    let count, cost;
    if (GEN_BUY_AMOUNT === "max") {
      count = Math.max(1, maxAffordableGens(g));
      cost = Math.ceil(bulkGenCost(g, count));
      if (canAfford("lire", cost) === false && maxAffordableGens(g) <= 0) {
        count = 1;
        cost = genCost(g);
      }
    } else {
      count = GEN_BUY_AMOUNT;
      cost = Math.ceil(bulkGenCost(g, count));
    }
    
    const can = canAfford("lire", cost);
    
    const card = document.createElement("div");
    card.className = `card ${owned > 0 ? "" : "locked"} ${can ? "can" : "cant"}`;
    card.dataset.cost = cost;
    card.dataset.cur = "l";
    
    const singleProd = g.prod * (typeof genMultiplier === "function" ? genMultiplier(g.id) : 1);
    const buyLabel = GEN_BUY_AMOUNT === "max" ? `MAX (${count})` : `Compra ×${count}`;
    
    card.innerHTML = `
      <div class="name">${g.icon} ${g.name}</div>
      <div class="desc">${g.desc}</div>
      <div class="meta">
        <span class="cost">₤ ${fmt(cost)}</span>
        <span class="qty">${owned}</span>
      </div>
      <div class="prod">+${fmt(singleProd)}/s ciascuno${count > 1 ? ` · totale +${fmt(singleProd * count)}/s` : ""}</div>
      <div class="btn">${buyLabel}</div>
    `;
    
    card.onclick = () => buyGenerator(g.id);
    container.appendChild(card);
  });
}

// ==================== UPGRADE CATEGORIES ====================
function renderUpgradeCategories() {
  const container = document.getElementById("upgCat");
  if (!container) return;
  container.innerHTML = "";
  
  const categories = [
    { key: "click", name: "Click", icon: "⚡" },
    { key: "stats", name: "Statistiche ♾️", icon: "✨" },
    { key: "bot", name: "Automi ♾️", icon: "🤖" },
    { key: "prod", name: "Produzione ♾️", icon: "🏭" },
    { key: "crit", name: "Critico ♾️", icon: "🎯" },
    { key: "surv", name: "Sopravvivenza ❤️", icon: "🛡️" },
    { key: "off", name: "Offline", icon: "🌙" }
  ];
  
  categories.forEach(c => {
    const btn = document.createElement("div");
    btn.className = `upC ${currentUpgradeCategory === c.key ? "active" : ""}`;
    btn.innerHTML = `${c.icon} ${c.name}`;
    btn.onclick = () => {
      currentUpgradeCategory = c.key;
      renderUpgradeCategories();
      renderUpgradesList();
    };
    container.appendChild(btn);
  });
}

// ==================== INFINITE TIER ROW ====================
function renderInfiniteTierRow(container, key, unlockCheck, unlockHint) {
  const cfg = INF_TIERS[key];
  const unlocked = unlockCheck();
  const lvl = infLevel(key);
  const cost = infCost(key);
  const can = unlocked && canAfford("lire", cost);
  
  const row = document.createElement("div");
  row.className = `upRow infTier ${!unlocked ? "lockedchain" : (can ? "can" : "cant")}`;
  row.dataset.cost = unlocked ? cost : 999999999999999;
  row.dataset.cur = "l";
  
  let effectTxt = "";
  if (key === "crit") effectTxt = `+${(lvl * cfg.addPerLvl * 100).toFixed(0)}% critico attuale`;
  else effectTxt = `×${fmt(Math.pow(cfg.multPerLvl, lvl))} bonus attuale`;
  
  row.innerHTML = `
    <div class="info">
      <div class="uname" style="color:var(--purple);">♾️ ${cfg.name} <span style="color:var(--aqua);">(Liv. ∞ #${lvl + 1})</span></div>
      <div class="udesc">${unlocked
        ? `${effectTxt} · ogni livello è PERMANENTE e scala all'infinito`
        : `🔒 ${unlockHint}`}</div>
    </div>
  `;
  
  if (unlocked) {
    const btn = document.createElement("div");
    btn.className = `uBtn ${can ? "okBtn" : "noBtn"}`;
    btn.textContent = `₤ ${fmt(cost)}`;
    btn.onclick = () => {
      if (buyInfiniteTier(key)) {
        renderUpgradesList();
        if (typeof checkAch === "function") checkAch();
      }
    };
    row.appendChild(btn);
  } else {
    const lockTag = document.createElement("div");
    lockTag.className = "uBtn noBtn";
    lockTag.style.cursor = "default";
    lockTag.textContent = "🔒 BLOCCATO";
    row.appendChild(lockTag);
  }
  
  container.appendChild(row);
  
  if (unlocked && lvl > 0) {
    const sep = document.createElement("div");
    sep.className = "infSeparator";
    container.appendChild(sep);
  }
}

// ==================== MAIN UPGRADES LIST ====================
function renderUpgradesList() {
  const container = document.getElementById("upgList");
  if (!container) return;
  container.innerHTML = "";
  renderUpgradeCategories();
  
  // ---- CLICK CATEGORY: chain P1 → P2 → ♾️ ----
  if (currentUpgradeCategory === "click") {
    const p1Done = UCLICK_PHASE1.every(u => S.upgrades.includes(u.id));
    const p2Done = UCLICK_PHASE2.every(u => S.upgrades.includes(u.id));
    
    UCLICK_PHASE1.forEach(u => renderOneTimeUpgrade(container, u));
    
    if (p1Done) {
      const sep = document.createElement("div");
      sep.className = "chainUnlockBanner";
      sep.innerHTML = `<div>🔓 CHAIN SBLOCCATA — Sintonia di Silicio Fase 2</div>`;
      container.appendChild(sep);
      UCLICK_PHASE2.forEach(u => renderOneTimeUpgrade(container, u));
      
      if (p2Done) {
        const sep2 = document.createElement("div");
        sep2.className = "chainUnlockBanner";
        sep2.innerHTML = `<div>♾️ CATENA INFINITA SBLOCCATA — scala per sempre</div>`;
        container.appendChild(sep2);
        renderInfiniteTierRow(container, "click", isClickInfUnlocked,
          "Completa tutti i 4 potenziamenti della Fase 2 (Sintonia di Silicio)");
      }
    }
    return;
  }
  
  // ---- STATS CATEGORY: infinite trees ----
  if (currentUpgradeCategory === "stats") {
    renderSpecialStatsUpgrades(container);
    return;
  }
  
  // ---- BOT CATEGORY: infinite levels + milestones ----
  if (currentUpgradeCategory === "bot") {
    const mileInfo = document.createElement("div");
    mileInfo.className = "milestoneBar";
    mileInfo.innerHTML = `🏅 Prossimo bonus globale (+4% danno e produzione): <b>${totalBotLevels()} / ${nextBotMilestoneAt()}</b> livelli automa`;
    container.appendChild(mileInfo);
    
    UBOT.forEach(b => {
      const count = S.bots[b.id] || 0;
      const cost = Math.round(b.base * Math.pow(b.grow, count));
      const can = canAfford("lire", cost);
      
      const row = document.createElement("div");
      row.className = `upRow ${can ? "can" : "cant"}`;
      row.dataset.cost = cost;
      row.dataset.cur = "l";
      
      row.innerHTML = `
        <div class="info">
          <div class="uname">${b.icon} ${b.name} <span style="color:var(--mint);">Lv.${count}</span></div>
          <div class="udesc">${b.desc} · possiedi ${count} · +${count * b.val}/s totali · INFINITO</div>
        </div>
      `;
      
      const btn = document.createElement("div");
      btn.className = `uBtn ${can ? "okBtn" : "noBtn"}`;
      btn.textContent = `₤ ${fmt(cost)}`;
      btn.onclick = () => {
        if (!canAfford("lire", cost)) { sErr(); return; }
        S.lire -= cost;
        S.bots[b.id] = count + 1;
        invalidateStatCache();
        
        // Milestone hit?
        if (totalBotLevels() % 25 === 0) {
          if (typeof sLevel === "function") sLevel();
          if (typeof toast === "function") {
            toast("🏅", "MILESTONE AUTOMI!", `+4% permanente a Danno e Produzione! (${botMilestoneMult().toFixed(2)}x totale)`);
          }
        }
        
        sBuy();
        renderUpgradesList();
        if (typeof render === "function") render();
        saveGame();
      };
      row.appendChild(btn);
      container.appendChild(row);
    });
    return;
  }
  
  // ---- PROD CATEGORY: one-times + ♾️ Overdrive ----
  if (currentUpgradeCategory === "prod") {
    UPROD.forEach(u => renderOneTimeUpgrade(container, u));
    const done = isProdInfUnlocked();
    if (done) {
      const sep = document.createElement("div");
      sep.className = "chainUnlockBanner";
      sep.innerHTML = `<div>♾️ CATENA INFINITA SBLOCCATA — Overdrive Produttivo Eterno</div>`;
      container.appendChild(sep);
    }
    renderInfiniteTierRow(container, "prod", isProdInfUnlocked,
      "Completa tutti i 7 potenziamenti Produzione (Lens Flare Divino incluso)");
    return;
  }
  
  // ---- CRIT CATEGORY: one-times + ♾️ Eye ----
  if (currentUpgradeCategory === "crit") {
    UCRIT.forEach(u => renderOneTimeUpgrade(container, u));
    const done = isCritInfUnlocked();
    if (done) {
      const sep = document.createElement("div");
      sep.className = "chainUnlockBanner";
      sep.innerHTML = `<div>♾️ CATENA INFINITA SBLOCCATA — Occhio Infinito di Ruggine</div>`;
      container.appendChild(sep);
    }
    renderInfiniteTierRow(container, "crit", isCritInfUnlocked,
      "Completa tutti i 4 potenziamenti Critici (Occhio di Ruggine)");
    return;
  }
  
  // ---- SURVIVAL CATEGORY: HP chain + regen + infinite Cuore Indistruttibile ----
  if (currentUpgradeCategory === "surv") {
    UHP.forEach(u => renderOneTimeUpgrade(container, u));
    UREGEN.forEach(u => renderOneTimeUpgrade(container, u));
    
    const hpDone = UHP.every(u => S.upgrades.includes(u.id));
    if (hpDone) {
      const sep = document.createElement("div");
      sep.className = "chainUnlockBanner";
      sep.innerHTML = `<div>♾️ CATENA INFINITA SBLOCCATA — Cuore Indistruttibile</div>`;
      container.appendChild(sep);
      
      // Infinite repeatable HP tier
      S.hpOverdrive = S.hpOverdrive || 0;
      const cost = Math.round(5e12 * Math.pow(3.4, S.hpOverdrive));
      const can = canAfford("lire", cost);
      
      const row = document.createElement("div");
      row.className = `upRow infTier ${can ? "can" : "cant"}`;
      row.dataset.cost = cost;
      row.dataset.cur = "l";
      row.innerHTML = `
        <div class="info">
          <div class="uname" style="color:var(--purple);">♾️ Cuore Indistruttibile <span style="color:var(--aqua);">(Liv. ∞ #${S.hpOverdrive + 1})</span></div>
          <div class="udesc">+100% Energia Max per livello · INFINITO (attuale: ×${(1 + S.hpOverdrive).toFixed(0)} base extra)</div>
        </div>
      `;
      const btn = document.createElement("div");
      btn.className = `uBtn ${can ? "okBtn" : "noBtn"}`;
      btn.textContent = `₤ ${fmt(cost)}`;
      btn.onclick = () => {
        if (!canAfford("lire", cost)) { sErr(); return; }
        S.lire -= cost;
        S.hpOverdrive++;
        sBuy();
        recalcHpMax();
        renderUpgradesList();
        renderPlayerHp();
        saveGame();
      };
      row.appendChild(btn);
      container.appendChild(row);
    }
    return;
  }
  
  // ---- OFFLINE CATEGORY: one-times then infinite repeatable ----
  UOFF.forEach(u => renderOneTimeUpgrade(container, u));
  const offAllDone = UOFF.every(u => S.upgrades.includes(u.id));
  if (offAllDone) {
    renderOfflineOverdriveRow(container);
  }
}

// One-time upgrade row
function renderOneTimeUpgrade(container, u) {
  const owned = S.upgrades.includes(u.id);
  const cost = u.cost || 0;
  const can = !owned && canAfford("lire", cost);
  
  const row = document.createElement("div");
  row.className = `upRow ${can ? "can" : (owned ? "" : "cant")}`;
  row.dataset.cost = cost;
  row.dataset.cur = "l";
  
  row.innerHTML = `
    <div class="info">
      <div class="uname">${u.icon} ${u.name}${owned ? " ✅" : ""}</div>
      <div class="udesc">${u.desc}</div>
    </div>
  `;
  
  const btn = document.createElement("div");
  btn.className = "uBtn";
  if (owned) {
    btn.textContent = "FATTO";
    btn.classList.add("fatto");
  } else {
    btn.classList.add(can ? "okBtn" : "noBtn");
    btn.textContent = `₤ ${fmt(cost)}`;
    btn.onclick = () => buyUpgrade(u.id, cost);
  }
  
  row.appendChild(btn);
  container.appendChild(row);
}

// Offline infinite overdrive (repeatable multiplier)
function renderOfflineOverdriveRow(container) {
  S.offOverdrive = S.offOverdrive || 0;
  const cost = Math.round(5e11 * Math.pow(3.2, S.offOverdrive));
  const can = canAfford("lire", cost);
  
  const row = document.createElement("div");
  row.className = `upRow ${can ? "can" : "cant"}`;
  row.dataset.cost = cost;
  row.dataset.cur = "l";
  
  row.innerHTML = `
    <div class="info">
      <div class="uname" style="color:var(--purple);">♾️ Memoria Assoluta <span style="color:var(--aqua);">(Liv. ∞ #${S.offOverdrive + 1})</span></div>
      <div class="udesc">+50% ricordo offline aggiuntivo per livello · INFINITO (attuale: +${S.offOverdrive * 50}%)</div>
    </div>
  `;
  
  const btn = document.createElement("div");
  btn.className = `uBtn ${can ? "okBtn" : "noBtn"}`;
  btn.textContent = `₤ ${fmt(cost)}`;
  btn.onclick = () => {
    if (!canAfford("lire", cost)) { sErr(); return; }
    S.lire -= cost;
    S.offOverdrive++;
    sBuy();
    renderUpgradesList();
    render();
    saveGame();
  };
  
  row.appendChild(btn);
  container.appendChild(row);
}

function renderSpecialStatsUpgrades(container) {
  STAT_TREES.forEach(st => {
    const rank = (S.statUpgrades && S.statUpgrades[st.key]) || 0;
    const cost = Math.round(st.baseCost * Math.pow(st.grow, rank));
    const can = canAfford("lire", cost);
    
    const row = document.createElement("div");
    row.className = `upRow ${can ? "can" : "cant"}`;
    row.dataset.cost = cost;
    row.dataset.cur = "l";
    
    row.innerHTML = `
      <div class="info">
        <div class="uname">${st.icon} ${st.name} <span style="color:var(--aqua);">(Rango ∞ #${rank + 1})</span></div>
        <div class="udesc">${st.desc}<br><span style="color:var(--gold);">${st.effectText(rank)}</span></div>
      </div>
    `;
    
    const btn = document.createElement("div");
    btn.className = `uBtn ${can ? "okBtn" : "noBtn"}`;
    btn.textContent = `₤ ${fmt(cost)}`;
    btn.onclick = () => buySpecialStatUpgrade(st.key, cost);
    
    row.appendChild(btn);
    container.appendChild(row);
  });
}

// ==================== PURCHASE HANDLERS ====================
function buyAutomationBot(id) {
  const b = UBOT.find(x => x.id === id);
  if (!b) return false;
  const count = S.bots[id] || 0;
  const cost = Math.round(b.base * Math.pow(b.grow, count));
  
  if (!canAfford("lire", cost)) {
    if (typeof sErr === "function") sErr();
    return false;
  }
  
  S.lire -= cost;
  S.bots[id] = count + 1;
  invalidateStatCache();
  if (typeof sBuy === "function") sBuy();
  
  // Milestone hit?
  if (totalBotLevels() % 25 === 0) {
    if (typeof sLevel === "function") sLevel();
    if (typeof toast === "function") {
      toast("🏅", "MILESTONE AUTOMI!", "+4% permanente a Danno e Produzione!");
    }
  }
  
  if (typeof refreshWorldBots === "function") refreshWorldBots();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
  return true;
}
function buyUpgrade(id, cost) {
  if (S.upgrades.includes(id)) return;
  if (!canAfford("lire", cost)) {
    if (typeof sErr === "function") sErr();
    return;
  }
  
  S.lire -= cost;
  S.upgrades.push(id);
  invalidateStatCache();
  if (typeof sBuy === "function") sBuy();
  
  // Keep derived stats in sync (HP max, etc.)
  if (typeof recalcHpMax === "function") { recalcHpMax(); if (typeof renderPlayerHp === "function") renderPlayerHp(); }
  
  // Phase 1 mastery unlock trigger
  const wasPhase1Done = UCLICK_PHASE1.every(u => S.upgrades.includes(u.id));
  if (wasPhase1Done && S.clickMastery === 0) {
    S.clickMastery = 1;
    if (typeof toast === "function") {
      toast("🔓", "CHAIN SBLOCCATA!", "Sintonia di Silicio Fase 2 ora disponibile nella categoria Click!");
    }
    if (typeof sLevel === "function") sLevel();
  }
  
  renderUpgradesList();
  if (typeof render === "function") render();
  if (typeof checkAch === "function") checkAch();
  if (typeof saveGame === "function") saveGame();
}

function buySpecialStatUpgrade(key, cost) {
  S.statUpgrades = S.statUpgrades || {};
  const cur = S.statUpgrades[key] || 0;
  
  if (!canAfford("lire", cost)) {
    if (typeof sErr === "function") sErr();
    return;
  }
  
  S.lire -= cost;
  S.statUpgrades[key] = cur + 1;
  invalidateStatCache();
  if (typeof sBuy === "function") sBuy();
  
  renderUpgradesList();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
}
