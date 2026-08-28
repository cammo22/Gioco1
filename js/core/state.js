/**
 * VESUVIO.EXE - Core State Management
 * Single Reactive State with migration and persistent storage
 */
"use strict";

const DEFAULT_STATE = {
  version: 3.0,
  lire: 0,
  totalLire: 0,
  biglietti: 0,
  rottami: 0,
  
  // Progression & Level
  lvl: 1,
  xp: 0,
  kills: 0,
  waveCount: 0,
  
  // Combat stats
  hp: 100,
  hpMax: 100,
  heat: 0,
  heatMax: 100,
  isOvercharged: false,
  down: false,
  downAt: 0,
  
  // Boss progression
  bossActive: false,
  bossDefeated: 0,
  bossIdx: 0,
  roomCheckpoint: 1, // room checkpoint for retreat
  bossWaiting: false, // arrived on a boss level but not engaged yet
  
  // Automation
  botsOn: true,
  
  // Wave state
  enemyType: "normal", // "normal", "elite", "boss"
  wave: [],
  focus: 0,
  waveStats: { kills: 0, lire: 0, xp: 0, drops: [] },
  
  // Generators, Upgrades, Bots & Mastery
  gen: {},
  upgrades: [],
  bots: {},
  clickMastery: 0, // Unlocks phase 2 click upgrades
  
  // INFINITE upgrade tiers (unlocked by completing limited chains)
  inf: {
    click: 0,  // Sintonia Infinita (requires Phase 2 complete)
    prod: 0,   // Overdrive Produttivo (requires all Prod)
    crit: 0    // Occhio Infinito (requires all Crit)
  },
  
  // Automa Ultimate (Protocollo Vesuvio) — unlocked at 100 total bot levels
  ultUnlocked: false,
  ultActiveUntil: 0,
  ultReadyAt: 0,
  statUpgrades: {
    multistrike: 0,   // Chance to strike multiple times
    overcharge: 0,    // Heat gain & Overcharge damage
    splash: 0         // Cleave % damage to adjacent targets
  },
  
  // Character Customization
  rob: {
    chassis: "ferro",
    col1: "#3fa8d8",
    col2: "#ffd25a",
    eyes: "visore",
    eyesCol: "#5ff5c5",
    antenna: "none",
    acc: "none",
    weapon: "none",
    wing: "none",
    fx: "none",
    hat: "none"
  },
  
  // Merceria Gambling & Sets
  inventory: [],
  shopDisc: 0,
  rerollsCount: 0,
  equippedSets: {},
  
  // Workshop (Ticket Generator)
  workshop: {
    lvl: 0,
    progress: 0,
    cost: 50000
  },
  
  // Telemetry (Borsa)
  marketRange: "1h",
  marketData: {
    sec: [],
    min: [],
    hour: [],
    lastSec: 0,
    lastMin: 0,
    lastHour: 0,
    lastKills: 0,
    panic: false
  },
  
  // Global stats & telemetry
  stats: {
    clicks: 0,
    multistrikes: 0,
    overcharges: 0,
    bossDefeats: 0,
    retreats: 0,
    shopBuys: 0,
    wheelSpins: 0,
    lavaDropsCollected: 0,
    mgPlayed: 0
  },
  
  achi: [],
  events: 0,
  last: Date.now()
};

let S = structuredClone(DEFAULT_STATE);

// ==================== DERIVED STATS CACHE ====================
// clickDmg/calcProd/etc. iterate ~100 upgrades per call; at 60 FPS + 10 bot
// strikes/sec that was thousands of scans per second. Cache them and
// invalidate ONLY when something that matters actually changes.
let _statCache = { dmg: null, prod: null, crit: null, botRate: null, sets: null, regen: null, hpMax: null };

function invalidateStatCache() {
  _statCache = { dmg: null, prod: null, crit: null, botRate: null, sets: null, regen: null, hpMax: null };
}

// Invalidate on every state change that can alter derived stats.
// Cheap: called from buy handlers, buff changes, level ups, equips, botsOn toggle.
function markStatsDirty() {
  invalidateStatCache();
}

// Buffs can expire on a timer without a call-site: sweep lazily.
function _sweepBuffs() {
  const now = Date.now();
  let changed = false;
  for (const k in buffs) {
    const b = buffs[k];
    if (b && b.until <= now) { buffs[k] = null; changed = true; }
  }
  if (changed) {
    invalidateStatCache();
    renderBuffTags();
  }
}

function getGameState() {
  return S;
}

function initGameState() {
  loadGame();
}

function loadGame() {
  try {
    const raw = localStorage.getItem("vesuvioEXE_saveV3");
    if (!raw) {
      // Check for legacy save migration
      const legacy = localStorage.getItem("vesuvioEXE_save") || localStorage.getItem("vesuvioEXE_saveV2");
      if (legacy) {
        migrateLegacySave(JSON.parse(legacy));
      } else {
        S = structuredClone(DEFAULT_STATE);
      }
      return;
    }
    
    const parsed = JSON.parse(raw);
    S = Object.assign(structuredClone(DEFAULT_STATE), parsed);
    
    // Deep merge substructures
    S.rob = Object.assign(structuredClone(DEFAULT_STATE.rob), parsed.rob || {});
    S.stats = Object.assign(structuredClone(DEFAULT_STATE.stats), parsed.stats || {});
    S.statUpgrades = Object.assign(structuredClone(DEFAULT_STATE.statUpgrades), parsed.statUpgrades || {});
    S.inf = Object.assign(structuredClone(DEFAULT_STATE.inf), parsed.inf || {});
  S.workshop = Object.assign(structuredClone(DEFAULT_STATE.workshop), parsed.workshop || {});
  S.marketData = Object.assign(structuredClone(DEFAULT_STATE.marketData), parsed.marketData || {});
    
    // Ultimate fields (older saves may miss them)
    if (typeof parsed.ultUnlocked !== "undefined") S.ultUnlocked = parsed.ultUnlocked;
    if (typeof parsed.ultActiveUntil !== "undefined") S.ultActiveUntil = parsed.ultActiveUntil;
    if (typeof parsed.ultReadyAt !== "undefined") S.ultReadyAt = parsed.ultReadyAt;
    
    // Cleanup removed mechanics (e.g. Braci, Rinascita)
    delete S.braci;
    delete S.reboots;
    delete S.prestige;
    delete S.perks;
    
    // Recompute derived stats from upgrades (HP max etc.)
    if (typeof recalcHpMax === "function") recalcHpMax();
    S.hp = Math.min(S.hp || S.hpMax, S.hpMax);
    
    // Compute offline gains
    processOfflineGains(parsed.last);
  } catch (err) {
    console.warn("Failed to load save, initializing default:", err);
    S = structuredClone(DEFAULT_STATE);
  }
}

function migrateLegacySave(old) {
  S = structuredClone(DEFAULT_STATE);
  S.lire = old.lire || old.lava || 0;
  S.totalLire = old.totalLire || old.totalLava || S.lire;
  S.rottami = old.rottami || 0;
  S.biglietti = old.biglietti || 0;
  S.lvl = Math.max(1, old.lvl || 1);
  S.xp = old.xp || 0;
  S.kills = old.kills || 0;
  S.gen = Object.assign({}, old.gen || {});
  S.upgrades = Array.isArray(old.upgrades) ? old.upgrades : [];
  S.bots = Object.assign({}, old.bots || {});
  if (old.rob) S.rob = Object.assign(S.rob, old.rob);
  if (old.stats) S.stats = Object.assign(S.stats, old.stats);
  if (Array.isArray(old.achi)) S.achi = old.achi;
  console.log("Legacy save migrated successfully to V3 format");
}

function saveGame() {
  try {
    S.last = Date.now();
    // Telemetry buffers can hold ~14k samples (several MB of JSON).
    // Serializing them on every action caused massive stutters at high
    // level — they are persisted separately by marketSave() every 30s.
    const light = Object.assign({}, S);
    delete light.marketData;
    localStorage.setItem("vesuvioEXE_saveV3", JSON.stringify(light));
  } catch (err) {
    console.warn("Save game failed:", err);
  }
}

function loadMarketData() {
  try {
    const raw = localStorage.getItem("vesuvioEXE_market");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sec)) {
        S.marketData = Object.assign(structuredClone(DEFAULT_STATE.marketData), parsed);
        return;
      }
    }
  } catch (err) { /* fall through to seeded data */ }
  // No stored telemetry: keep whatever the main save had (old saves)
  // or the DEFAULT empty structure; initBorsaTelemetry() seeds it.
}

function processOfflineGains(lastTimestamp) {
  if (!lastTimestamp) return;
  const elapsedSec = (Date.now() - lastTimestamp) / 1000;
  if (elapsedSec < 5) return;
  
  const cappedSec = Math.min(elapsedSec, 12 * 3600); // 12 hours max offline
  if (typeof calcProd === "function" && typeof offMult === "function") {
    const rate = calcProd() * offMult();
    const gains = rate * cappedSec * 0.95;
    if (gains > 1) {
      S.lire += gains;
      S.totalLire += gains;
      if (typeof toast === "function") {
        toast("🌙", "Bottino da Assenza", `+${fmt(gains)} Lire (${fmtTime(cappedSec)})`);
      }
    }
  }
}

function resetGame() {
  S = structuredClone(DEFAULT_STATE);
  localStorage.removeItem("vesuvioEXE_saveV3");
  location.reload();
}

// Global Buffs Registry
const buffs = {
  dmg: null,
  prod: null,
  crit: null
};

function addBuff(type, val, dur, label) {
  buffs[type] = {
    val: val,
    dur: dur,
    label: label,
    until: Date.now() + dur * 1000
  };
  
  invalidateStatCache();
  
  setTimeout(() => {
    if (buffs[type] && buffs[type].until <= Date.now()) {
      buffs[type] = null;
      invalidateStatCache();
      renderBuffTags();
    }
  }, dur * 1000 + 40);
  
  renderBuffTags();
}

function renderBuffTags() {
  const bar = document.getElementById("buffbar");
  if (!bar) return;
  bar.innerHTML = "";
  
  const labels = { dmg: "DANNO", prod: "PRODUZIONE", crit: "CRIT" };
  
  for (const k in buffs) {
    const b = buffs[k];
    if (b && b.val && b.until > Date.now()) {
      const remainingSec = Math.max(0, Math.ceil((b.until - Date.now()) / 1000));
      const span = document.createElement("div");
      span.className = "buff-tag";
      span.textContent = `${b.label || "BUFF"} ×${b.val} ${labels[k] || ""} · ${remainingSec}s`;
      bar.appendChild(span);
    }
  }
}
