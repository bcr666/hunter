const storageKey = "wod-mobile-character-xp";
const deletedStorageKey = "wod-mobile-character-xp-deleted-json-ids";

let jsonEntries = [];

function setActiveNav() {
	const page = document.body.dataset.page;

	document.querySelectorAll(".nav a").forEach(link => {
		link.classList.toggle("active", link.dataset.page === page);
	});
}

async function loadCharacterData() {
	const response = await fetch("character-data.json", { cache: 'no-store' });

	if (!response.ok) {
		throw new Error("Could not load character-data.json");
	}

	return await response.json();
}

function getStoredEntries() {
	return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveStoredEntries(entries) {
	localStorage.setItem(storageKey, JSON.stringify(entries));
}

function normalizeEntry(entry, source) {
	return {
		id: entry.id,
		date: entry.date || "",
		amount: Number(entry.amount) || 0,
		title: entry.title || "XP Entry",
		notes: entry.notes || "",
		source
	};
}

function getEntries() {
	return [
		...getStoredEntries(),
		...jsonEntries
	].map(entry => normalizeEntry(entry, entry.source || "local"));
}

function formatSigned(value) {
	return value > 0 ? `+${value}` : String(value);
}

function renderXp() {
	const entries = getEntries();
	const list = document.getElementById("xpList");

	const earned = entries.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
	const spent = entries.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);

	document.getElementById("xpEarned").textContent = earned;
	document.getElementById("xpSpent").textContent = spent;
	document.getElementById("xpAvailable").textContent = earned - spent;

	if (!entries.length) {
		list.innerHTML = `<section class="card"><p class="brand-subtitle">No XP entries yet.</p></section>`;
		return;
	}

	list.innerHTML = entries.map(entry => `
		<article class="entry">
			<div class="entry-header">
				<span class="entry-title">${entry.title}</span>
				<span>${entry.date || "No date"} · ${formatSigned(entry.amount)} XP</span>
			</div>
			<div>${entry.notes.replaceAll("\n", "<br>")}</div>
		</article>
	`).join("");
}

function clearForm() {
	document.getElementById("xpDate").value = "";
	document.getElementById("xpAmount").value = "";
	document.getElementById("xpTitle").value = "";
	document.getElementById("xpNotes").value = "";
}

document.getElementById("saveXpBtn").addEventListener("click", () => {
	const amount = Number(document.getElementById("xpAmount").value);

	if (!amount) {
		return;
	}

	const entries = getStoredEntries();

	entries.unshift({
		id: crypto.randomUUID(),
		date: document.getElementById("xpDate").value,
		amount,
		title: document.getElementById("xpTitle").value.trim() || "XP Entry",
		notes: document.getElementById("xpNotes").value.trim(),
		source: "local"
	});

	saveStoredEntries(entries);
	clearForm();
	renderXp();
});

document.getElementById("clearXpBtn").addEventListener("click", clearForm);

document.getElementById("xpDate").valueAsDate = new Date();

setActiveNav();

loadCharacterData()
	.then(data => {
		jsonEntries = data.character.xp || [];
		renderXp();
	})
	.catch(error => {
		document.getElementById("xpList").innerHTML = `<section class="card"><p>${error.message}</p></section>`;
	});
