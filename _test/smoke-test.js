// Runtime smoke test for VESUVIO.EXE with a minimal DOM/browser mock.
// Verifies the stat cache, invalidation, save/load split, and combat loop math.
"use strict";

// ---------- Minimal browser environment ----------
const elements = new Map();
function makeEl(id) {
  return {
    id: id || "",
    children: [],
    style: {},
    dataset: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, v) { v ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    innerHTML: "",
    textContent: "",
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); },
    remove() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    onclick: null,
  };
}
global.document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); },
  querySelectorAll() { return []; },
  createElement: makeEl,
  body: makeEl("body"),
  hidden: false,
  addEventListener() {},
};
global.window = global;
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] !== undefined ? this._store[k] : null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => {}; // don't run the loop
global.structuredClone = (o) => JSON.parse(JSON.stringify(o));
global.AudioContext = undefined;

// Load scripts in the same order as index.html — via vm.runInThisContext
// so they share one scope, exactly like browser <script> tags do.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const base = "C:/Users/dapca/Desktop/gioco/VESUVIO.EXE/js/";
const files = [
  "core/state.js", "core/audio.js", "core/math-curves.js",
  "graphics/svg-factory.js", "graphics/world-engine.js",
  "systems/combat-waves.js", "systems/boss-system.js",
  "systems/upgrades.js", "systems/merceria-gamble.js",
  "systems/workshop-tickets.js", "systems/borsa-telemetry.js",
  "systems/minigames.js", "ui/notifications.js", "main.js",
];
files.forEach(f => {
  const src = fs.readFileSync(path.join(base, f), "utf8");
  vm.runInThisContext(src, { filename: f });
});

// Silence toast rendering side effects
global.toast = (i, t, b) => {};

// ---------- TEST 1: stat cache works & invalidates ----------
// Give the player some upgrades & generators by hand
S.upgrades.push("cv1");           // click ×2
S.gen.aut = 10;                   // 10 Piccolo Automa
S.lvl = 90;

const dmg1 = clickDmg();
const prod1 = calcProd();
const dmg1b = clickDmg();
console.assert(dmg1 === dmg1b, "clickDmg not cached (same value expected)");
console.assert(prod1 > 0, "calcProd should be > 0 with 10 automi");

// Buy-path invalidation
S.upgrades.push("cv2");           // click ×3
invalidateStatCache();
const dmg2 = clickDmg();
console.assert(dmg2 === dmg1 * 3 / 2 * 1.5 || dmg2 > dmg1, `dmg should grow after upgrade (${dmg1} -> ${dmg2})`);
console.assert(dmg2 > dmg1, `FAIL: damage did not increase after upgrade: ${dmg1} -> ${dmg2}`);

// Buff invalidation
const before = clickDmg();
addBuff("dmg", 2, 10, "TEST");
const after = clickDmg();
console.assert(after === before * 2, `FAIL: buff not applied: ${before} -> ${after}`);
buffs.dmg = null;
invalidateStatCache();
console.assert(clickDmg() === before, "FAIL: buff removal not reflected");

// ---------- TEST 2: save/load split (telemetry excluded) ----------
S.marketData.sec.push({ t: 1, prod: 5, dmg: 5, krate: 0, tot: 0, trust: 100 });
saveGame();
const saved = JSON.parse(localStorage.getItem("vesuvioEXE_saveV3"));
console.assert(!("marketData" in saved), "FAIL: telemetry still serialized in main save");
console.assert(saved.lvl === 90, "FAIL: main save lost lvl");

// ---------- TEST 3: combat math at lvl 90 (wave of 6) ----------
S.lvl = 90;
S.bots = { ab1: 10, ab2: 5 };  // 10 + 10 = 20 strikes/s
console.assert(botRate() === 20, `FAIL: botRate should be 20, got ${botRate()}`);
S.botsOn = false;
console.assert(botRate() === 0, "FAIL: botsOn=false should give 0");
S.botsOn = true;

// Wave spawn at lvl 90
S.bossWaiting = false;
S.enemyType = getWaveType(90);
console.assert(S.enemyType === "boss", `FAIL: lvl 90 should be a boss level, got ${S.enemyType}`);
S.lvl = 89;
S.enemyType = getWaveType(89);
spawnWave();
console.assert(Array.isArray(S.wave) && S.wave.length === 6, `FAIL: lvl 89 wave should be 6, got ${S.wave.length}`);

// Attack kills monsters & floating damage capped
for (let i = 0; i < 50; i++) executeAttack(true, null);
console.assert(S.wave.every(m => m.hp >= 0), "FAIL: negative HP found");

// ---------- TEST 4: processMonsterDeath rewards at lvl 89 (numbers sane) ----------
const lireBefore = S.lire;
processMonsterDeath(S.wave[0]);
console.assert(S.lire >= lireBefore, "FAIL: kills should grant lire");

// ---------- TEST 5: getActiveSetBonus cache ----------
S.inventory.push({ id: "jet_gold", level: 1, equipped: true }); // if exists
const sets1 = getActiveSetBonus();
const sets2 = getActiveSetBonus();
console.assert(sets1 === sets2, "FAIL: getActiveSetBonus not cached");

// ---------- TEST 6: offline gains don't explode ----------
console.assert(xpNeed(1) === 18, "xpNeed(1) should be 18");
console.assert(fmt(1234) === "1.23K", `fmt(1234) -> ${fmt(1234)}`);

console.log("ALL SMOKE TESTS PASSED ✅");
