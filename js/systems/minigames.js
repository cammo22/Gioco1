/**
 * VESUVIO.EXE - Minigames Engine & Gambling Suite
 * 5 High-Yield Minigames: Sfera, Pesca Combo, Botte, Carte & Wheel of Fortune
 */
"use strict";

let activeMinigame = null;
let minigameLoopTimer = null;

function openMinigameModal(title, contentHTML, onKillCallback) {
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("gameTitle");
  const bodyEl = document.getElementById("gameBody");
  
  if (!overlay || !titleEl || !bodyEl) return;
  
  titleEl.textContent = title;
  bodyEl.innerHTML = contentHTML;
  overlay.classList.add("on");
  
  if (activeMinigame && typeof activeMinigame.kill === "function") {
    activeMinigame.kill();
  }
  
  activeMinigame = {
    kill: onKillCallback
  };
}

function closeMinigameModal() {
  const overlay = document.getElementById("overlay");
  if (!overlay) return;
  
  if (minigameLoopTimer) {
    cancelAnimationFrame(minigameLoopTimer);
    clearTimeout(minigameLoopTimer);
    minigameLoopTimer = null;
  }
  
  if (activeMinigame && typeof activeMinigame.kill === "function") {
    try { activeMinigame.kill(); } catch (e) {}
  }
  
  overlay.classList.remove("on");
  const bodyEl = document.getElementById("gameBody");
  if (bodyEl) bodyEl.innerHTML = "";
  activeMinigame = null;
}

function showMinigameResultCard(title, label, lireGains, rottamiGains, ticketGains, restartCallback) {
  const bodyEl = document.getElementById("gameBody");
  if (!bodyEl) return;
  
  S.stats.mgPlayed = (S.stats.mgPlayed || 0) + 1;
  if (typeof sWin === "function") sWin();
  
  bodyEl.innerHTML = `
    <div id="gameResult">
      <h3>${title}</h3>
      <div class="loot" style="color:var(--txt-dim); font-size:1rem;">${label}</div>
      <div class="loot" style="color:var(--gold);">₤ <b>+${fmt(lireGains)}</b> Lire</div>
      <div class="loot" style="color:#e4d1b8;">⚙️ <b>+${fmt(rottamiGains)}</b> Rottami</div>
      ${ticketGains ? `<div class="loot" style="color:var(--aqua);">🎟️ <b>+${ticketGains}</b> Biglietto Raro!</div>` : ""}
      <div style="margin-top:16px;">
        <button class="bigBtn gold" id="resCloseBtn" style="display:inline-block; width:auto; padding:10px 24px;">✓ OK — Riscuoti</button>
        ${restartCallback ? `<button class="bigBtn" id="resReplayBtn" style="display:inline-block; width:auto; padding:10px 24px; margin-left:8px; background:linear-gradient(180deg,#2b3d5c,#162236);">🔄 Rigioca</button>` : ""}
      </div>
    </div>
  `;
  
  const closeBtn = document.getElementById("resCloseBtn");
  if (closeBtn) closeBtn.onclick = closeMinigameModal;
  
  const replayBtn = document.getElementById("resReplayBtn");
  if (replayBtn && restartCallback) replayBtn.onclick = restartCallback;
  
  if (typeof checkAch === "function") checkAch();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
}

// 1. LA SFERA DI SINTETICOMC (TIMING RING)
function startMinigameSfera() {
  const state = { tries: 0, score: 0, total: 8, alive: true };
  
  openMinigameModal(
    "La Sfera di sinteticoMC — Lucidatura e Sintonia",
    `
      <div class="bigHud" id="sfHud">Punteggio: 0 / 24 · Tentativo: 0 / 8</div>
      <div class="mute">CLICCA o premi SPAZIO quando lo spillo attraversa la FASCIA D'ORO al centro!</div>
      <div id="lucZone" style="margin-top:12px;">
        <div class="goldA"></div>
        <div id="lucTick"></div>
      </div>
      <button class="bigBtn gold" id="lucHitBtn" style="width:auto; margin:14px auto 0; display:block; padding:12px 36px; font-size:1rem;">
        ✋ COLPISCI ORA!
      </button>
    `,
    () => { state.alive = false; }
  );
  
  const zone = document.getElementById("lucZone");
  const tick = document.getElementById("lucTick");
  const hud = document.getElementById("sfHud");
  const btn = document.getElementById("lucHitBtn");
  
  if (!zone || !tick) return;
  
  let pos = 0;
  let dir = 1;
  
  function tickAnimation() {
    if (!state.alive) return;
    const w = zone.offsetWidth || 520;
    pos += dir * 0.013;
    if (pos >= 1) { pos = 1; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    
    const x = pos * w;
    tick.style.left = (x - 3) + "px";
    
    const isGold = Math.abs(x - w / 2) < 42;
    tick.style.background = isGold ? "rgba(255, 215, 94, 0.95)" : "rgba(127, 230, 255, 0.85)";
    tick.style.boxShadow = isGold ? "0 0 16px #ffd25e" : "0 0 10px #7fe6ff";
    
    minigameLoopTimer = setTimeout(tickAnimation, 16);
  }
  
  function attempt() {
    if (!state.alive || state.tries >= state.total) return;
    const w = zone.offsetWidth || 520;
    const x = pos * w;
    const dist = Math.abs(x - w / 2);
    
    let pts = 0;
    if (dist < 42) pts = 3;
    if (dist < 20) pts = 6;
    
    state.tries++;
    state.score += pts;
    
    if (pts > 0) {
      if (typeof sWin === "function") sWin();
    } else {
      if (typeof sErr === "function") sErr();
    }
    
    if (hud) hud.textContent = `Punteggio: ${state.score} / 24 · Tentativo: ${state.tries} / 8`;
    
    // Hit feedback badge
    const fx = document.createElement("div");
    fx.style.cssText = `position:absolute;left:${x + 10}px;top:28px;font-size:2.8rem;font-weight:900;color:${pts > 0 ? "#5ff5c5" : "#ff4d64"};pointer-events:none;`;
    fx.textContent = pts > 0 ? `+${pts}` : "✗";
    zone.appendChild(fx);
    setTimeout(() => fx.remove(), 700);
    
    if (state.tries >= state.total) {
      state.alive = false;
      const dps = typeof totalDPS === "function" ? totalDPS() : 50;
      const lire = Math.round(state.score * dps * 25 + 5000);
      const rott = state.score * 8 + 20;
      const ticket = state.score >= 20 ? 1 : 0;
      
      S.lire += lire;
      S.totalLire += lire;
      S.rottami += rott;
      if (ticket) S.biglietti = (S.biglietti || 0) + ticket;
      
      setTimeout(() => {
        showMinigameResultCard(
          "Sfera Sintonizzata!",
          `Punteggio Finale: ${state.score} / 24`,
          lire,
          rott,
          ticket,
          startMinigameSfera
        );
      }, 500);
    }
  }
  
  if (btn) btn.onclick = attempt;
  zone.onclick = attempt;
  
  const keyHandler = (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      attempt();
    }
  };
  document.addEventListener("keydown", keyHandler);
  
  activeMinigame.kill = () => {
    state.alive = false;
    document.removeEventListener("keydown", keyHandler);
  };
  
  tickAnimation();
}

// 2. PESCA NEL GOLFO (CON COMBO MULTIPLIER)
function startMinigamePesca() {
  const state = { fish: 0, combo: 1, max: 15, alive: true };
  
  openMinigameModal(
    "🎣 Pesca nel Golfo di Lava (con COMBO Multiplier)",
    `
      <div class="bigHud" id="pfHud">Pesci: 0 / 15 · COMBO ×1.0</div>
      <canvas class="miniCanvas" id="pcv" width="820" height="420"></canvas>
      <div class="mute">Clicca il canvas quando il pesce attraversa la ZONA ARANCIONE. Prese consecutive attivano la COMBO!</div>
    `,
    () => { state.alive = false; }
  );
  
  const cv = document.getElementById("pcv");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  
  let fPos = 0.2;
  let dir = 1;
  const tzX = cv.width * 0.6;
  
  function renderFrame() {
    if (!state.alive) return;
    const w = cv.width;
    const h = cv.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Background volcanic water
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#14283c");
    g.addColorStop(1, "#07121c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    
    // Target Geyser Zone
    ctx.fillStyle = "rgba(255, 72, 36, 0.35)";
    ctx.fillRect(tzX - 90, 0, 180, h);
    ctx.strokeStyle = "#ff9a3c";
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(tzX - 90, 0, 180, h);
    ctx.setLineDash([]);
    
    ctx.font = "900 16px sans-serif";
    ctx.fillStyle = "#ffd25e";
    ctx.textAlign = "center";
    ctx.fillText("🔥 ZONA DI PESCA RUGGINE", tzX, 28);
    
    // Fish movement
    fPos += dir * 0.024;
    if (fPos >= 1) { fPos = 1; dir = -1; }
    if (fPos <= 0) { fPos = 0; dir = 1; }
    
    const fx = 70 + fPos * (w - 200);
    const fy = h * 0.62;
    const inZone = fx > tzX - 85 && fx < tzX + 85;
    
    ctx.save();
    ctx.translate(fx, fy);
    if (dir < 0) ctx.scale(-1, 1);
    
    ctx.fillStyle = inZone ? "#ffd25e" : "#5ff5c5";
    ctx.beginPath();
    ctx.moveTo(48, 0);
    ctx.lineTo(-36, -28);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-36, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = "#09121a";
    ctx.beginPath();
    ctx.arc(6, -4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.font = "800 22px sans-serif";
    ctx.fillStyle = inZone ? "#ffd25e" : "#8faec8";
    ctx.fillText(inZone ? "⚡ PRENDILO ORA!" : "CANNA PRONTA IN ACQUA", w / 2, h - 22);
    
    minigameLoopTimer = requestAnimationFrame(renderFrame);
  }
  
  function attempt() {
    if (!state.alive || state.fish >= state.max) return;
    const fx = 70 + fPos * (cv.width - 200);
    const inZone = fx > tzX - 85 && fx < tzX + 85;
    
    if (inZone) {
      state.fish++;
      state.combo += 0.5;
      if (typeof sHit === "function") sHit();
    } else {
      state.combo = 1.0;
      if (typeof sErr === "function") sErr();
    }
    
    const hud = document.getElementById("pfHud");
    if (hud) hud.textContent = `Pesci: ${state.fish} / ${state.max} · COMBO ×${state.combo.toFixed(1)}`;
    
    if (state.fish >= state.max) {
      state.alive = false;
      const dps = typeof totalDPS === "function" ? totalDPS() : 50;
      const lire = Math.round(state.fish * dps * 20 * state.combo + 8000);
      const rott = Math.round(state.fish * 6 * state.combo + 30);
      const ticket = state.combo >= 3.0 ? 1 : 0;
      
      S.lire += lire;
      S.totalLire += lire;
      S.rottami += rott;
      if (ticket) S.biglietti = (S.biglietti || 0) + ticket;
      
      setTimeout(() => {
        showMinigameResultCard(
          "Marea Pescata!",
          `Hai catturato ${state.fish} pesci con Combo Finale ×${state.combo.toFixed(1)}!`,
          lire,
          rott,
          ticket,
          startMinigamePesca
        );
      }, 450);
    }
  }
  
  cv.onclick = attempt;
  renderFrame();
}

// 3. BOTTE A RUGGINE (WHACK-A-MOLE)
function startMinigameBotte() {
  const state = { score: 0, time: 25, alive: true };
  
  openMinigameModal(
    "🎯 Botte a Ruggine (Whack-a-Robot)",
    `
      <div class="bigHud" id="bHud">⏱ Tempo: 25s · Colpi: 0</div>
      <div id="whackGrid"></div>
      <div class="mute">⚙️ = +1 Colpo · 💥 Bomba = +3 Colpi! Non farli scappare.</div>
    `,
    () => { state.alive = false; }
  );
  
  const grid = document.getElementById("whackGrid");
  if (!grid) return;
  
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div");
    hole.className = "hole";
    grid.appendChild(hole);
  }
  
  let spawnInterval = null;
  let timerInterval = null;
  
  function spawnEnemy() {
    if (!state.alive) return;
    const holes = Array.from(grid.querySelectorAll(".hole")).filter(h => !h.querySelector(".whackEnemy"));
    if (holes.length < 2) return;
    
    const count = Math.min(3, holes.length);
    for (let i = 0; i < count; i++) {
      const h = holes[Math.floor(Math.random() * holes.length)];
      const isBomb = Math.random() < 0.35;
      
      const e = document.createElement("div");
      e.className = "whackEnemy";
      e.textContent = isBomb ? "💥" : "⚙️";
      h.appendChild(e);
      
      const lifetime = Math.max(450, 1200 - (25 - state.time) * 25);
      setTimeout(() => {
        if (e.parentNode) e.remove();
      }, lifetime);
      
      e.onclick = (ev) => {
        ev.stopPropagation();
        if (!state.alive) return;
        state.score += isBomb ? 3 : 1;
        if (typeof sClick === "function") sClick();
        if (e.parentNode) e.remove();
        updateHud();
      };
    }
  }
  
  function updateHud() {
    const hud = document.getElementById("bHud");
    if (hud) hud.textContent = `⏱ Tempo: ${Math.ceil(state.time)}s · Colpi: ${state.score}`;
  }
  
  function tickTimer() {
    if (!state.alive) return;
    state.time -= 0.1;
    if (state.time <= 0) {
      state.time = 0;
      state.alive = false;
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      
      const dps = typeof totalDPS === "function" ? totalDPS() : 50;
      const lire = Math.round(state.score * dps * 18 + 6000);
      const rott = state.score * 5 + 25;
      const ticket = state.score >= 35 ? 1 : 0;
      
      S.lire += lire;
      S.totalLire += lire;
      S.rottami += rott;
      if (ticket) S.biglietti = (S.biglietti || 0) + ticket;
      
      showMinigameResultCard(
        "Tempo Scaduto!",
        `Hai messo a segno ${state.score} colpi devastanti!`,
        lire,
        rott,
        ticket,
        startMinigameBotte
      );
    }
    updateHud();
  }
  
  spawnInterval = setInterval(spawnEnemy, 420);
  timerInterval = setInterval(tickTimer, 100);
  
  activeMinigame.kill = () => {
    state.alive = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
  };
}

// 4. LE CARTE DELLA CARTOMANTE (BIG EMOJI MEMORY MATCH)
function startMinigameCarte() {
  const cardIcons = ["⚪", "🔧", "☕", "📦", "🎣", "🔮", "🪶", "⛪"];
  const deck = [...cardIcons, ...cardIcons];
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  const state = { deck, moves: 0, open: [], matched: 0, totalPairs: cardIcons.length, alive: true };
  
  openMinigameModal(
    "🔮 Le Carte della Cartomante (Memory)",
    `
      <div class="bigHud" id="cpHud">Mosse: 0 · Coppie: 0 / ${cardIcons.length}</div>
      <div id="memGrid"></div>
      <div class="mute">Trova tutte le coppie con il minor numero di mosse possibili!</div>
    `,
    () => { state.alive = false; }
  );
  
  const grid = document.getElementById("memGrid");
  if (!grid) return;
  
  deck.forEach((icon, idx) => {
    const card = document.createElement("div");
    card.className = "memCard hidden";
    card.onclick = () => flipCard(idx, card, icon);
    grid.appendChild(card);
  });
  
  function flipCard(idx, cardEl, icon) {
    if (!state.alive || state.open.length >= 2 || !cardEl.classList.contains("hidden")) return;
    
    cardEl.classList.remove("hidden");
    cardEl.textContent = icon;
    state.open.push({ idx, cardEl, icon });
    
    if (state.open.length === 2) {
      state.moves++;
      const [c1, c2] = state.open;
      
      if (c1.icon === c2.icon) {
        state.matched++;
        state.open = [];
        if (typeof sHit === "function") sHit();
        
        if (state.matched >= state.totalPairs) {
          state.alive = false;
          const dps = typeof totalDPS === "function" ? totalDPS() : 50;
          const efficiency = Math.max(1, 20 - state.moves);
          const lire = Math.round(efficiency * dps * 35 + 12000);
          const rott = efficiency * 12 + 40;
          const ticket = state.moves <= 10 ? 1 : 0;
          
          S.lire += lire;
          S.totalLire += lire;
          S.rottami += rott;
          if (ticket) S.biglietti = (S.biglietti || 0) + ticket;
          
          setTimeout(() => {
            showMinigameResultCard(
              "Carte Lette con Successo!",
              `Completato in ${state.moves} mosse!`,
              lire,
              rott,
              ticket,
              startMinigameCarte
            );
          }, 400);
        }
      } else {
        setTimeout(() => {
          c1.cardEl.classList.add("hidden");
          c1.cardEl.textContent = "";
          c2.cardEl.classList.add("hidden");
          c2.cardEl.textContent = "";
          state.open = [];
        }, 650);
      }
      
      const hud = document.getElementById("cpHud");
      if (hud) hud.textContent = `Mosse: ${state.moves} · Coppie: ${state.matched} / ${state.totalPairs}`;
    }
  }
}

// 5. RUOTA DEL MERCANTE (WHEEL OF FORTUNE)
function startMinigameRuota() {
  const prizes = [
    { i: "⚙️", l: "+200 Rottami", act: () => { S.rottami += 200; } },
    { i: "🏷️", l: "-50% Sconto Merceria", act: () => { S.shopDisc = Math.min(0.6, (S.shopDisc || 0) + 0.5); } },
    { i: "✨", l: "+500 Rottami", act: () => { S.rottami += 500; } },
    { i: "₤", l: "Jackpot 500K Lire", act: () => { S.lire += 500000; S.totalLire += 500000; } },
    { i: "💰", l: "Doppia Produzione (60s)", act: () => { if (typeof addBuff === "function") addBuff("prod", 2.0, 60, "JACKPOT BORSA"); } },
    { i: "⚡", l: "Danno ×4 (40s)", act: () => { if (typeof addBuff === "function") addBuff("dmg", 4.0, 40, "FURIA MERCANTE"); } },
    { i: "🎟️", l: "+3 Biglietti Rari", act: () => { S.biglietti = (S.biglietti || 0) + 3; } },
    { i: "🎁", l: "Cosmetico Misterioso", act: () => { awardRandomCosmetic(); } }
  ];
  
  const ticketCount = S.biglietti || 0;
  
  openMinigameModal(
    "🎡 Ruota del Mercante di Pacco",
    `
      <div id="wheelBox">
        <div id="wheelPin">▾</div>
        <canvas id="wheelCanvas" width="420" height="420"></canvas>
      </div>
      <div style="text-align:center; margin-top:12px;">
        <button id="spinBtn" class="bigBtn gold" style="width:auto; padding:12px 36px; font-size:1rem;">
          ${ticketCount >= 1 ? "🎡 GIRA LA RUOTA (1 🎟️)" : "🎡 GIRA LA RUOTA (25 ⚙️)"}
        </button>
      </div>
      <div class="mute">Spendi 1 Biglietto Raro (o 25 Rottami) per vincere sconti, jackpot e oggetti unici!</div>
    `,
    () => {}
  );
  
  const canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let ang = Math.random() * Math.PI * 2;
  let vel = 0;
  let spinning = false;
  let resolved = false;
  
  const R = 210;
  const N = prizes.length;
  const sliceColors = [
    "#ff5930", "#2a6f8f", "#d03a2a", "#37a8dd", "#c46a2a", "#3a6fd6", "#ffd76a", "#bb86fc"
  ];
  
  function renderWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(R, R, R - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0f1a";
    ctx.fill();
    
    for (let i = 0; i < N; i++) {
      const a0 = ang + (i * Math.PI * 2) / N;
      const a1 = ang + ((i + 1) * Math.PI * 2) / N;
      
      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.arc(R, R, R - 8, a0, a1);
      ctx.closePath();
      ctx.fillStyle = sliceColors[i];
      ctx.fill();
      ctx.strokeStyle = "#080c14";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(R + Math.cos((a0 + a1) / 2) * (R - 75), R + Math.sin((a0 + a1) / 2) * (R - 75));
      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(prizes[i].i, 0, -8);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(prizes[i].l.slice(0, 18), 0, 18);
      ctx.restore();
    }
    
    // Outer border
    ctx.beginPath();
    ctx.arc(R, R, R - 8, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(130, 190, 255, 0.4)";
    ctx.stroke();
    
    if (vel > 0) {
      ang += vel;
      vel *= 0.985;
      if (vel < 0.05) {
        vel = 0;
        spinComplete();
        return;
      }
    }
    
    minigameLoopTimer = setTimeout(renderWheel, 24);
  }
  
  function spinComplete() {
    if (resolved) return;
    resolved = true;
    
    const TAU = Math.PI * 2;
    const normalizedAngle = ((TAU - (ang % TAU)) % TAU);
    const prizeIdx = Math.floor((normalizedAngle / TAU) * N) % N;
    const prize = prizes[prizeIdx];
    
    prize.act();
    S.stats.wheelSpins = (S.stats.wheelSpins || 0) + 1;
    
    setTimeout(() => {
      showMinigameResultCard(
        "Ruota della Fortuna!",
        `Hai Vinto: ${prize.i} ${prize.l}!`,
        0,
        0,
        0,
        startMinigameRuota
      );
    }, 400);
  }
  
  const spinBtn = document.getElementById("spinBtn");
  if (spinBtn) {
    spinBtn.onclick = () => {
      if (spinning || resolved || vel > 0) return;
      
      if ((S.biglietti || 0) >= 1) {
        S.biglietti -= 1;
      } else if ((S.rottami || 0) >= 25) {
        S.rottami -= 25;
      } else {
        if (typeof sErr === "function") sErr();
        if (typeof toast === "function") {
          toast("🎟️", "Risorse Insufficienti", "Serve 1 Biglietto Raro o 25 Rottami.");
        }
        return;
      }
      
      if (typeof sBuy === "function") sBuy();
      vel = 3.5 + Math.random() * 8.5;
      spinning = true;
    };
  }
  
  renderWheel();
}

function awardRandomCosmetic() {
  if (typeof ITEM_CATALOG === "undefined") {
    S.rottami += 300;
    return;
  }
  const unowned = ITEM_CATALOG.filter(it => !S.inventory.some(inv => inv.id === it.id));
  if (unowned.length > 0) {
    const item = unowned[Math.floor(Math.random() * unowned.length)];
    S.inventory.push({ id: item.id, level: 1, equipped: false });
    if (typeof toast === "function") {
      toast("🎁", `OGGETTO RARO: ${item.name}!`, "Sbloccato gratuitamente dalla Ruota!");
    }
  } else {
    S.rottami += 400;
  }
}

function renderMinigamesList() {
  const container = document.getElementById("miniList");
  if (!container) return;
  container.innerHTML = "";
  
  const games = [
    { i: "⚪", n: "La Sfera di sinteticoMC", d: "Timing di precisione: colpisci nella fascia dorata al centro.", fun: startMinigameSfera },
    { i: "🎣", n: "Pesca nel Golfo di Lava", d: "Pesca ad alto rendimento: prese consecutive attivano moltiplicatori COMBO.", fun: startMinigamePesca },
    { i: "🎯", n: "Botte a Ruggine", d: "Whack-a-Robot: abbatti Ruggine e le Bombe prima che scappino.", fun: startMinigameBotte },
    { i: "🔮", n: "Le Carte della Cartomante", d: "Memory del Golfo: trova tutte le coppie a colpo sicuro.", fun: startMinigameCarte },
    { i: "🎡", n: "Ruota del Mercante", d: "Gira la ruota di Pacco per vincere jackpot, sconti e biglietti rari.", fun: startMinigameRuota }
  ];
  
  games.forEach(g => {
    const card = document.createElement("div");
    card.className = "miniCard";
    card.innerHTML = `
      <div class="micon">${g.i}</div>
      <div style="flex:1;">
        <div class="mt">${g.n}</div>
        <div class="md">${g.d}</div>
      </div>
      <div class="playBig">GIOCA ▶</div>
    `;
    card.onclick = g.fun;
    container.appendChild(card);
  });
}
