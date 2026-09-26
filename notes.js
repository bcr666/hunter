const storageKey = "wod-mobile-character-notes";

function setActiveNav() {
	const page = document.body.dataset.page;

	document.querySelectorAll(".nav a").forEach(link => {
		link.classList.toggle("active", link.dataset.page === page);
	});
}

function getNotes() {
	return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveNotes(notes) {
	localStorage.setItem(storageKey, JSON.stringify(notes));
}

function renderNotes() {
	const notes = getNotes();
	const list = document.getElementById("notesList");

	if (!notes.length) {
		list.innerHTML = `<section class="card"><p class="brand-subtitle">No notes yet.</p></section>`;
		return;
	}

	list.innerHTML = notes
		.map(note => `
			<article class="entry">
				<div class="entry-header">
					<span class="entry-title">${note.title}</span>
					<span>${note.createdAt}</span>
				</div>
				<div>${note.text.replaceAll("\n", "<br>")}</div>
				<div class="form-actions">
					<button class="secondary" data-delete-note="${note.id}">Delete</button>
				</div>
			</article>
		`)
		.join("");

	document.querySelectorAll("[data-delete-note]").forEach(button => {
		button.addEventListener("click", () => {
			const id = button.dataset.deleteNote;
			saveNotes(getNotes().filter(note => note.id !== id));
			renderNotes();
		});
	});
}

function clearForm() {
	document.getElementById("noteTitle").value = "";
	document.getElementById("noteText").value = "";
}

document.getElementById("saveNoteBtn").addEventListener("click", () => {
	const title = document.getElementById("noteTitle").value.trim() || "Untitled Note";
	const text = document.getElementById("noteText").value.trim();

	if (!text) {
		return;
	}

	const notes = getNotes();

	notes.unshift({
		id: crypto.randomUUID(),
		title,
		text,
		createdAt: new Date().toLocaleString()
	});

	saveNotes(notes);
	clearForm();
	renderNotes();
});

document.getElementById("clearNoteBtn").addEventListener("click", clearForm);

setActiveNav();
renderNotes();