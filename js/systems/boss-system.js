/**
 * VESUVIO.EXE - Boss System & Defeat/Retreat Management
 * 8 Lore Bosses, real-time incoming attacks, HP down & safe room retreat option
 */
"use strict";

const BOSSES = [
  { n: "Il Capitano", i: "🪖", hp: 3500, atk: 4, xp: 400 },
  { n: "Mister K", i: "🕶️", hp: 8000, atk: 7, xp: 900 },
  { n: "Madonnina Nera", i: "🕯️", hp: 19000, atk: 11, xp: 2200 },
  { n: "I Gemelli", i: "🎭", hp: 45000, atk: 16, xp: 5000 },
  { n: "La Vipera", i: "🐍", hp: 110000, atk: 24, xp: 12000 },
  { n: "Bomba", i: "💣", hp: 280000, atk: 35, xp: 28000 },
  { n: "Ruggine", i: "🦀", hp: 750000, atk: 50, xp: 65000 },
  { n: "sinteticoMC", i: "👁️", hp: 2000000, atk: 75, xp: 150000 }
];

let bossAttackInterval = null;

// Boss engagement state: boss levels start in "waiting" mode until the player
// presses VAI AL BOSS. Retreating drops one level for safe farming and keeps
// the TORNA AL BOSS button until the player is ready.
let bossEngaged = false;
let retreatedFromBossLvl = null; // remembers where to come back when re-engaging

function isBossLevel(lvl) {
  return typeof getWaveType === "function" && getWaveType(lvl || S.lvl) === "boss";
}

function updateBossApproachUI() {
  const bar = document.getElementById("bossApproach");
  const rbar = document.getElementById("retreatBar");
  const waiting = !!S.bossWaiting && !S.down;
  
  // Case A: just arrived on a boss level (still standing there)
  if (bar) bar.style.display = (waiting && retreatedFromBossLvl === null) ? "flex" : "none";
  // Case B: retreated to the previous room — persistent re-engage button
  if (rbar) rbar.style.display = (waiting && retreatedFromBossLvl !== null) ? "flex" : "none";
}

// Called by VAI AL BOSS / TORNA AL BOSS
function engageBoss() {
  // Coming back from a retreat: restore the saved boss level first
  if (retreatedFromBossLvl !== null) {
    S.lvl = retreatedFromBossLvl;
    retreatedFromBossLvl = null;
    if (typeof invalidateStatCache === "function") invalidateStatCache();
  }
  S.bossWaiting = false;
  bossEngaged = true;
  updateBossApproachUI();
  if (typeof toast === "function") toast("⚔️", "AL COMBATTIMENTO!", "Il Boss ti aspetta nell'arena.");
  if (typeof spawnWave === "function") spawnWave();
}

function spawnBossMonster() {
  const bossIdx = (S.bossDefeated || 0) % BOSSES.length;
  const def = BOSSES[bossIdx];
  
  // Exponential scaling for level 50+ and 200+ frenzy
  const levelOver50 = Math.max(0, S.lvl - 50);
  let scale = 1 + levelOver50 * 0.12;
  if (S.lvl >= 200) {
    scale *= (1 + (S.lvl - 200) * 0.035);
  }
  
  const dps = typeof totalDPS === "function" ? totalDPS() : 50;
  const ttk = 6.0 + levelOver50 * 0.08;
  const hpFromDps = dps * ttk;
  const baseHp = def.hp * scale * Math.pow(1.05, Math.min(100, levelOver50));
  
  const finalMaxHp = Math.round(Math.max(baseHp, hpFromDps));
  
  // Warning sound & notification
  if (typeof sBossWarning === "function") sBossWarning();
  if (typeof toast === "function") {
    toast("⚠️", "ALLERTA BOSS!", `${def.n} è entrato nell'Arena!`);
  }
  
  startBossTimer(def);
  
  return {
    id: `boss_${Date.now()}`,
    boss: true,
    bossIdx: bossIdx,
    hp: finalMaxHp,
    max: finalMaxHp,
    elite: false
  };
}

function startBossTimer(bossDef) {
  stopBossTimer();
  S.bossActive = true;
  
  // Lv 200+ frenzy attacks faster
  const interval = S.lvl >= 200 ? 950 : 1800;
  
  bossAttackInterval = setInterval(() => {
    executeBossAttack(bossDef);
  }, interval);
}

function stopBossTimer() {
  if (bossAttackInterval) {
    clearInterval(bossAttackInterval);
    bossAttackInterval = null;
  }
  S.bossActive = false;
}

function executeBossAttack(bossDef) {
  if (!S.bossActive || S.down || !Array.isArray(S.wave) || S.wave.length === 0) return;
  
  const boss = S.wave[0];
  if (!boss || boss.hp <= 0) return;
  
  // Attack damage scaling
  const levelOver50 = Math.max(0, S.lvl - 50);
  let dmg = bossDef.atk * (1 + levelOver50 * 0.08);
  if (S.lvl >= 200) dmg *= 1.75;
  
  // Set synergy (Enforcer set reflects and mitigates damage)
  if (typeof getActiveSetBonus === "function") {
    const sets = getActiveSetBonus();
    if (sets.enforcer) {
      dmg *= 0.8; // 20% mitigation
      const reflectDmg = Math.round(dmg * 0.25);
      boss.hp = Math.max(0, boss.hp - reflectDmg);
      if (typeof showFloatingDamage === "function") {
        showFloatingDamage(boss, reflectDmg, false, false, true);
      }
    }
  }
  
  dmg = Math.round(Math.max(2, dmg));
  S.hp = Math.max(0, (S.hp || 100) - dmg);
  
  if (typeof sBossStrike === "function") sBossStrike();
  
  // Arena hit outline & player bar damage float
  const ar = document.getElementById("arena");
  if (ar) {
    ar.style.outline = "3px solid rgba(255, 60, 60, 0.7)";
    setTimeout(() => { ar.style.outline = ""; }, 180);
  }
  
  const pb = document.getElementById("playerBar");
  if (pb) {
    const fl = document.createElement("div");
    fl.textContent = `-${dmg} ❤️`;
    fl.style.cssText = "position:absolute;right:80px;top:8px;font-weight:900;color:#ff5252;font-size:1rem;pointer-events:none;animation:floatDmg 1s ease-out forwards;";
    pb.style.position = "relative";
    pb.appendChild(fl);
    setTimeout(() => fl.remove(), 950);
  }
  
  renderPlayerHp();
  
  if (S.hp <= 0) {
    handlePlayerDowned();
  }
}

function handlePlayerDowned() {
  S.down = true;
  S.downAt = Date.now();
  stopBossTimer();
  
  // Trigger Market Panic in Borsa
  if (typeof triggerMarketPanic === "function") {
    triggerMarketPanic();
  }
  
  const ov = document.getElementById("downOverlay");
  if (ov) {
    ov.classList.add("on");
    updateDownOverlayUI();
  }
  
  if (typeof sErr === "function") sErr();
  if (typeof toast === "function") {
    toast("💀", "SISTEMA ABBATTUTO!", "Sei caduto in combattimento!");
  }
}

function updateDownOverlayUI() {
  const el = document.getElementById("downTimer");
  if (el && S.down) {
    const remaining = Math.max(0, Math.ceil(6 - (Date.now() - S.downAt) / 1000));
    el.textContent = `Riavvio automatico tra ${remaining}s… oppure torna alla stanza precedente per potenziarti.`;
  }
}

// OPTION 1: INSTANT REPAIR
function repairPlayer(instant = false) {
  if (!S.down) return;
  
  if (!instant && (S.rottami || 0) < 50) {
    if (typeof sErr === "function") sErr();
    if (typeof toast === "function") {
      toast("⚙️", "Rottami Insufficienti", "Servono 50 Rottami per riparare istantaneamente.");
    }
    return;
  }
  
  if (!instant) S.rottami -= 50;
  S.down = false;
  S.hp = Math.round(S.hpMax * 0.75);
  
  const ov = document.getElementById("downOverlay");
  if (ov) ov.classList.remove("on");
  
  if (typeof sBuy === "function") sBuy();
  renderPlayerHp();
  
  // Resume combat
  if (S.enemyType === "boss" && Array.isArray(S.wave) && S.wave.length > 0 && S.wave[0].hp > 0) {
    const b = BOSSES[S.wave[0].bossIdx] || BOSSES[0];
    startBossTimer(b);
  }
  
  if (typeof saveGame === "function") saveGame();
}

// OPTION 2: RETREAT TO PREVIOUS SAFE ROOM
function retreatToPreviousRoom() {
  if (!S.down && !S.bossActive) return;
  
  S.down = false;
  S.hp = Math.round(S.hpMax * 0.5);
  stopBossTimer();
  S.stats.retreats = (S.stats.retreats || 0) + 1;
  
  // Remember the boss room, drop one level for safe farming.
  // The player can farm as long as they want; TORNA AL BOSS stays available.
  retreatedFromBossLvl = S.lvl;
  S.lvl = Math.max(1, S.lvl - 1);
  if (typeof invalidateStatCache === "function") invalidateStatCache();
  S.bossWaiting = true;   // keep boss pending
  bossEngaged = false;
  S.xp = 0; // no XP loss, just a safe room
  
  const ov = document.getElementById("downOverlay");
  if (ov) ov.classList.remove("on");
  
  if (typeof toast === "function") {
    toast("↩️", "Ritirata Strategica", `Stanza sicura al Livello ${S.lvl}. Riprenditi e torna al Boss quando vuoi.`);
  }
  
  renderPlayerHp();
  updateBossApproachUI();
  if (typeof spawnWave === "function") spawnWave();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
}

// AUTO REVIVE CHECK IN LOOP
function checkAutoRevive() {
  if (S.down) {
    updateDownOverlayUI();
    if (Date.now() - S.downAt > 6000) {
      S.down = false;
      S.hp = Math.round(S.hpMax * 0.5);
      
      const ov = document.getElementById("downOverlay");
      if (ov) ov.classList.remove("on");
      
      if (typeof toast === "function") {
        toast("🔧", "Sistema Riavviato", "Energia ripristinata al 50%.");
      }
      
      renderPlayerHp();
      
      if (S.enemyType === "boss" && Array.isArray(S.wave) && S.wave.length > 0 && S.wave[0].hp > 0) {
        const b = BOSSES[S.wave[0].bossIdx] || BOSSES[0];
        startBossTimer(b);
      }
      
      if (typeof saveGame === "function") saveGame();
    }
  }
}

function handleBossDefeat(bossMonster) {
  stopBossTimer();
  
  const b = BOSSES[bossMonster.bossIdx] || BOSSES[0];
  const levelOver50 = Math.max(0, S.lvl - 50);
  let multiplier = 1 + levelOver50 * 0.15;
  if (S.lvl >= 200) multiplier *= 2.5;
  
  // Massive Boss Rewards
  const lireGains = Math.round(bossMonster.max * 0.22 * multiplier);
  const xpGains = Math.round(bossMonster.max * 0.18 * multiplier);
  const rottamiGains = Math.floor(Math.random() * 50) + 35;
  const ticketsGained = Math.floor(Math.random() * 3) + 1;
  
  S.lire += lireGains;
  S.totalLire += lireGains;
  S.xp += xpGains;
  S.rottami += rottamiGains;
  S.biglietti += ticketsGained;
  
  S.bossDefeated = (S.bossDefeated || 0) + 1;
  S.stats.bossDefeats = (S.stats.bossDefeats || 0) + 1;
  
  // Permanent Max HP Boost (recalc includes 5/boss)
  if (typeof recalcHpMax === "function") recalcHpMax();
  S.hp = Math.min(S.hpMax, S.hp + 25);
  
  if (typeof sBossDefeat === "function") sBossDefeat();
  
  const ar = document.getElementById("arena");
  if (ar) {
    const kf = document.createElement("div");
    kf.className = "killflash";
    ar.appendChild(kf);
    setTimeout(() => kf.remove(), 950);
  }
  
  if (typeof toast === "function") {
    toast(
      "🏆",
      `BOSS ABBATTUTO: ${b.n}!`,
      `+${fmt(lireGains)} Lire · +${fmt(xpGains)} XP · +${rottamiGains} ⚙️ · +${ticketsGained} 🎟️ · +5 Max ❤️!`
    );
  }
  
  if (typeof checkLevelUp === "function") checkLevelUp();
  if (typeof checkAch === "function") checkAch();
  
  S.waveCount = (S.waveCount || 0) + 1;
  renderPlayerHp();
  
  setTimeout(() => {
    if (typeof spawnWave === "function") spawnWave();
  }, 650);
}

function renderPlayerHp() {
  const fill = document.getElementById("pHpFill");
  const lbl = document.getElementById("hpLbl");
  const hp = Math.max(0, S.hp || 0);
  const max = S.hpMax || 100;
  
  if (fill) fill.style.width = Math.min(100, Math.max(0, (hp / max) * 100)).toFixed(1) + "%";
  if (lbl) lbl.textContent = `${Math.ceil(hp)} / ${Math.ceil(max)}`;
}
