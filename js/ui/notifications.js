/**
 * VESUVIO.EXE - Toast Notification System & Master Render
 * Anti-spam toast stack (max 4 visible) + central UI refresh called after every purchase/action
 */
"use strict";

// ==================== TOASTS ====================
const TOAST_ICONS_OK = true;
let _toastLastByKey = {};   // anti-spam: same key not more than once per 1.2s

function toast(icon, title, body, opts) {
  opts = opts || {};
  const bar = document.getElementById("toasts");
  if (!bar) {
    // Fallback: never crash even if the container is missing
    console.log("[TOAST]", icon, title, body);
    return;
  }

  // Anti-spam by title key
  const key = title;
  const now = Date.now();
  if (_toastLastByKey[key] && now - _toastLastByKey[key] < 5000) return;
  _toastLastByKey[key] = now;

  // Cap concurrent toasts (remove oldest)
  while (bar.children.length >= 3) {
    bar.removeChild(bar.firstChild);
  }

  const el = document.createElement("div");
  el.className = "toast" + (opts.kind ? " " + opts.kind : "");

  el.innerHTML = `
    <div class="tIco">${icon || "•"}</div>
    <div class="tBody">
      <div class="tTitle">${title || ""}</div>
      ${body ? `<div class="tText">${body}</div>` : ""}
    </div>
  `;

  bar.appendChild(el);

  // Entrance on next frame so the CSS transition kicks in
  requestAnimationFrame(() => el.classList.add("on"));

  const life = opts.dur || 2600;
  setTimeout(() => {
    el.classList.remove("on");
    setTimeout(() => { if (el.parentNode) el.remove(); }, 350);
  }, life);
}

// ==================== MASTER RENDER ====================
// Called everywhere in the game logic after a state change.
// Refreshes every panel that is cheap to refresh; heavy panels only if visible.
// Throttled: at high CPS render() fired dozens of times per second, each
// rebuilding the whole active panel — one trailing update per 80ms is enough.
let _renderScheduled = false;
let _lastRenderT = 0;

function render() {
  const now = performance.now();
  if (now - _lastRenderT < 80) {
    if (!_renderScheduled) {
      _renderScheduled = true;
      setTimeout(() => {
        _renderScheduled = false;
        render();
      }, 80 - (now - _lastRenderT));
    }
    return;
  }
  _lastRenderT = performance.now();
  
  try {
    if (typeof renderHUD === "function") renderHUD();
    if (typeof renderPlayerHp === "function") renderPlayerHp();

    // Only re-render the ACTIVE tab content (cheap + always correct)
    switch (currentActiveTab) {
      case "tabGen":
        if (typeof refreshAffordabilityLive === "function") refreshAffordabilityLive();
        break;
      case "tabUpg":
        if (typeof renderUpgradesList === "function") renderUpgradesList();
        break;
      case "tabMerc":
        if (typeof renderMerceria === "function") renderMerceria();
        if (typeof renderWorkshopWidget === "function") renderWorkshopWidget();
        break;
      case "tabMini":
        if (typeof renderMinigamesList === "function") renderMinigamesList();
        break;
      case "tabRob":
        if (typeof renderCharacterCustomizer === "function") renderCharacterCustomizer();
        if (typeof renderCharacterViewer === "function") renderCharacterViewer();
        break;
      case "tabAch":
        if (typeof renderStatsView === "function") renderStatsView();
        if (typeof renderAchievementsGrid === "function") renderAchievementsGrid();
        break;
      case "tabBorsa":
        if (typeof drawBorsaCanvas === "function") drawBorsaCanvas();
        if (typeof renderBorsaTicker === "function") renderBorsaTicker();
        break;
    }

    if (typeof updateFloatingBorsaHud === "function") updateFloatingBorsaHud();
  } catch (err) {
    console.warn("render() failed:", err);
  }
}
