/**
 * VESUVIO.EXE - Mathematical Formulas & Balance Curves
 * Calibrated for smooth progression to 500T Lire endgame + INFINITE tiers
 */
"use strict";

const NUMBER_SUFFIXES = [
  "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc"
];

function fmt(n) {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return "0";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) {
    // Keep small fractional rates readable (e.g. 0.5 Lire/s)
    if (n > 0 && n % 1 !== 0) return n.toFixed(1);
    return Math.floor(n).toLocaleString();
  }
  
  const tier = Math.floor(Math.log10(Math.max(1, n)) / 3);
  if (tier >= NUMBER_SUFFIXES.length + 1) {
    return n.toExponential(2).replace(/e\+/, "e");
  }
  
  const scaled = n / Math.pow(10, tier * 3);
  const decimals = scaled < 10 ? 2 : (scaled < 100 ? 1 : 0);
  return scaled.toFixed(decimals).replace(/\.0+$/, "") + NUMBER_SUFFIXES[tier - 1];
}

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (h ? h + "h " : "") + (m ? m + "m " : "") + s + "s";
}

function shade(hex, factor) {
  if (!hex || hex[0] !== "#") hex = "#3fa8d8";
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 255) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 255) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((num & 255) * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// ==================== INFINITE UPGRADE TIERS ====================
// Unlocked by completing limited chains — they scale FOREVER
const INF_TIERS = {
  click: { baseCost: 8e14, grow: 3.4, multPerLvl: 1.75, name: "Sintonia Infinita di Silicio", icon: "♾️" },
  prod:  { baseCost: 6e13, grow: 3.6, multPerLvl: 2.00, name: "Overdrive Produttivo Eterno", icon: "♾️" },
  crit:  { baseCost: 8e12, grow: 4.5, addPerLvl: 0.03,  name: "Occhio Infinito di Ruggine", icon: "♾️" }
};

function infLevel(key) {
  return (S.inf && S.inf[key] !== undefined) ? S.inf[key] : 0;
}

function infCost(key) {
  const cfg = INF_TIERS[key];
  return Math.round(cfg.baseCost * Math.pow(cfg.grow, infLevel(key)));
}

function buyInfiniteTier(key) {
  if (!canAfford("lire", infCost(key))) {
    if (typeof sErr === "function") sErr();
    return false;
  }
  S.lire -= infCost(key);
  S.inf = S.inf || {};
  S.inf[key] = infLevel(key) + 1;
  invalidateStatCache();
  if (typeof sBuy === "function") sBuy();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
  return true;
}

// Unlock conditions for infinite chains
function isClickInfUnlocked() {
  return Array.isArray(UCLICK_PHASE2) && UCLICK_PHASE2.every(u => S.upgrades.includes(u.id));
}
function isProdInfUnlocked() {
  return Array.isArray(UPROD) && UPROD.every(u => S.upgrades.includes(u.id));
}
function isCritInfUnlocked() {
  return Array.isArray(UCRIT) && UCRIT.every(u => S.upgrades.includes(u.id));
}

// ==================== BOT MILESTONES (infinite scaling reward) ====================
// Every 25 total bot levels = +4% global damage & production, forever
function totalBotLevels() {
  let t = 0;
  if (Array.isArray(UBOT)) {
    UBOT.forEach(b => { t += (S.bots[b.id] || 0); });
  }
  return t;
}
function botMilestoneMult() {
  return 1 + Math.floor(totalBotLevels() / 25) * 0.04;
}
function nextBotMilestoneAt() {
  return (Math.floor(totalBotLevels() / 25) + 1) * 25;
}

// ==================== XP PROGRESSION ====================
function xpNeed(lvl) {
  return Math.round(18 * Math.pow(1.125, Math.max(0, lvl - 1)));
}

// ==================== CLICK DAMAGE ====================
function clickDmg() {
  if (_statCache.dmg !== null) return _statCache.dmg;
  
  let mult = 1;
  
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "click" && S.upgrades.includes(u.id)) {
        mult *= (u.val || 1);
      }
    });
  }
  
  // Level scaling
  mult *= (1 + ((S.lvl || 1) - 1) * 0.12);
  
  // Phase 2 Click Mastery legacy bonus
  if ((S.clickMastery || 0) > 0) {
    mult *= Math.pow(1.35, S.clickMastery);
  }
  
  // INFINITE Sintonia tier
  mult *= Math.pow(INF_TIERS.click.multPerLvl, infLevel("click"));
  
  // Overcharge mode
  if (S.isOvercharged) {
    const ocBonus = 1 + ((S.statUpgrades && S.statUpgrades.overcharge) || 0) * 0.25;
    mult *= (2.5 * ocBonus);
  }
  
  // Set synergies
  if (typeof getActiveSetBonus === "function") {
    const sets = getActiveSetBonus();
    if (sets.vesuvio && S.isOvercharged) mult *= 2.0;
    if (sets.sistema) mult *= 1.35;
  }
  
  // Bot milestone global bonus
  mult *= botMilestoneMult();
  
  // Active buffs
  if (buffs && buffs.dmg && buffs.dmg.val) {
    mult *= buffs.dmg.val;
  }
  
  _statCache.dmg = Math.max(1, mult);
  return _statCache.dmg;
}

function critChance() {
  if (_statCache.crit !== null) return _statCache.crit;
  
  let c = 0.05;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "crit" && S.upgrades.includes(u.id)) {
        c += (u.val || 0);
      }
    });
  }
  // INFINITE Occhio tier
  c += infLevel("crit") * INF_TIERS.crit.addPerLvl;
  if (buffs && buffs.crit && buffs.crit.val) {
    c += buffs.crit.val;
  }
  _statCache.crit = Math.min(c, 0.95);
  return _statCache.crit;
}

function critMult() {
  return 3.5;
}

// ==================== 2 NEW STATS ====================
function multistrikeChance() {
  const rank = (S.statUpgrades && S.statUpgrades.multistrike) || 0;
  // Soft cap at 80%, keeps growing but with diminishing returns past rank 16
  if (rank <= 16) return rank * 0.05;
  return 0.80 + (rank - 16) * 0.01;
}

function splashDamagePercent() {
  const rank = (S.statUpgrades && S.statUpgrades.splash) || 0;
  if (rank <= 10) return rank * 0.08;
  return 0.80 + (rank - 10) * 0.015;
}

// ==================== TOTAL DPS ====================
function totalDPS() {
  const clickPower = clickDmg();
  const automationRate = botRate();
  return clickPower * (1 + automationRate * 0.5);
}

// ==================== PRODUCTION ====================
function calcProd() {
  if (_statCache.prod !== null) return _statCache.prod;
  
  let baseRate = 0;
  if (Array.isArray(GENS)) {
    GENS.forEach(g => {
      const count = S.gen[g.id] || 0;
      if (count > 0) {
        baseRate += (g.prod * count * genMultiplier(g.id));
      }
    });
  }
  _statCache.prod = baseRate * globalProdMult();
  return _statCache.prod;
}

function genMultiplier(id) {
  let m = 1;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "gen" && u.gen === id && S.upgrades.includes(u.id)) {
        m *= (u.val || 1);
      }
    });
  }
  return m;
}

function globalProdMult() {
  let m = 1;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "prod" && S.upgrades.includes(u.id)) {
        m *= (u.val || 1);
      }
    });
  }
  
  // INFINITE Overdrive tier
  m *= Math.pow(INF_TIERS.prod.multPerLvl, infLevel("prod"));
  
  if (typeof getActiveSetBonus === "function") {
    const sets = getActiveSetBonus();
    if (sets.frutiger) m *= 3.0;
    if (sets.robomafia) m *= 1.5;
  }
  
  if (buffs && buffs.prod && buffs.prod.val) {
    m *= buffs.prod.val;
  }
  
  // Bot milestone global bonus
  m *= botMilestoneMult();
  
  return m;
}

function offMult() {
  let m = 1;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "off" && S.upgrades.includes(u.id)) {
        m += (u.val || 0);
      }
    });
  }
  // Infinite Memoria Assoluta tier
  m += (S.offOverdrive || 0) * 0.5;
  return m;
}

function genCost(g) {
  const owned = S.gen[g.id] || 0;
  return Math.round(g.base * Math.pow(1.15, owned));
}

// ==================== GENERATOR BULK BUY (×1 / ×5 / ×25 / MAX) ====================
function bulkGenCost(g, count) {
  const owned = S.gen[g.id] || 0;
  const r = 1.15;
  // Geometric series sum for `count` purchases starting at `owned`
  return g.base * Math.pow(r, owned) * (Math.pow(r, count) - 1) / (r - 1);
}

function maxAffordableGens(g) {
  const owned = S.gen[g.id] || 0;
  const r = 1.15;
  const first = g.base * Math.pow(r, owned);
  if (S.lire < first) return 0;
  // closed-form geometric: n = floor( log_r( lire*(r-1)/first + 1 ) )
  const inner = (S.lire * (r - 1)) / first + 1;
  return Math.min(500, Math.max(0, Math.floor(Math.log(inner) / Math.log(r))));
}

function botRate() {
  if (!S.botsOn) return 0;
  if (_statCache.botRate !== null) return _statCache.botRate;
  let totalStrikes = 0;
  if (Array.isArray(UBOT)) {
    UBOT.forEach(b => {
      const count = S.bots[b.id] || 0;
      totalStrikes += (count * b.val);
    });
  }
  if (typeof getActiveSetBonus === "function") {
    const sets = getActiveSetBonus();
    if (sets.sistema) totalStrikes *= 2.0;
  }
  _statCache.botRate = totalStrikes;
  return _statCache.botRate;
}

function canAfford(currency, cost) {
  if (currency === "r" || currency === "rottami") return (S.rottami || 0) >= cost;
  if (currency === "t" || currency === "biglietti") return (S.biglietti || 0) >= cost;
  return (S.lire || 0) >= cost;
}

// ==================== VITA MAX & RIGENERAZIONE ====================
// hpMax = base 100 + 5 per boss ucciso, moltiplicato dagli upgrade Sopravvivenza
function recalcHpMax() {
  const bossBonus = 5 * (S.bossDefeated || 0);
  let mult = 1;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "hp" && S.upgrades.includes(u.id)) mult += (u.val || 0);
    });
  }
  // Infinite Cuore Indistruttibile tier: +100% compounding-ish per level
  mult += (S.hpOverdrive || 0) * 1.0;
  
  const newMax = Math.max(100, Math.round((100 + bossBonus) * mult));
  if (S.hpMax !== newMax) {
    const wasFull = S.hp >= S.hpMax;
    S.hpMax = newMax;
    if (wasFull) S.hp = newMax; // keep full if we were full
  }
  return S.hpMax;
}

// Called after buying any upgrade — keeps HP max in sync
function regenPerSec() {
  if (_statCache.regen !== null) return _statCache.regen;
  let r = 1.2;
  if (Array.isArray(ALL_UPGRADES)) {
    ALL_UPGRADES.forEach(u => {
      if (u.type === "regen" && S.upgrades.includes(u.id)) r *= (u.val || 1);
    });
  }
  _statCache.regen = r;
  return r;
}
