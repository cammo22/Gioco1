/**
 * VESUVIO.EXE - Horde Wave & Combat System
 * Handles multi-monster formations (1-16), splash cleave, multistrikes and heat overcharge
 */
"use strict";

const ENEMIES = [
  { n: "Bug di Sistema", i: "🐛", hp: 12, xp: 6 },
  { n: "Glitch di Rete", i: "📡", hp: 25, xp: 10 },
  { n: "Ruggine di Strada", i: "⚙️", hp: 50, xp: 16 },
  { n: "Bomba Volatile", i: "💣", hp: 90, xp: 25 },
  { n: "Mariuolo di Ponticelli", i: "🎭", hp: 160, xp: 38 },
  { n: "Enforcer Balistico", i: "🛡️", hp: 280, xp: 60 },
  { n: "Gabbiano di Ferro", i: "🦅", hp: 480, xp: 95 },
  { n: "Granchio di Titanio", i: "🦀", hp: 800, xp: 150 },
  { n: "Polpo delle Profondità", i: "🐙", hp: 1400, xp: 240 },
  { n: "Squalo del Golfo", i: "🦈", hp: 2600, xp: 400 },
  { n: "Sfera Oscura 0x00", i: "🪐", hp: 5200, xp: 750 }
];

function getWaveSize(lvl, type) {
  if (type === "boss") return 1;
  if (lvl < 10) return 1;
  if (lvl < 25) return 2;
  if (lvl < 40) return 3;
  if (lvl < 55) return 4;
  if (lvl < 75) return 5;
  if (lvl < 100) return 6;
  if (lvl < 130) return 8;
  if (lvl < 165) return 10;
  if (lvl < 200) return 12;
  return Math.min(16, 12 + Math.floor((lvl - 200) / 40)); // Up to 16 horde
}

function getWaveType(lvl) {
  if (lvl < 50) {
    return (lvl % 5 === 0) ? "elite" : "normal";
  }
  if (lvl < 200) {
    return ((lvl - 50) % 5 === 0) ? "boss" : "normal";
  }
  // Lv 200+ Boss Frenzy: Boss every 3 levels
  return ((lvl - 200) % 3 === 0) ? "boss" : "normal";
}

function getEnemyTier(lvl) {
  const maxIdx = ENEMIES.length - 1;
  const scaled = Math.floor((lvl - 1) / 12);
  return Math.min(maxIdx, Math.max(0, scaled));
}

function calculateMonsterHp(enemyDef, type, isElite) {
  const dps = typeof totalDPS === "function" ? totalDPS() : 10;
  
  // Time to kill scaling (guarantees progression is incremental)
  let ttk = 1.0 + (S.lvl - 1) * 0.022;
  if (isElite) ttk *= 2.4;
  if (type === "boss") ttk = 6.0 + (S.lvl - 50) * 0.08;
  
  const dpsComponent = dps * ttk;
  const baseComponent = enemyDef.hp * Math.pow(1.08, Math.max(0, S.lvl - 1)) * (isElite ? 3.0 : 1.0);
  
  return Math.round(Math.max(baseComponent, dpsComponent));
}

function spawnWave() {
  if (typeof stopBossTimer === "function") stopBossTimer();
  
  S.enemyType = getWaveType(S.lvl);
  S.waveStats = { kills: 0, lire: 0, xp: 0, drops: [] };
  
  // BOSS WAITING ROOM: on a boss level, don't spawn the boss until engaged
  if (S.enemyType === "boss" && !S.bossWaiting && typeof engageBoss !== "function") {
    // legacy fallback (shouldn't happen with new boss-system)
  }
  if (S.enemyType === "boss" && S.bossWaiting) {
    S.wave = [];
    S.focus = 0;
    renderWaveGrid(true);
    updateBossApproachUI();
    return;
  }
  
  if (S.enemyType === "boss") {
    if (typeof spawnBossMonster === "function") {
      S.wave = [spawnBossMonster()];
    }
  } else {
    const size = getWaveSize(S.lvl, S.enemyType);
    const isEliteWave = S.enemyType === "elite";
    const tier = getEnemyTier(S.lvl);
    const arr = [];
    
    for (let i = 0; i < size; i++) {
      const isEliteMon = isEliteWave && (i === 0);
      const enemyIdx = Math.max(0, tier - (Math.random() < 0.4 ? 1 : 0));
      const def = ENEMIES[enemyIdx] || ENEMIES[0];
      const maxHp = calculateMonsterHp(def, S.enemyType, isEliteMon);
      
      arr.push({
        id: `mon_${Date.now()}_${i}`,
        idx: enemyIdx,
        hp: maxHp,
        max: maxHp,
        elite: isEliteMon,
        boss: false
      });
    }
    S.wave = arr;
  }
  
  S.focus = 0;
  renderWaveGrid(true);
  if (typeof updateBossApproachUI === "function") updateBossApproachUI();
}

function renderWaveGrid(rebuild = false) {
  const grid = document.getElementById("waveGrid");
  if (!grid) return;
  
  if (rebuild) {
    grid.innerHTML = "";
    const size = Array.isArray(S.wave) ? S.wave.length : 1;
    grid.className = `waveGrid f${Math.min(16, Math.max(1, size))}`;
    
    if (Array.isArray(S.wave)) {
      S.wave.forEach((m, idx) => {
        const div = document.createElement("div");
        div.className = `mon ${m.boss ? "boss" : (m.elite ? "elite" : "")} ${idx === S.focus ? "focused" : ""}`;
        div.id = `mon_card_${idx}`;
        
        let icon = "";
        let name = "";
        
        if (m.boss) {
          const b = BOSSES[m.bossIdx] || BOSSES[0];
          icon = typeof getBossSVG === "function" ? getBossSVG(m.bossIdx) : b.i;
          name = `💀 BOSS · ${b.n}`;
        } else {
          const def = ENEMIES[m.idx] || ENEMIES[0];
          icon = def.i;
          name = m.elite ? `⭐ ELITE · ${def.n}` : def.n;
        }
        
        div.innerHTML = `
          <div class="mi">${icon}</div>
          <div class="mn">${name}</div>
          <div class="mb"><div class="mf" style="width: 100%;"></div></div>
          <div class="ml">${fmt(m.hp)}</div>
        `;
        
        div.onclick = (e) => {
          e.stopPropagation();
          S.focus = idx;
          performManualAttack(idx);
        };
        
        grid.appendChild(div);
      });
    }
  } else {
    // Lightweight progress bar and label update
    if (Array.isArray(S.wave)) {
      S.wave.forEach((m, idx) => {
        const card = document.getElementById(`mon_card_${idx}`);
        if (card) {
          card.classList.toggle("focused", idx === S.focus);
          const bar = card.querySelector(".mf");
          const lbl = card.querySelector(".ml");
          if (bar) bar.style.width = Math.max(0, (m.hp / m.max) * 100).toFixed(1) + "%";
          if (lbl) lbl.textContent = m.hp > 0 ? fmt(Math.ceil(m.hp)) : "DEFEATED";
          if (m.hp <= 0) card.style.opacity = "0.2";
        }
      });
    }
  }
}

function getAliveMonsters() {
  if (!Array.isArray(S.wave)) return [];
  return S.wave.filter(m => m.hp > 0);
}

function performManualAttack(targetIdx) {
  if (S.down) return;
  S.stats.clicks = (S.stats.clicks || 0) + 1;
  
  // Heat Overcharge accumulation
  S.heat = Math.min(S.heatMax, (S.heat || 0) + 2.5);
  if (S.heat >= S.heatMax && !S.isOvercharged) {
    activateOvercharge();
  }
  
  executeAttack(false, targetIdx);
  
  if (typeof render === "function") render();
  // No saveGame() per click: the 15s autosave + beforeunload cover it,
  // and serializing the whole state (telemetry included) on every click
  // was a major stutter at high CPS.
}

function activateOvercharge() {
  S.isOvercharged = true;
  invalidateStatCache();
  S.stats.overcharges = (S.stats.overcharges || 0) + 1;
  if (typeof sOvercharge === "function") sOvercharge();
  if (typeof toast === "function") {
    toast("🔥", "SOVRACCARICO TERMICO!", "Danno moltiplicato al massimo per 10 secondi!");
  }
  
  const heatFill = document.getElementById("heatFill");
  if (heatFill) heatFill.classList.add("overcharged");
  
  setTimeout(() => {
    S.isOvercharged = false;
    S.heat = 0;
    invalidateStatCache();
    if (heatFill) heatFill.classList.remove("overcharged");
  }, 10000);
}

let _lastWaveRenderT = 0;

function executeAttack(isAuto = false, specificIdx = null) {
  if (S.down) return;
  const alive = getAliveMonsters();
  if (alive.length === 0) return;
  
  let target;
  if (specificIdx !== null && S.wave[specificIdx] && S.wave[specificIdx].hp > 0) {
    target = S.wave[specificIdx];
    S.focus = specificIdx;
  } else if (!isAuto && S.focus !== null && S.wave[S.focus] && S.wave[S.focus].hp > 0) {
    target = S.wave[S.focus];
  } else {
    target = alive[Math.floor(Math.random() * alive.length)];
  }
  
  // Base Click Damage & Critical Check
  let dmg = typeof clickDmg === "function" ? clickDmg() : 10;
  const isCrit = Math.random() < (typeof critChance === "function" ? critChance() : 0.05);
  if (isCrit) {
    dmg *= (typeof critMult === "function" ? critMult() : 3.5);
    if (typeof sCrit === "function") sCrit();
  } else if (!isAuto) {
    if (typeof sHit === "function") sHit();
  }
  
  // Multi-strike Check
  let strikeCount = 1;
  const multiChance = typeof multistrikeChance === "function" ? multistrikeChance() : 0;
  if (Math.random() < multiChance) {
    strikeCount = Math.random() < 0.25 ? 3 : 2;
    dmg *= strikeCount;
    S.stats.multistrikes = (S.stats.multistrikes || 0) + 1;
    if (typeof sMultistrike === "function") sMultistrike();
  }
  
  target.hp = Math.max(0, target.hp - dmg);
  
  // Floating Damage Label
  showFloatingDamage(target, dmg, isCrit, strikeCount > 1, false);
  
  // Cleave / Splash Damage to other monsters in wave
  const splashPct = typeof splashDamagePercent === "function" ? splashDamagePercent() : 0;
  if (splashPct > 0 && alive.length > 1) {
    const splashDmg = Math.round(dmg * splashPct);
    alive.forEach(m => {
      if (m !== target && m.hp > 0) {
        m.hp = Math.max(0, m.hp - splashDmg);
        showFloatingDamage(m, splashDmg, false, false, true);
        if (m.hp <= 0) processMonsterDeath(m);
      }
    });
  }
  
  // Hit flinch animation
  const card = document.getElementById(`mon_card_${S.wave.indexOf(target)}`);
  if (card) {
    card.classList.add("hit");
    setTimeout(() => card.classList.remove("hit"), 100);
  }
  
  if (target.hp <= 0) {
    processMonsterDeath(target);
  }
  
  // Throttled wave UI refresh: at 10+ bot strikes/s a full DOM pass per
  // strike was pure overhead — 100ms cadence is visually identical.
  const nowMs = performance.now();
  if (nowMs - _lastWaveRenderT >= 100) {
    _lastWaveRenderT = nowMs;
    renderWaveGrid(false);
  }
}

function showFloatingDamage(monster, amount, isCrit, isMulti, isCleave) {
  // FX budget: with 10+ bot strikes/s × cleave on 6+ monsters the arena
  // accumulated hundreds of animated nodes and starved the compositor.
  // Cleaves skip the visual entirely; direct hits respect a hard cap.
  if (isCleave) return;
  
  const card = document.getElementById(`mon_card_${S.wave.indexOf(monster)}`);
  const container = card || document.getElementById("dmgLayer") || document.getElementById("arena");
  if (!container) return;
  
  const budget = container === document.getElementById("arena") ? 12 : 6;
  const existing = container.querySelectorAll(".dmgfloat");
  if (existing.length >= budget) {
    // Recycle the oldest instead of piling up
    existing[existing.length - 1].remove();
  }
  
  const span = document.createElement("div");
  span.className = `dmgfloat ${isCrit ? "crit" : ""} ${isMulti ? "multistrike" : ""} ${isCleave ? "cleave" : ""}`;
  
  let label = fmt(Math.max(1, Math.round(amount)));
  if (isCrit) label = "💥 " + label;
  if (isMulti) label = "⚡x" + label;
  span.textContent = label;
  
  span.style.left = (Math.random() * 50 + 20) + "%";
  span.style.top = (Math.random() * 40 + 10) + "%";
  
  container.appendChild(span);
  setTimeout(() => span.remove(), 850);
}

function processMonsterDeath(monster) {
  monster.hp = 0;
  
  if (monster.boss) {
    if (typeof handleBossDefeat === "function") {
      handleBossDefeat(monster);
    }
    return;
  }
  
  S.kills = (S.kills || 0) + 1;
  const def = ENEMIES[monster.idx] || ENEMIES[0];
  
  // Rewards calculation
  let xp = Math.max(8, Math.round(monster.max * 0.12));
  let lire = Math.max(1, Math.round(monster.max * 0.08));
  
  if (monster.elite) {
    xp *= 2.5;
    lire *= 2.5;
  }
  
  // Set synergy for lire
  if (typeof getActiveSetBonus === "function") {
    const sets = getActiveSetBonus();
    if (sets.robomafia) lire *= 2.5;
  }
  
  S.xp = (S.xp || 0) + xp;
  S.lire = (S.lire || 0) + lire;
  S.totalLire = (S.totalLire || 0) + lire;
  
  S.waveStats.xp += xp;
  S.waveStats.lire += lire;
  S.waveStats.kills += 1;
  
  // Material drops
  const drops = [];
  if (Math.random() < 0.35) {
    const rottamiGained = Math.floor(Math.random() * 6) + 2;
    S.rottami = (S.rottami || 0) + rottamiGained;
    drops.push(`⚙️+${rottamiGained}`);
  }
  
  if (monster.elite || Math.random() < 0.08) {
    S.biglietti = (S.biglietti || 0) + 1;
    drops.push("🎟️+1");
  }
  
  if (drops.length > 0) {
    S.waveStats.drops = S.waveStats.drops.concat(drops);
  }
  
  // Level Up Check
  checkLevelUp();
  
  if (typeof checkAch === "function") checkAch();
  
  // Wave Completion Check
  if (getAliveMonsters().length === 0) {
    completeWave();
  }
}

function checkLevelUp() {
  let leveled = false;
  while (S.xp >= (typeof xpNeed === "function" ? xpNeed(S.lvl) : 100)) {
    S.xp -= xpNeed(S.lvl);
    S.lvl = (S.lvl || 1) + 1;
    leveled = true;
  }
  
  if (leveled) {
    invalidateStatCache();
    if (typeof sLevel === "function") sLevel();
    // Level-up toast only every 5 levels (anti-spam at high pace)
    if (typeof toast === "function" && S.lvl % 5 === 0) {
      toast("⚡", `LIVELLO ${S.lvl}!`, "Danni e statistiche potenziati!");
    }
  }
}

function completeWave() {
  if (S.enemyType === "boss") return;
  
  if (typeof sKill === "function") sKill();
  
  const ar = document.getElementById("arena");
  if (ar) {
    const kf = document.createElement("div");
    kf.className = "killflash";
    ar.appendChild(kf);
    setTimeout(() => kf.remove(), 850);
  }
  
  // Wave completion toast: only for big waves (anti-spam)
  const stats = S.waveStats;
  if (typeof toast === "function" && stats.kills >= 4) {
    toast(
      "⚔️",
      "Onda Sconfitta",
      `${stats.kills} nemici · +${fmt(stats.lire)} Lire · +${fmt(stats.xp)} XP`
    );
  }
  
  S.waveCount = (S.waveCount || 0) + 1;
  
  setTimeout(() => {
    spawnWave();
  }, 400);
}
