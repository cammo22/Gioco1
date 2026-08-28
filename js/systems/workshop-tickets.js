/**
 * VESUVIO.EXE - Personal Workshop & Ticket Generator
 * Invest Lire to build & upgrade your workshop to generate rare 🎟️ Tickets over time
 */
"use strict";

function initWorkshop() {
  S.workshop = S.workshop || { lvl: 0, progress: 0, cost: 50000 };
  renderWorkshopWidget();
}

function getWorkshopUpgradeCost() {
  const lvl = (S.workshop && S.workshop.lvl) || 0;
  return Math.round(50000 * Math.pow(2.2, lvl));
}

function upgradeWorkshop() {
  const cost = getWorkshopUpgradeCost();
  
  if (!canAfford("lire", cost)) {
    if (typeof sErr === "function") sErr();
    if (typeof toast === "function") {
      toast("🎟️", "Lire Insufficienti", `Il laboratorio richiede ₤ ${fmt(cost)} per il potenziamento.`);
    }
    return;
  }
  
  S.lire -= cost;
  S.workshop.lvl = (S.workshop.lvl || 0) + 1;
  if (typeof sBuy === "function") sBuy();
  
  if (typeof toast === "function") {
    toast("🏭", `Laboratorio Biglietti Liv. ${S.workshop.lvl}!`, "Velocità di produzione biglietti aumentata!");
  }
  
  renderWorkshopWidget();
  if (typeof render === "function") render();
  if (typeof checkAch === "function") checkAch();
  if (typeof saveGame === "function") saveGame();
}

function tickWorkshop(deltaSec) {
  if (!S.workshop || S.workshop.lvl <= 0) return;
  
  // Rate: Level 1 produces 1 ticket every 180s, scaling faster with each level
  const ratePerSec = (S.workshop.lvl * 0.0055); // ~180s at lv1, ~90s at lv2, ~45s at lv4
  S.workshop.progress = (S.workshop.progress || 0) + (ratePerSec * deltaSec);
  
  if (S.workshop.progress >= 1.0) {
    const generated = Math.floor(S.workshop.progress);
    S.workshop.progress -= generated;
    S.biglietti = (S.biglietti || 0) + generated;
    
    if (typeof sTicket === "function") sTicket();
    if (typeof toast === "function") {
      toast("🎟️", "Biglietto Stampato!", `+${generated} 🎟️ dal Laboratorio`, { dur: 1800 });
    }
    
    if (typeof render === "function") render();
    if (typeof saveGame === "function") saveGame();
  }
  
  updateWorkshopProgressUI();
}

function renderWorkshopWidget() {
  const widget = document.getElementById("workshopBox");
  if (!widget) return;
  widget.className = "workshop-box";
  
  const lvl = (S.workshop && S.workshop.lvl) || 0;
  const cost = getWorkshopUpgradeCost();
  
  const secPerTicket = lvl > 0 ? Math.round(1 / (lvl * 0.0055)) : "N/D";
  
  widget.innerHTML = `
    <div class="ws-top">
      <h3>🎟️ LABORATORIO BIGLIETTI RARI (Liv. ${lvl})</h3>
      <button class="bigBtn mint" id="upgradeWsBtn" style="width:auto;padding:6px 16px;font-size:0.75rem;">
        ${lvl === 0 ? "Costruisci Laboratorio (₤ " + fmt(cost) + ")" : "Potenzia a Liv. " + (lvl + 1) + " (₤ " + fmt(cost) + ")"}
      </button>
    </div>
    <div class="ws-progress-wrap">
      <div id="wsProgressFill" style="width: ${Math.min(100, ((S.workshop.progress || 0) * 100)).toFixed(1)}%;"></div>
    </div>
    <div class="ws-stats">
      <span>Stato: <b>${lvl > 0 ? "ATTIVO" : "NON COSTRUITO"}</b></span>
      <span>Cadenza Stampa: <b>${lvl > 0 ? "~" + secPerTicket + "s / Biglietto" : "Inattivo"}</b></span>
      <span>Biglietti Generati: <b>${S.biglietti || 0} 🎟️</b></span>
    </div>
  `;
  
  const btn = document.getElementById("upgradeWsBtn");
  if (btn) btn.onclick = upgradeWorkshop;
}

function updateWorkshopProgressUI() {
  // Called every frame by the loop: only touch the DOM when the bar
  // actually moved by a visible amount (>0.5%).
  const pct = Math.min(100, Math.max(0, ((S.workshop && S.workshop.progress) || 0) * 100));
  if (Math.abs(pct - (updateWorkshopProgressUI._last || 0)) < 0.5) return;
  updateWorkshopProgressUI._last = pct;
  
  const fill = document.getElementById("wsProgressFill");
  if (fill) {
    fill.style.width = pct.toFixed(1) + "%";
  }
}
