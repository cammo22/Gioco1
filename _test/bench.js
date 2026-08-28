// Bench: cached vs uncached derived stats at 60fps + 20 bot strikes/s
"use strict";
const elements = new Map();
function makeEl(id){return{id:id||"",children:[],style:{},dataset:{},classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},toggle(c,v){v?this._s.add(c):this._s.delete(c)},contains(c){return this._s.has(c)}},innerHTML:"",textContent:"",appendChild(c){this.children.push(c);return c},removeChild(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1)},remove(){},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){},onclick:null};}
global.document={getElementById(id){if(!elements.has(id))elements.set(id,makeEl(id));return elements.get(id)},querySelectorAll(){return[]},createElement:makeEl,body:makeEl("body"),hidden:false,addEventListener(){}};
global.window=global;
global.localStorage={_store:{},getItem(k){return this._store[k]!==undefined?this._store[k]:null},setItem(k,v){this._store[k]=String(v)},removeItem(k){delete this._store[k]}};
global.performance={now:()=>Date.now()};
global.requestAnimationFrame=()=>{};
global.structuredClone=o=>JSON.parse(JSON.stringify(o));
const fs=require("fs"),path=require("path"),vm=require("vm");
const base="C:/Users/dapca/Desktop/gioco/VESUVIO.EXE/js/";
["core/state.js","core/audio.js","core/math-curves.js","graphics/svg-factory.js","graphics/world-engine.js","systems/combat-waves.js","systems/boss-system.js","systems/upgrades.js","systems/merceria-gamble.js","systems/workshop-tickets.js","systems/borsa-telemetry.js","systems/minigames.js","ui/notifications.js","main.js"].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(base,f),"utf8"),{filename:f}));

// Rich endgame-ish state: many upgrades owned (worst case scan)
S.upgrades = ALL_UPGRADES.map(u=>u.id);  // ALL ~90 upgrades owned
S.lvl = 90; S.gen = {aut:50,lav:30,bar:20,pacc:10,mec:5};

const N = 100000;
// UNCACHED: invalidate before every call (simulates old behavior)
let t0 = performance.now();
for (let i=0;i<N;i++){ invalidateStatCache(); clickDmg(); calcProd(); critChance(); }
const oldMs = performance.now()-t0;
// CACHED: normal new behavior
t0 = performance.now();
for (let i=0;i<N;i++){ clickDmg(); calcProd(); critChance(); }
const newMs = performance.now()-t0;
const callsPerSec = 80*3; // ~60fps loop + 20 bot/s, each doing these calls
console.log(`UNCACHED: ${oldMs.toFixed(0)}ms per ${N}x3 calls -> ${(oldMs/N*callsPerSec).toFixed(2)}ms/s of pure stat math`);
console.log(`CACHED:   ${newMs.toFixed(0)}ms per ${N}x3 calls -> ${(newMs/N*callsPerSec).toFixed(4)}ms/s of pure stat math`);
console.log(`Speedup: ${(oldMs/newMs).toFixed(0)}x on stat math`);
