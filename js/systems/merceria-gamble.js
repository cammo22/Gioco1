/**
 * VESUVIO.EXE - Merceria Gambling, Rerolls & Item Sets
 * Features Lire-based item shop, loot packs, set synergy bonuses & item levels
 */
"use strict";

const ITEM_CATALOG = [
  // Set Vesuvio (Fire & Overcharge)
  { id: "w_vesuvio", name: "Ali del Vesuvio", set: "vesuvio", slot: "wings", icon: "🦅", rarity: "epica", baseCost: 500000, desc: "Piume di roccia fusa ed energia magmatica.", mult: 1.4 },
  { id: "h_vesuvio", name: "Corona di Lava", set: "vesuvio", slot: "hat", icon: "👑", rarity: "leggendaria", baseCost: 15000000, desc: "Corona incandescente forgiata nel cratere.", mult: 1.8 },
  { id: "a_vesuvio", name: "Nucleo Termico", set: "vesuvio", slot: "acc", icon: "🌋", rarity: "rara", baseCost: 80000, desc: "Accumulatore che assorbe il calore del suolo.", mult: 1.3 },
  
  // Set Enforcer (Defense & Armor Reflect)
  { id: "w_enforcer", name: "Lame Corazzate", set: "enforcer", slot: "wings", icon: "🛠️", rarity: "rara", baseCost: 120000, desc: "Piastre balistiche saldate sulle scapole.", mult: 1.3 },
  { id: "a_enforcer", name: "Spallacci d'Acciaio", set: "enforcer", slot: "acc", icon: "🛡️", rarity: "comune", baseCost: 25000, desc: "Blindatura pesante di recupero industriale.", mult: 1.2 },
  { id: "e_enforcer", name: "Visore Tattico", set: "enforcer", slot: "eyes", icon: "🕶️", rarity: "rara", baseCost: 150000, desc: "Mirino balistico ad alto contrasto.", mult: 1.35 },
  
  // Set Frutiger Aero (Glossy Tech & Production Boost)
  { id: "w_frutiger", name: "Ali Quantico", set: "frutiger", slot: "wings", icon: "🌀", rarity: "leggendaria", baseCost: 25000000, desc: "Superfici cromate e gradienti acqua lucidi.", mult: 2.0 },
  { id: "f_frutiger", name: "Bolla d'Acqua Y2K", set: "frutiger", slot: "fx", icon: "🫧", rarity: "epica", baseCost: 3500000, desc: "Riflessi liquidi che ottimizzano la rete.", mult: 1.6 },
  { id: "h_frutiger", name: "Aureola Aurora", set: "frutiger", slot: "hat", icon: "🌌", rarity: "epica", baseCost: 4000000, desc: "Bagliore azzurro-verde menta rilassante.", mult: 1.65 },
  
  // Set Robomafia (Greed & Street Crime)
  { id: "h_mafia", name: "Coppola in Titanio", set: "robomafia", slot: "hat", icon: "🧢", rarity: "rara", baseCost: 200000, desc: "Copricapo corazzato dal rispetto del quartiere.", mult: 1.35 },
  { id: "a_mafia", name: "Borsa di Lire", set: "robomafia", slot: "acc", icon: "💰", rarity: "epica", baseCost: 5000000, desc: "Tintinnio continuo di contante che moltiplica il loot.", mult: 1.7 },
  { id: "e_mafia", name: "Fessure Ambrate", set: "robomafia", slot: "eyes", icon: "🕶️", rarity: "leggendaria", baseCost: 18000000, desc: "Sguardo lento, calmo e minaccioso.", mult: 1.9 },
  
  // Set SISTEMA.EXE (Glitch & Automation Synergy)
  { id: "f_sistema", name: "Sfera Manifestata", set: "sistema", slot: "fx", icon: "⚪", rarity: "mitica", baseCost: 100000000, desc: "Sfera cromata pura che sincronizza ogni automa.", mult: 3.0 },
  { id: "a_sistema", name: "Antenna Glitch", set: "sistema", slot: "antenna", icon: "📡", rarity: "epica", baseCost: 8000000, desc: "Ricevitore sub-bass a bassissima latenza.", mult: 1.75 },
  { id: "e_sistema", name: "Visore 0x00", set: "sistema", slot: "eyes", icon: "👁️", rarity: "leggendaria", baseCost: 30000000, desc: "Interfaccia dati diretta con la coscienza IA.", mult: 2.2 }
];

let activeMerceriaCatalog = [];
let merceriaTab = "shop"; // "shop", "packs", "sets", "workshop"

function initMerceria() {
  if (!Array.isArray(S.inventory)) S.inventory = [];
  rerollMerceriaCatalog(false);
}

function rerollMerceriaCatalog(costLire = true) {
  const rerollCost = Math.round(25000 * Math.pow(1.3, S.rerollsCount || 0));
  
  if (costLire) {
    if (!canAfford("lire", rerollCost)) {
      if (typeof sErr === "function") sErr();
      if (typeof toast === "function") {
        toast("🛍️", "Lire Insufficienti", `Il reroll costa ₤ ${fmt(rerollCost)}.`);
      }
      return;
    }
    S.lire -= rerollCost;
    S.rerollsCount = (S.rerollsCount || 0) + 1;
    if (typeof sReroll === "function") sReroll();
  }
  
  // Roll 6 items from catalog with weighted rarity based on level
  const pool = [...ITEM_CATALOG];
  const rolled = [];
  
  for (let i = 0; i < 6; i++) {
    if (pool.length === 0) break;
    const randomIdx = Math.floor(Math.random() * pool.length);
    const item = pool.splice(randomIdx, 1)[0];
    rolled.push(item);
  }
  
  activeMerceriaCatalog = rolled;
  renderMerceria();
  if (typeof render === "function") render();
  if (typeof saveGame === "function") saveGame();
}

function getItemCost(item) {
  const base = item.baseCost || 50000;
  let discount = S.shopDisc || 0;
  
  // Robomafia set synergy (-20% shop prices)
  const sets = getActiveSetBonus();
  if (sets.robomafia) discount = Math.min(0.8, discount + 0.20);
  
  return Math.round(base * (1 - discount));
}

// Item upgrade cost in ROTTAMI (cheap, so sets are easy to level)
function getItemUpgradeCost(item, level) {
  const rarityMult = { comune: 1, rara: 2, epica: 4, leggendaria: 7, mitica: 12 }[item.rarity] || 2;
  return Math.round(20 * rarityMult * Math.pow(1.6, (level || 1) - 1));
}

// Equip / unequip toggle from the inventory
function toggleEquipItem(itemId) {
  const item = ITEM_CATALOG.find(x => x.id === itemId);
  if (!item) return;
  
  const inv = (S.inventory || []).find(x => x.id === itemId);
  if (!inv) return;
  
  if (inv.equipped) {
    // Unequip
    inv.equipped = false;
    const slotMap = { wings: "wing", hat: "hat", acc: "acc", eyes: "eyes", antenna: "antenna", fx: "fx" };
    const field = slotMap[item.slot];
    if (field && S.rob[field] === item.id) S.rob[field] = "none";
    if (typeof toast === "function") toast("🎒", `${item.name} rimesso in borsa`, "", { dur: 1600 });
  } else {
    equipInventoryItem(itemId);
    if (typeof toast === "function") toast("✅", `${item.name} equipaggiato!`, item.slot.toUpperCase(), { dur: 1600 });
  }
  
  if (typeof renderCharacterViewer === "function") renderCharacterViewer();
  if (typeof renderMerceria === "function") renderMerceria();
  saveGame();
}

function buyMerceriaItem(itemId) {
  const item = ITEM_CATALOG.find(x => x.id === itemId);
  if (!item) return;
  
  const cost = getItemCost(item);
  if (!canAfford("lire", cost)) {
    if (typeof sErr === "function") sErr();
    if (typeof toast === "function") {
      toast("🛍️", "Lire Insufficienti", `Questo oggetto costa ₤ ${fmt(cost)}.`);
    }
    return;
  }
  
  S.lire -= cost;
  S.inventory = S.inventory || [];
  
  const existing = S.inventory.find(x => x.id === itemId);
  if (existing) {
    existing.level = (existing.level || 1) + 1;
    if (typeof toast === "function") {
      toast("✨", `${item.name} Potenziato!`, `Livello oggetto aumentato a ${existing.level}!`);
    }
  } else {
    S.inventory.push({ id: itemId, level: 1, equipped: false });
    if (typeof toast === "function") {
      toast("🛍️", `Acquistato: ${item.name}!`, `Aggiunto al tuo inventario.`);
    }
  }
  
  S.stats.shopBuys = (S.stats.shopBuys || 0) + 1;
  if (typeof sBuy === "function") sBuy();
  
  // Auto-equip item slot
  equipInventoryItem(itemId);
  
  renderMerceria();
  if (typeof renderCharacterViewer === "function") renderCharacterViewer();
  if (typeof render === "function") render();
  if (typeof checkAch === "function") checkAch();
  if (typeof saveGame === "function") saveGame();
}

function equipInventoryItem(itemId) {
  const item = ITEM_CATALOG.find(x => x.id === itemId);
  if (!item) return;
  
  // Map slot to character customizer
  if (item.slot === "wings") S.rob.wing = item.id;
  if (item.slot === "hat") S.rob.hat = item.id;
  if (item.slot === "acc") S.rob.acc = item.id;
  if (item.slot === "eyes") S.rob.eyes = item.id;
  if (item.slot === "antenna") S.rob.antenna = item.id;
  if (item.slot === "fx") S.rob.fx = item.id;
  
  // Mark in inventory
  S.inventory.forEach(inv => {
    const invItem = ITEM_CATALOG.find(x => x.id === inv.id);
    if (invItem && invItem.slot === item.slot) {
      inv.equipped = (inv.id === itemId);
    }
  });
  
  // Set synergies changed
  if (typeof invalidateStatCache === "function") invalidateStatCache();
}

// GET ACTIVE SET BONUSES (SYNERGIES) — cached, invalidated on equip changes
function getActiveSetBonus() {
  if (typeof _statCache !== "undefined" && _statCache.sets !== null) return _statCache.sets;
  
  const activeSets = {
    vesuvio: false,   // +100% damage during Overcharge
    enforcer: false,  // +50% Max HP & 25% damage reflect
    frutiger: false,  // +200% production
    robomafia: false, // +150% monster Lire & -20% shop discount
    sistema: false    // Automation hits 2x speed & triggers multistrike
  };
  
  if (!S || !S.inventory) return activeSets;
  
  const setCounts = {};
  S.inventory.forEach(inv => {
    if (inv.equipped) {
      const def = ITEM_CATALOG.find(x => x.id === inv.id);
      if (def && def.set) {
        setCounts[def.set] = (setCounts[def.set] || 0) + 1;
      }
    }
  });
  
  // 2+ pieces of a set activates synergy
  Object.keys(activeSets).forEach(setName => {
    if ((setCounts[setName] || 0) >= 2) {
      activeSets[setName] = true;
    }
  });
  
  if (typeof _statCache !== "undefined") _statCache.sets = activeSets;
  return activeSets;
}

function renderMerceria() {
  const container = document.getElementById("mercGrid");
  if (!container) return;
  container.innerHTML = "";
  
  // Render Item Sets Status widget
  renderSetSynergiesWidget();
  
  if (activeMerceriaCatalog.length === 0) {
    rerollMerceriaCatalog(false);
  }
  
  activeMerceriaCatalog.forEach(item => {
    const inv = (S.inventory || []).find(x => x.id === item.id);
    const owned = !!inv;
    const itemLevel = inv ? inv.level : 0;
    const equipped = inv && inv.equipped;
    const cost = getItemCost(item);
    const can = canAfford("lire", cost);
    
    const card = document.createElement("div");
    card.className = `shopCard rar-${item.rarity} ${can ? "can" : "cant"} ${owned ? "owned" : ""}`;
    card.dataset.cost = cost;
    card.dataset.cur = "l";
    
    const upgCost = owned ? getItemUpgradeCost(item, itemLevel) : 0;
    const canUpg = owned && canAfford("r", upgCost);
    
    card.innerHTML = `
      <div class="sIcon">${item.icon}</div>
      <div class="sName">${item.name} ${equipped ? '<span style="color:var(--mint);">✓</span>' : ""}</div>
      <div class="sRarity">${item.rarity}</div>
      <div class="sSet">SET: ${item.set.toUpperCase()}</div>
      <div class="sDesc">${item.desc}</div>
      <div class="sCost">
        ${owned ? `Liv. ${itemLevel}` : "Prezzo: ₤ " + fmt(cost)}
      </div>
      <div class="sBtnRow">
        <button class="sBtn act-equip ${equipped ? "" : "okBtn"}">
          ${equipped ? "Rimuovi" : "Equipaggia"}
        </button>
        <button class="sBtn act-upgrade ${canUpg ? "okBtn" : "noBtn"}" title="Potenzia con Rottami">
          ⚙️ ${fmt(upgCost)} → Lv.${itemLevel + 1}
        </button>
        ${owned ? "" : `<button class="sBtn act-buy ${can ? "okBtn" : "noBtn"}">₤ ${fmt(cost)}</button>`}
      </div>
    `;
    
    // Separate actions per button
    card.querySelector(".act-equip").onclick = (e) => {
      e.stopPropagation();
      toggleEquipItem(item.id);
    };
    card.querySelector(".act-upgrade").onclick = (e) => {
      e.stopPropagation();
      upgradeMerceriaItem(item.id);
    };
    const buyBtn = card.querySelector(".act-buy");
    if (buyBtn) buyBtn.onclick = (e) => { e.stopPropagation(); buyMerceriaItem(item.id); };
    
    container.appendChild(card);
  });
}

// Upgrade an item level using ROTTAMI
function upgradeMerceriaItem(itemId) {
  const item = ITEM_CATALOG.find(x => x.id === itemId);
  if (!item) return;
  const inv = (S.inventory || []).find(x => x.id === itemId);
  if (!inv) return;
  
  const cost = getItemUpgradeCost(item, inv.level);
  if (!canAfford("r", cost)) {
    if (typeof sErr === "function") sErr();
    if (typeof toast === "function") toast("⚙️", "Rottami Insufficienti", `Servono ${cost} ⚙️ per potenziare.`);
    return;
  }
  
  S.rottami -= cost;
  inv.level++;
  if (typeof sBuy === "function") sBuy();
  renderMerceria();
  saveGame();
}

function renderSetSynergiesWidget() {
  const widget = document.getElementById("setSynergiesBox");
  if (!widget) return;
  
  const active = getActiveSetBonus();
  
  widget.innerHTML = `
    <h3>✨ SINERGIE SET DI OGGETTI ATTIVE (Equipaggia 2+ pezzi per set)</h3>
    <div class="set-grid">
      <div class="set-badge ${active.vesuvio ? "active" : ""}">
        <div class="sn">🌋 Set Vesuvio ${active.vesuvio ? "✓ ATTIVO" : ""}</div>
        <div class="sb">+100% Danno in Sovraccarico Termico</div>
      </div>
      <div class="set-badge ${active.enforcer ? "active" : ""}">
        <div class="sn">🛡️ Set Enforcer ${active.enforcer ? "✓ ATTIVO" : ""}</div>
        <div class="sb">+50% Energia Max & Riflette 25% danno subito</div>
      </div>
      <div class="set-badge ${active.frutiger ? "active" : ""}">
        <div class="sn">🌀 Set Frutiger Aero ${active.frutiger ? "✓ ATTIVO" : ""}</div>
        <div class="sb">+200% Produzione Lire/s passive</div>
      </div>
      <div class="set-badge ${active.robomafia ? "active" : ""}">
        <div class="sn">🕶️ Set Robomafia ${active.robomafia ? "✓ ATTIVO" : ""}</div>
        <div class="sb">+150% Lire dai mostri & -20% Sconti Merceria</div>
      </div>
      <div class="set-badge ${active.sistema ? "active" : ""}">
        <div class="sn">👁️ Set SISTEMA.EXE ${active.sistema ? "✓ ATTIVO" : ""}</div>
        <div class="sb">Automi colpiscono a velocità 2x e attivano Multicolpo</div>
      </div>
    </div>
  `;
}
