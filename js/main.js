/**
 * VESUVIO.EXE - Main Orchestrator & Game Loop
 * Bootstraps all modular systems, 60 FPS tick, live affordances & character customizer
 */
"use strict";

let currentActiveTab = "tabGen";
let affordanceFrameCounter = 0;
let lastLoopTime = performance.now();
let killsWindowStartT = 0;
let killsWindowStartK = 0;

// ACHIEVEMENTS CATALOG
const ACHIEVEMENTS = [
  { i: "🌋", n: "Prima Scintilla", d: "Ottieni 1.000 Lire", c: s => s.totalLire >= 1e3, r: s => { s.rottami += 25; } },
  { i: "⚡", n: "Energia di Base", d: "Raggiungi 1M Lire totali", c: s => s.totalLire >= 1e6, r: s => { s.rottami += 80; } },
  { i: "💥", n: "Eruzione Record", d: "Raggiungi 1B Lire totali", c: s => s.totalLire >= 1e9, r: s => { s.rottami += 250; s.biglietti += 1; } },
  { i: "🌟", n: "Il Vulcano è Legge", d: "Raggiungi 1T Lire totali", c: s => s.totalLire >= 1e12, r: s => { s.rottami += 800; s.biglietti += 3; } },
  { i: "👑", n: "Trilionario del Golfo", d: "Raggiungi 500T Lire (Endgame)", c: s => s.totalLire >= 5e14, r: s => { s.rottami += 5000; s.biglietti += 10; } },
  { i: "🤖", n: "Primo Assistente", d: "Acquista 1 generatore", c: s => Object.values(s.gen || {}).some(v => v > 0), r: s => { s.rottami += 15; } },
  { i: "🏭", n: "Quartiere Industriale", d: "Possiedi 20 generatori totali", c: s => Object.values(s.gen || {}).reduce((a, b) => a + b, 0) >= 20, r: s => { s.rottami += 40; } },
  { i: "🏰", n: "Reggimondo", d: "Possiedi 60 generatori totali", c: s => Object.values(s.gen || {}).reduce((a, b) => a + b, 0) >= 60, r: s => { s.rottami += 150; } },
  { i: "🔨", n: "Manutentore", d: "Compra 10 potenziamenti", c: s => (s.upgrades || []).length >= 10, r: s => { s.rottami += 60; } },
  { i: "⚔️", n: "Macellatore di Codici", d: "Elimina 200 nemici", c: s => (s.kills || 0) >= 200, r: s => { s.rottami += 250; } },
  { i: "🏆", n: "Signore delle Orde", d: "Elimina 2.000 nemici", c: s => (s.kills || 0) >= 2000, r: s => { s.rottami += 1000; s.biglietti += 2; } },
  { i: "⚡", n: "Livello 10", d: "Raggiungi il livello 10", c: s => (s.lvl || 1) >= 10, r: s => { s.rottami += 100; } },
  { i: "💠", n: "Livello 50 (Sblocco Boss)", d: "Raggiungi il livello 50", c: s => (s.lvl || 1) >= 50, r: s => { s.rottami += 500; s.biglietti += 2; } },
  { i: "🌌", n: "Livello 200 (Boss Frenzy)", d: "Raggiungi il livello 200", c: s => (s.lvl || 1) >= 200, r: s => { s.rottami += 2000; s.biglietti += 5; } },
  { i: "👊", n: "Principe dei Boss", d: "Abbatti il tuo primo Boss", c: s => (s.bossDefeated || 0) >= 1, r: s => { s.rottami += 400; s.biglietti += 1; } },
  { i: "💀", n: "Sterminatore di Boss", d: "Sconfiggi 10 Boss", c: s => (s.bossDefeated || 0) >= 10, r: s => { s.rottami += 1800; s.biglietti += 5; } },
  { i: "🎮", n: "Gioconauta", d: "Gioca 5 minigiochi", c: s => (s.stats.mgPlayed || 0) >= 5, r: s => { s.rottami += 60; } },
  { i: "🎡", n: "Giro della Fortuna", d: "Gira la Ruota 5 volte", c: s => (s.stats.wheelSpins || 0) >= 5, r: s => { s.rottami += 150; } },
  { i: "🛍️", n: "Collezionista della Merceria", d: "Possiedi 5 oggetti di set", c: s => (s.inventory || []).length >= 5, r: s => { s.rottami += 250; } },
  { i: "🪽", n: "Fatti le Ali", d: "Equipaggia un paio di ali", c: s => (s.rob && s.rob.wing && s.rob.wing !== "none"), r: s => { s.rottami += 150; } },
  { i: "🖱️", n: "Dito d'Acciaio", d: "10.000 click totali", c: s => (s.stats.clicks || 0) >= 10000, r: s => { s.rottami += 400; } },
  { i: "🌋", n: "Cacciatore di Lava", d: "Raccogli 10 gocce di lava", c: s => (s.stats.lavaDropsCollected || 0) >= 10, r: s => { s.rottami += 200; s.biglietti += 1; } }
];

function initGame() {
  initGameState();
  bindGlobalEvents();
  initWorldEngine();
  initBorsaTelemetry();
  initWorkshop();
  initMerceria();
  
  // Render initial components
  renderGeneratorsGrid();
  renderUpgradesList();
  renderMerceria();
  renderMinigamesList();
  renderCharacterCustomizer();
  renderCharacterViewer();
  renderAchievementsGrid();
  renderStatsView();
  
  // Spawn starting wave
  spawnWave();
  
  // Render HUD
  renderHUD();
  
  // Start main loop
  lastLoopTime = performance.now();
  requestAnimationFrame(mainGameLoop);
}

function bindGlobalEvents() {
  // Tabs
  const tabs = document.querySelectorAll("#tabs .tab");
  tabs.forEach(t => {
    t.onclick = () => openTab(t.dataset.tab);
  });
  
  // Arena background click
  const arena = document.getElementById("arena");
  if (arena) {
    arena.addEventListener("click", () => {
      performManualAttack(null);
    });
  }
  
  // Bot Toggle
  const botToggleBtn = document.getElementById("botToggle");
  if (botToggleBtn) {
    botToggleBtn.onclick = (e) => {
      e.stopPropagation();
      S.botsOn = !S.botsOn;
      invalidateStatCache();
      renderHUD();
      if (typeof sClick === "function") sClick();
      if (typeof toast === "function") {
        toast(S.botsOn ? "🤖" : "⏸️", `Automi ${S.botsOn ? "ATTIVI" : "DISATTIVATI"}`, S.botsOn ? "I robot attaccano a raffica!" : "Hai fermato l'automazione.");
      }
      saveGame();
    };
  }
  
  // Downed overlay buttons
  const repairBtn = document.getElementById("repairBtn");
  if (repairBtn) {
    repairBtn.onclick = (e) => {
      e.stopPropagation();
      repairPlayer(false);
    };
  }
  
  const retreatBtn = document.getElementById("retreatBtn");
  if (retreatBtn) {
    retreatBtn.onclick = (e) => {
      e.stopPropagation();
      retreatToPreviousRoom();
    };
  }
  
  // Boss engagement buttons
  const engageBossBtn = document.getElementById("engageBossBtn");
  if (engageBossBtn) {
    engageBossBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof engageBoss === "function") engageBoss();
    };
  }
  
  const reEngageBossBtn = document.getElementById("reEngageBossBtn");
  if (reEngageBossBtn) {
    reEngageBossBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof engageBoss === "function") engageBoss();
    };
  }
  
  // Modal close
  const closeBtn = document.getElementById("gameClose");
  if (closeBtn) closeBtn.onclick = closeMinigameModal;
  
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMinigameModal();
    });
  }
  
  // Merceria reroll & Wheel
  const rerollBtn = document.getElementById("rerollShopBtn");
  if (rerollBtn) {
    rerollBtn.onclick = () => rerollMerceriaCatalog(true);
  }
  
  const wheelBtn = document.getElementById("wheelBtn");
  if (wheelBtn) {
    wheelBtn.onclick = () => {
      if (typeof startMinigameRuota === "function") startMinigameRuota();
    };
  }
  
  // Periodic Save (15s)
  setInterval(saveGame, 15000);
  window.addEventListener("beforeunload", () => {
    if (typeof marketSave === "function") marketSave();
    saveGame();
  });
}

function openTab(tabName) {
  currentActiveTab = tabName;
  
  document.querySelectorAll("#tabs .tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });
  
  document.querySelectorAll("#panels .panel").forEach(p => {
    p.classList.toggle("active", p.id === tabName);
  });
  
  if (tabName === "tabGen") renderGeneratorsGrid();
  else if (tabName === "tabUpg") renderUpgradesList();
  else if (tabName === "tabMini") renderMinigamesList();
  else if (tabName === "tabBorsa") {
    drawBorsaCanvas();
    renderBorsaTicker();
  }
  else if (tabName === "tabMerc") renderMerceria();
  else if (tabName === "tabRob") renderCharacterCustomizer();
  else if (tabName === "tabAch") {
    renderStatsView();
    renderAchievementsGrid();
  }
  
  saveGame();
}

// 60 FPS MAIN LOOP
function mainGameLoop(now) {
  const dt = Math.min(1.0, (now - lastLoopTime) / 1000);
  lastLoopTime = now;
  
  // 1. Passive Lire production
  if (typeof _sweepBuffs === "function") _sweepBuffs();
  const prodRate = calcProd();
  if (prodRate > 0) {
    const gained = prodRate * dt;
    S.lire += gained;
    S.totalLire += gained;
  }
  
  // 2. Automation bot strikes
  const totalBots = botRate();
  if (totalBots > 0 && S.botsOn && !S.down) {
    const attacksThisTick = totalBots * dt;
    if (attacksThisTick >= 1 || Math.random() < attacksThisTick) {
      const count = Math.max(1, Math.floor(attacksThisTick));
      for (let i = 0; i < count; i++) {
        executeAttack(true, null);
      }
    }
  }
  // 2b. Kills per second tracker (for Borsa HUD)
  if (!killsWindowStartT) { killsWindowStartT = now; killsWindowStartK = S.kills || 0; }
  const kSpan = (now - killsWindowStartT) / 1000;
  if (kSpan >= 3) {
    S.stats.killsPerSec = Math.round(((S.kills || 0) - killsWindowStartK) / kSpan * 10) / 10;
    killsWindowStartT = now;
    killsWindowStartK = S.kills || 0;
  }
  
  // 3. Player Energy Regeneration
  if (!S.down && S.hp < S.hpMax) {
    const baseRegen = typeof regenPerSec === "function" ? regenPerSec() : 1.2;
    const regenRate = S.enemyType === "boss" ? baseRegen * 0.3 : baseRegen;
    S.hp = Math.min(S.hpMax, S.hp + regenRate * dt);
    renderPlayerHp();
  }
  
  // 4. Downed auto-revive timer
  checkAutoRevive();
  
  // 4b. Automa Ultimate unlock check + button refresh (throttled)
  if (!S.ultUnlocked && typeof totalBotLevels === "function" && totalBotLevels() >= ULT_UNLOCK_LEVEL) {
    S.ultUnlocked = true;
    if (typeof toast === "function") {
      toast("☄️", "ABILITÀ SBLOCCATA!", "PROTOCOLO VESUVIO: trova il nuovo pulsante nella barra del robot!", { dur: 5000 });
    }
    if (typeof sWin === "function") sWin();
    saveGame();
  }
  if (affordanceFrameCounter % 10 === 0 && typeof renderUltButton === "function") renderUltButton();
  
  // 5. Ticket Workshop Progress
  tickWorkshop(dt);
  
  // 6. Real-time Market Sampling
  sampleMarketData();
  
  // 7. Live Affordability Checks (throttled ~6/s — enough for the eye)
  affordanceFrameCounter++;
  if (affordanceFrameCounter % 10 === 0) {
    refreshAffordabilityLive();
    updateFloatingBorsaHud();
  }
  
  // 8. Borsa Redraw (if active tab)
  if (currentActiveTab === "tabBorsa" && affordanceFrameCounter % 15 === 0) {
    drawBorsaCanvas();
    renderBorsaTicker();
  }
  
  // 9. Periodic HUD update
  if (affordanceFrameCounter % 8 === 0) {
    renderHUD();
  }
  
  requestAnimationFrame(mainGameLoop);
}

function renderHUD() {
  const el = id => document.getElementById(id);
  
  if (el("cLire")) el("cLire").textContent = fmt(S.lire);
  if (el("cBig")) el("cBig").textContent = fmt(S.biglietti);
  if (el("cRott")) el("cRott").textContent = fmt(S.rottami);
  
  if (el("lvlNum")) el("lvlNum").textContent = S.lvl || 1;
  
  const need = xpNeed(S.lvl || 1);
  const xpPct = Math.min(100, Math.max(0, ((S.xp || 0) / need) * 100));
  if (el("xpFill")) el("xpFill").style.width = xpPct.toFixed(1) + "%";
  
  if (el("critStat")) el("critStat").innerHTML = `CRIT <b>${Math.round(critChance() * 100)}%</b>`;
  if (el("dpsVal")) el("dpsVal").textContent = `${fmt(clickDmg())} danno`;
  
  // Heat Overcharge
  if (el("heatFill")) {
    const heatPct = Math.min(100, Math.max(0, ((S.heat || 0) / S.heatMax) * 100));
    el("heatFill").style.width = heatPct.toFixed(1) + "%";
  }
  
  const botBtn = el("botToggle");
  if (botBtn) {
    botBtn.textContent = S.botsOn ? "🤖 AUTOMI: ON" : "🤖 AUTOMI: OFF";
    botBtn.classList.toggle("off", !S.botsOn);
  }
}

// REAL-TIME AFFORDABILITY HIGHLIGHTING (GREEN/RED WITHOUT DOM REBUILD)
function refreshAffordabilityLive() {
  // 1. Generator Cards
  const cards = document.querySelectorAll("#genList .card[data-cost]");
  cards.forEach(card => {
    const cost = parseFloat(card.dataset.cost || "0");
    const can = canAfford("lire", cost);
    card.classList.toggle("can", can);
    card.classList.toggle("cant", !can);
  });
  
  // 2. Upgrade Rows
  const upRows = document.querySelectorAll("#upgList .upRow[data-cost]");
  upRows.forEach(row => {
    const btn = row.querySelector(".uBtn");
    if (!btn || btn.classList.contains("fatto")) return;
    
    const cost = parseFloat(row.dataset.cost || "0");
    const cur = row.dataset.cur || "l";
    const can = canAfford(cur, cost);
    
    row.classList.toggle("can", can);
    row.classList.toggle("cant", !can);
    btn.classList.toggle("okBtn", can);
    btn.classList.toggle("noBtn", !can);
  });
  
  // 3. Merceria Shop Cards
  const shopCards = document.querySelectorAll("#mercGrid .shopCard[data-cost]");
  shopCards.forEach(card => {
    if (card.classList.contains("owned")) return;
    const cost = parseFloat(card.dataset.cost || "0");
    const can = canAfford("lire", cost);
    
    card.classList.toggle("can", can);
    card.classList.toggle("cant", !can);
    const btn = card.querySelector(".sBtn");
    if (btn) {
      btn.classList.toggle("okBtn", can);
      btn.classList.toggle("noBtn", !can);
    }
  });
}

// CHARACTER CUSTOMIZER UI
function renderCharacterCustomizer() {
  const container = document.getElementById("robEdit");
  if (!container) return;
  container.innerHTML = "";
  
  const createOptionGroup = (label, optionsList, currentVal, fieldKey) => {
    let html = `<div class="editBlk"><div class="elbl">${label}</div><div class="optRow">`;
    optionsList.forEach(opt => {
      const isSelected = currentVal === opt.id;
      const isUnlocked = isOptUnlocked(opt);
      html += `
        <div class="opt ${isSelected ? "sel" : ""} ${!isUnlocked ? "lock" : ""}" data-field="${fieldKey}" data-val="${opt.id}" title="${isUnlocked ? opt.name : opt.name + " — acquistalo nella Merceria"}">
          ${opt.name}
        </div>
      `;
    });
    html += `</div></div>`;
    return html;
  };
  
  const wingOptions = [{ id: "none", name: "Nessuna" }].concat(
    (typeof ITEM_CATALOG !== "undefined" ? ITEM_CATALOG.filter(w => w.slot === "wings") : []).map(w => ({ id: w.id, name: w.name, cost: w.baseCost }))
  );
  const fxOptions = [{ id: "none", name: "Nessuno" }].concat(
    (typeof ITEM_CATALOG !== "undefined" ? ITEM_CATALOG.filter(f => f.slot === "fx") : []).map(f => ({ id: f.id, name: f.name, cost: f.baseCost }))
  );
  
  // Helper: is this option usable? "none" always; legacy cosmetic costs are
  // decorative only; Merceria items require ownership.
  const isOptUnlocked = (opt) => {
    if (opt.id === "none") return true;
    if (!opt.cost) return true; // free legacy cosmetics
    return S.inventory && S.inventory.some(it => it.id === opt.id);
  };
  
  const createColorSwatches = (label, currentHex, fieldKey) => {
    let html = `<div class="editBlk"><div class="elbl">${label}</div><div class="optRow">`;
    SWATCHES.forEach(hex => {
      const isSelected = currentHex === `#${hex}`;
      html += `<div class="swatch ${isSelected ? "sel" : ""}" style="background:#${hex};" data-field="${fieldKey}" data-hex="#${hex}"></div>`;
    });
    html += `</div></div>`;
    return html;
  };
  
  container.innerHTML = `
    <div class="edits">
      ${createOptionGroup("TELAIO", CHASSIS_LIST, S.rob.chassis, "chassis")}
      ${createOptionGroup("OCCHI / VISORE", EYES_LIST, S.rob.eyes, "eyes")}
      ${createOptionGroup("ANTENNA", ANTENNAS_LIST, S.rob.antenna, "antenna")}
      ${createOptionGroup("CAPPELLO", HATS_LIST, S.rob.hat, "hat")}
      ${createOptionGroup("ACCESSORIO", ACCS_LIST, S.rob.acc, "acc")}
      ${createOptionGroup("ARMA", WEPS_LIST, S.rob.weapon, "weapon")}
      ${createOptionGroup("ALI 🪽", wingOptions, S.rob.wing, "wing")}
      ${createOptionGroup("EFFETTI ✨", fxOptions, S.rob.fx, "fx")}
      ${createColorSwatches("Colore Telaio Primario", S.rob.col1, "col1")}
      ${createColorSwatches("Colore Dettagli e Accenti", S.rob.col2, "col2")}
      ${createColorSwatches("Colore Bagliore Occhi", S.rob.eyesCol, "eyesCol")}
    </div>
    <div style="font-size:0.72rem; color:var(--txt-dim); margin-top:12px; line-height:1.4;">
      💡 Ali, Effetti e Accessori si sbloccano ed equipaggiano anche direttamente dalla <b>Merceria</b> con le Lire e i Rottami!
    </div>
  `;
  
  // Event listeners
  container.querySelectorAll(".opt").forEach(opt => {
    opt.onclick = () => {
      const field = opt.dataset.field;
      const val = opt.dataset.val;
      if (opt.classList.contains("lock")) {
        if (typeof sErr === "function") sErr();
        if (typeof toast === "function") {
          toast("🔒", "Oggetto Bloccato", "Acquistalo nella Merceria per sbloccarlo!");
        }
        return;
      }
      S.rob[field] = val;
      renderCharacterViewer();
      renderCharacterCustomizer();
      if (typeof sClick === "function") sClick();
      saveGame();
    };
  });
  
  container.querySelectorAll(".swatch").forEach(sw => {
    sw.onclick = () => {
      const field = sw.dataset.field;
      const hex = sw.dataset.hex;
      S.rob[field] = hex;
      renderCharacterViewer();
      renderCharacterCustomizer();
      if (typeof sClick === "function") sClick();
      saveGame();
    };
  });
}

function renderCharacterViewer() {
  const stage = document.getElementById("charStage");
  if (!stage) return;
  stage.innerHTML = generatePlayerRobotSVG(S.rob);
  
  const chDef = CHASSIS_LIST.find(c => c.id === S.rob.chassis) || CHASSIS_LIST[0];
  const nameTag = document.getElementById("charNameTag");
  if (nameTag) nameTag.textContent = chDef.name;
  
  const parts = [];
  if (S.rob.wing && S.rob.wing !== "none") parts.push("🪽");
  if (S.rob.hat && S.rob.hat !== "none") parts.push("🎩");
  if (S.rob.weapon && S.rob.weapon !== "none") parts.push("⚔️");
  if (S.rob.acc && S.rob.acc !== "none") parts.push("🧰");
  if (S.rob.fx && S.rob.fx !== "none") parts.push("✨");
  
  const loadout = document.getElementById("charLoadout");
  if (loadout) loadout.textContent = parts.length > 0 ? parts.join(" ") : "nessun accessorio";
}

// ACHIEVEMENTS SYSTEM
function checkAch() {
  let earnedAny = false;
  ACHIEVEMENTS.forEach(a => {
    if (!S.achi.includes(a.n) && a.c(S)) {
      S.achi.push(a.n);
      a.r(S);
      if (typeof sWin === "function") sWin();
      if (typeof toast === "function") {
        toast("🏆", `Risultato: ${a.n}!`, a.d);
      }
      earnedAny = true;
    }
  });
  
  if (earnedAny) {
    renderAchievementsGrid();
    renderStatsView();
    saveGame();
  }
}

function renderAchievementsGrid() {
  const container = document.getElementById("achGrid");
  if (!container) return;
  container.innerHTML = "";
  
  ACHIEVEMENTS.forEach(a => {
    const isUnlocked = S.achi.includes(a.n);
    const div = document.createElement("div");
    div.className = `ach ${isUnlocked ? "earned" : ""}`;
    div.title = `${isUnlocked ? "✓ SBLOCCATO: " : "🔒 BLOCCATO: "}${a.n} — ${a.d}`;
    div.innerHTML = `
      <div class="aico">${isUnlocked ? a.i : "🔒"}</div>
      <div class="atr">${a.n}</div>
    `;
    container.appendChild(div);
  });
}

function renderStatsView() {
  const container = document.getElementById("statsList");
  if (!container) return;
  container.innerHTML = "";
  
  const statsRows = [
    ["Click Totali", fmt(S.stats.clicks || 0)],
    ["Multicolpi Scatenati", fmt(S.stats.multistrikes || 0)],
    ["Sovraccarichi Termici", fmt(S.stats.overcharges || 0)],
    ["Nemici Eliminati", fmt(S.kills || 0)],
    ["Boss Abbattuti", fmt(S.bossDefeated || 0)],
    ["Ritirate Strategiche", fmt(S.stats.retreats || 0)],
    ["Livello Massimo", S.lvl || 1],
    ["Lire Totali Accumulate", fmt(S.totalLire || 0)],
    ["Rottami Disponibili", fmt(S.rottami || 0)],
    ["Biglietti Rari", fmt(S.biglietti || 0)],
    ["Minigiochi Giocati", fmt(S.stats.mgPlayed || 0)],
    ["Giri della Ruota", fmt(S.stats.wheelSpins || 0)],
    ["Gocce di Lava Raccolte", fmt(S.stats.lavaDropsCollected || 0)]
  ];
  
  statsRows.forEach(row => {
    const d = document.createElement("div");
    d.className = "statRow";
    d.innerHTML = `<span>${row[0]}</span><b>${row[1]}</b>`;
    container.appendChild(d);
  });
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", initGame);
