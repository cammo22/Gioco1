/**
 * VESUVIO.EXE - Real-Time Financial Borsa Telemetry
 * Live telemetry HUD (1H, 7G, 1M), market crash on boss defeat, floating glass widget
 */
"use strict";

const MARKET_SERIES = [
  { key: "prod", name: "Lire/s", color: "#ffd25e", icon: "⚙️", active: true },
  { key: "dmg", name: "Danno Click", color: "#4dd0ff", icon: "💥", active: true },
  { key: "krate", name: "Kills/s", color: "#ff4d64", icon: "☠️", active: true },
  { key: "tot", name: "Patrimonio", color: "#5ff5c5", icon: "₤", active: true },
  { key: "trust", name: "Fiducia Quartiere", color: "#bb86fc", icon: "📊", active: true }
];

function initBorsaTelemetry() {
  // Restore telemetry from its dedicated store (kept out of the main save)
  if (typeof loadMarketData === "function") loadMarketData();
  
  S.marketData = S.marketData || {
    sec: [],
    min: [],
    hour: [],
    lastSec: 0,
    lastMin: 0,
    lastHour: 0,
    lastKills: 0,
    trustIndex: 100,
    panic: false
  };
  
  seedMarketData();
  initFloatingBorsaHud();
  bindBorsaControls();
  setInterval(marketSave, 30000);
}

// SEED initial telemetry so the Borsa draws immediately on first boot
function seedMarketData() {
  const md = S.marketData;
  const prod = typeof calcProd === "function" ? calcProd() : 10;
  const dps = typeof clickDmg === "function" ? clickDmg() : 10;
  
  if (!md.sec || md.sec.length < 60) {
    md.sec = [];
    const now = Date.now();
    for (let i = 90; i >= 0; i--) {
      md.sec.push({
        t: now - i * 1000,
        prod: Math.max(1, prod * (0.92 + Math.random() * 0.16)),
        dmg: Math.max(1, dps * (0.94 + Math.random() * 0.12)),
        krate: Math.round(Math.random() * 20) / 10,
        tot: Math.max(1, (S.totalLire || 0) - i * (prod || 5)),
        trust: 100
      });
    }
  }
  if (!md.min || md.min.length < 8) {
    md.min = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      md.min.push({
        t: now - i * 60000,
        prod: Math.max(1, prod * 0.9),
        dmg: Math.max(1, dps * 0.9),
        krate: 0.4,
        tot: Math.max(1, (S.totalLire || 0) - i * prod * 60),
        trust: 100
      });
    }
  }
  if (!md.hour || md.hour.length < 6) {
    md.hour = [];
    const now = Date.now();
    for (let i = 8; i >= 0; i--) {
      md.hour.push({
        t: now - i * 3600000,
        prod: Math.max(1, prod * 0.75),
        dmg: Math.max(1, dps * 0.7),
        krate: 0.2,
        tot: Math.max(1, (S.totalLire || 0) - i * prod * 3600),
        trust: 100
      });
    }
  }
}

function marketSave() {
  try { localStorage.setItem("vesuvioEXE_market", JSON.stringify(S.marketData)); } catch (e) {}
}

function sampleMarketData() {
  const now = Date.now();
  const md = S.marketData;
  if (!md) return;
  
  if (now - (md.lastSec || 0) >= 1000) {
    const elapsedSec = (now - (md.lastSec || now)) / 1000 || 1;
    const killsDelta = Math.max(0, (S.kills || 0) - (md.lastKills || 0));
    const krate = parseFloat((killsDelta / elapsedSec).toFixed(2));
    
    md.lastKills = S.kills || 0;
    md.lastSec = now;
    
    // Natural trust recovery when not in panic
    if (!md.panic && (md.trustIndex || 100) < 100) {
      md.trustIndex = Math.min(100, (md.trustIndex || 100) + 0.25);
    }
    
    const sample = {
      t: now,
      prod: typeof calcProd === "function" ? calcProd() : 0,
      dmg: typeof clickDmg === "function" ? clickDmg() : 10,
      krate: krate,
      tot: S.totalLire || 0,
      trust: md.trustIndex || 100
    };
    
    md.sec.push(sample);
    if (md.sec.length > 3600) md.sec.shift(); // 1 hour buffer of seconds
    
    // 1-minute aggregation
    if (now - (md.lastMin || 0) >= 60000) {
      md.lastMin = now;
      md.min.push({ ...sample });
      if (md.min.length > 10080) md.min.shift(); // 7 days of minutes
    }
    
    // 1-hour aggregation
    if (now - (md.lastHour || 0) >= 3600000) {
      md.lastHour = now;
      md.hour.push({ ...sample });
      if (md.hour.length > 720) md.hour.shift(); // 1 month of hours
    }
  }
}

function triggerMarketPanic() {
  if (!S.marketData) return;
  S.marketData.panic = true;
  S.marketData.trustIndex = Math.max(15, (S.marketData.trustIndex || 100) - 45); // Huge drop
  
  const canvasWrap = document.querySelector(".borsa-canvas-wrap");
  if (canvasWrap) {
    canvasWrap.classList.add("market-panic");
    setTimeout(() => canvasWrap.classList.remove("market-panic"), 1600);
  }
  
  if (typeof toast === "function") {
    toast("📉", "PANICO A PONTICELLI!", "La sconfitta dal Boss ha fatto crollare l'Indice di Fiducia!");
  }
  
  setTimeout(() => {
    if (S.marketData) S.marketData.panic = false;
  }, 15000);
}

function getBorsaActiveSeriesData() {
  const md = S.marketData || { sec: [], min: [], hour: [] };
  const range = S.marketRange || "1h";
  
  switch (range) {
    case "1h":
      return md.sec.length > 0 ? md.sec.slice(-3600) : [];
    case "7d":
      return md.min.length > 0 ? md.min.slice(-10080) : (md.sec.length > 0 ? md.sec : []);
    case "1m":
      return md.hour.length > 0 ? md.hour.slice(-720) : (md.min.length > 0 ? md.min : md.sec);
    default:
      return md.sec;
  }
}

function drawBorsaCanvas() {
  const canvas = document.getElementById("borsaCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  
  ctx.clearRect(0, 0, w, h);
  
  // Dark cyber grid
  ctx.fillStyle = "#090e18";
  ctx.fillRect(0, 0, w, h);
  
  ctx.strokeStyle = "rgba(130, 190, 255, 0.08)";
  ctx.lineWidth = 1;
  
  const gridRows = 5;
  for (let r = 0; r <= gridRows; r++) {
    const y = padTop + (h - padTop - padBottom) * (r / gridRows);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();
  }
  
  const data = getBorsaActiveSeriesData();
  
  if (!data || data.length < 2) {
    ctx.fillStyle = "var(--txt-dim)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📊 Raccolta telemetria finanziaria in corso… Gioca e colpisci mostri!", w / 2, h / 2);
    return;
  }
  
  // Draw each active series
  MARKET_SERIES.forEach(s => {
    if (!s.active) return;
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    data.forEach(d => {
      const v = d[s.key] !== undefined ? d[s.key] : 0;
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    });
    
    if (!isFinite(minVal)) minVal = 0;
    if (!isFinite(maxVal) || maxVal === minVal) maxVal = minVal + 1;
    const span = maxVal - minVal;
    
    // Draw Line
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const v = d[s.key] !== undefined ? d[s.key] : minVal;
      const x = padLeft + (w - padLeft - padRight) * (i / (data.length - 1));
      const y = h - padBottom - ((v - minVal) / span) * (h - padTop - padBottom);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    
    // Last value endpoint glow
    const lastSample = data[data.length - 1];
    const lastV = lastSample[s.key] !== undefined ? lastSample[s.key] : minVal;
    const lastX = w - padRight;
    const lastY = h - padBottom - ((lastV - minVal) / span) * (h - padTop - padBottom);
    
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function renderBorsaTicker() {
  const container = document.getElementById("borsaTicker");
  if (!container) return;
  
  const data = getBorsaActiveSeriesData();
  if (!data || data.length < 2) {
    container.innerHTML = `<div class="tk"><div class="tkn">Telemetria</div><div class="tkv">Inizializzazione…</div></div>`;
    return;
  }
  
  const first = data[0];
  const last = data[data.length - 1];
  
  let html = "";
  
  MARKET_SERIES.forEach(s => {
    const v0 = first[s.key] || 0;
    const v1 = last[s.key] || 0;
    const deltaPct = v0 > 0 ? ((v1 - v0) / v0) * 100 : (v1 > 0 ? 100 : 0);
    const isUp = deltaPct >= 0;
    
    let displayVal = "";
    if (s.key === "krate") displayVal = `${v1.toFixed(1)}/s`;
    else if (s.key === "trust") displayVal = `${Math.round(v1)}%`;
    else displayVal = fmt(v1);
    
    html += `
      <div class="tk" onclick="toggleBorsaSeries('${s.key}')">
        <span class="tki">${s.icon}</span>
        <div class="tk-content">
          <div class="tkn">${s.name}</div>
          <div class="tkv" style="color:${s.color};">${displayVal}</div>
        </div>
        <div class="tkc ${isUp ? "up" : "down"}">
          ${isUp ? "▲" : "▼"} ${Math.abs(deltaPct).toFixed(1)}%
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function toggleBorsaSeries(key) {
  const s = MARKET_SERIES.find(x => x.key === key);
  if (s) {
    s.active = !s.active;
    drawBorsaCanvas();
    renderBorsaTicker();
  }
}

function bindBorsaControls() {
  const pills = document.querySelectorAll("#borsaRg .rg");
  pills.forEach(pill => {
    pill.onclick = () => {
      const range = pill.dataset.r;
      S.marketRange = range;
      pills.forEach(p => p.classList.toggle("active", p.dataset.r === range));
      drawBorsaCanvas();
      renderBorsaTicker();
    };
  });
}

// FLOATING MINI TELEMETRY HUD WIDGET ON BACKGROUND
function initFloatingBorsaHud() {
  let widget = document.getElementById("floatingBorsaHud");
  if (!widget) {
    widget = document.createElement("div");
    widget.id = "floatingBorsaHud";
    document.body.appendChild(widget);
  }
  
  widget.innerHTML = `
    <div class="f-title">📈 BORSA DEL GOLFO</div>
    <canvas id="hudSpark" width="170" height="42"></canvas>
    <div class="f-row">
      <span class="f-rate">₤ <b id="hudProd">0</b>/s</span>
      <span class="f-rate" style="color:var(--aqua);">💥 <b id="hudDps">0</b></span>
    </div>
    <div class="f-row">
      <span class="f-rate" style="color:var(--mint);">☠️ <b id="hudKills">0</b>/s</span>
      <span class="f-rate" style="color:var(--purple);">Fid. <b id="hudTrust">100%</b></span>
    </div>
    <div class="f-hint">trascina per spostare · doppio click per aprire</div>
  `;
  
  // DRAG support (editable directly on background)
  let dragging = false, dx = 0, dy = 0;
  const savedPos = localStorage.getItem("vesuvioHudPos");
  if (savedPos) {
    try {
      const p = JSON.parse(savedPos);
      widget.style.left = p.x + "px";
      widget.style.top = p.y + "px";
      widget.style.right = "auto";
      widget.style.bottom = "auto";
    } catch (e) {}
  }
  
  widget.addEventListener("pointerdown", (e) => {
    // Only drag from title area to keep clicks elsewhere
    if (!e.target.classList.contains("f-title")) return;
    dragging = true;
    dx = e.clientX - widget.offsetLeft;
    dy = e.clientY - widget.offsetTop;
    widget.setPointerCapture(e.pointerId);
  });
  widget.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let nx = Math.max(4, Math.min(window.innerWidth - widget.offsetWidth - 4, e.clientX - dx));
    let ny = Math.max(4, Math.min(window.innerHeight - widget.offsetHeight - 4, e.clientY - dy));
    widget.style.left = nx + "px";
    widget.style.top = ny + "px";
    widget.style.right = "auto";
    widget.style.bottom = "auto";
  });
  widget.addEventListener("pointerup", () => {
    if (dragging) {
      dragging = false;
      localStorage.setItem("vesuvioHudPos", JSON.stringify({ x: widget.offsetLeft, y: widget.offsetTop }));
    }
  });
  
  widget.addEventListener("dblclick", () => {
    if (typeof openTab === "function") openTab("tabBorsa");
  });
  
  drawHudSparkline();
}

function drawHudSparkline() {
  const cv = document.getElementById("hudSpark");
  if (!cv || !S.marketData || !S.marketData.sec || S.marketData.sec.length < 3) return;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  
  const data = S.marketData.sec.slice(-60);
  let min = Infinity, max = -Infinity;
  data.forEach(d => { if (d.prod < min) min = d.prod; if (d.prod > max) max = d.prod; });
  const span = (max - min) || 1;
  
  ctx.strokeStyle = "#ffd25e";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = (cv.width / (data.length - 1)) * i;
    const y = cv.height - 4 - ((d.prod - min) / span) * (cv.height - 8);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // endpoint dot
  const lastY = cv.height - 4 - ((data[data.length - 1].prod - min) / span) * (cv.height - 8);
  ctx.fillStyle = "#ffd25e";
  ctx.beginPath();
  ctx.arc(cv.width - 2, lastY, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function updateFloatingBorsaHud() {
  const widget = document.getElementById("floatingBorsaHud");
  if (!widget) return;
  
  const dps = typeof totalDPS === "function" ? totalDPS() : 10;
  const prod = typeof calcProd === "function" ? calcProd() : 0;
  const trust = (S.marketData && S.marketData.trustIndex) || 100;
  const krate = S.stats && typeof S.stats.killsPerSec !== "undefined" ? S.stats.killsPerSec.toFixed(1) : "0";
  
  const p = document.getElementById("hudProd"); if (p) p.textContent = fmt(prod);
  const d = document.getElementById("hudDps"); if (d) d.textContent = fmt(dps);
  const kk = document.getElementById("hudKills"); if (kk) kk.textContent = krate;
  const t = document.getElementById("hudTrust"); if (t) t.textContent = Math.round(trust) + "%";
  
  // Throttled sparkline redraw
  hudSparkTick = (hudSparkTick || 0) + 1;
  if (hudSparkTick % 30 === 0) drawHudSparkline();
}
let hudSparkTick = 0;