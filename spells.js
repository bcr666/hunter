function filterSpells(catalog, knownIds, scope, arcanum, query) {
 const search = query.trim().toLowerCase();
 return catalog.filter(spell => (scope === "all" || knownIds.includes(spell.id))
  && (!arcanum || Object.hasOwn(spell.arcana || {}, arcanum))
  && (!search || [spell.name, spell.description, spell.practice, spell.notes].some(value => String(value || "").toLowerCase().includes(search))))
  .sort((a,b) => a.name.localeCompare(b.name));
}

async function initSpells() {
 try {
  const [data, response] = await Promise.all([loadCharacter(), fetch("spells.json", {cache: "no-store"})]);
  if (!response.ok) throw new Error("Could not load spells.json");
  const catalog = (await response.json()).spells;
  if (!Array.isArray(catalog)) throw new Error("spells.json must contain a spells array.");
  const ids = new Set();
  for (const spell of catalog) {
   if (!spell || typeof spell.id !== "string" || !spell.id || typeof spell.name !== "string" || !spell.name || ids.has(spell.id)
    || !spell.arcana || typeof spell.arcana !== "object" || Array.isArray(spell.arcana)) {
    throw new Error("Each spell needs a unique id, a name, and an arcana object.");
   }
   ids.add(spell.id);
  }
  const character = data.character;
  const known = [...new Set([...(character.spells || []), ...(character.rotes || []).map(getRoteSpellId)])];
  document.getElementById("spellSubtitle").textContent = `${character.name}’s spell reference`;
  document.querySelector('#spellScope option[value="character"]').textContent = `${character.name}’s spells`;
  const missing = known.filter(id => !ids.has(id));
  if (missing.length) {
   const warning = document.getElementById("spellWarning");
   warning.hidden = false;
   warning.textContent = `Missing spell entries: ${missing.join(", ")}`;
  }
  const arcana = [...new Set([...Object.keys(character.mage?.arcana || {}), ...catalog.flatMap(spell => Object.keys(spell.arcana))])].sort();
  document.getElementById("arcanaFilter").insertAdjacentHTML("beforeend", arcana.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join(""));
  function render() {
   const matches = filterSpells(catalog, known, document.getElementById("spellScope").value,
    document.getElementById("arcanaFilter").value, document.getElementById("spellSearch").value);
   document.getElementById("spellCount").textContent = `${matches.length} spell${matches.length === 1 ? "" : "s"}`;
   document.getElementById("spellList").innerHTML = matches.length ? matches.map(spell => {
    const details = {Practice: spell.practice, Action: spell.action, Duration: spell.duration,
     Range: spell.range, Aspect: spell.aspect, Cost: spell.cost, "Primary factor": spell.primaryFactor,
     "Dice pool": spell.dicePool, Withstand: spell.withstand, Source: spell.source};
    return `<article class="card spell-card" id="spell-${escapeHtml(spell.id)}" tabindex="-1"><h2>${escapeHtml(spell.name)}</h2>
     <div class="pill-list">${Object.entries(spell.arcana).map(([name,rating]) => `<span class="pill">${escapeHtml(name)} ${escapeHtml(rating)}</span>`).join("")}</div>
     <dl class="spell-details">${Object.entries(details).filter(([,value]) => value != null && value !== "").map(([label,value]) => `<div><dt class="label">${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
     <p class="spell-text">${escapeHtml(spell.description || "No description yet.")}</p>
     ${spell.notes ? `<p class="spell-text brand-subtitle">${escapeHtml(spell.notes)}</p>` : ""}</article>`;
   }).join("") : `<section class="card"><p>${!catalog.length ? "The spell catalog is empty." : "No spells match this selection."}</p></section>`;
  }
  ["spellScope", "arcanaFilter", "spellSearch"].forEach(id => document.getElementById(id).addEventListener("input", render));
  function openLinkedSpell() {
   let id;
   try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
   if (!id.startsWith("spell-")) return;
   const spellId = id.slice(6);
   if (!ids.has(spellId)) return;
   document.getElementById("spellScope").value = known.includes(spellId) ? "character" : "all";
   document.getElementById("arcanaFilter").value = "";
   document.getElementById("spellSearch").value = "";
   render();
   const target = document.getElementById(id);
   target?.focus({preventScroll: true});
   target?.scrollIntoView?.({block: "start"});
  }
  window.addEventListener("hashchange", openLinkedSpell);
  render();
  openLinkedSpell();
 } catch (error) {
  document.getElementById("spellList").textContent = `Unable to load spells: ${error.message}`;
 }
}
initSpells();
