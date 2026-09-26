function setActiveNav() {
	const page = document.body.dataset.page;

	document.querySelectorAll(".nav a").forEach(link => {
		link.classList.toggle("active", link.dataset.page === page);
	});
}

function dotString(value, max = 5) {
	let html = "";

	for (let i = 1; i <= max; i++) {
		html += `<span class="${i <= value ? "dot-full" : "dot-empty"}">●</span>`;
	}

	return `<span class="dots">${html}</span>`;
}

function renderTraitSection(title, traits) {
	const rows = Object.entries(traits)
		.map(([name, value]) => `
			<div class="trait-row">
				<span>${name}</span>
				${dotString(value)}
			</div>
		`)
		.join("");

	return `
		<section class="card">
			<h2>${title}</h2>
			${rows}
		</section>
	`;
}


function getTraitValue(traitGroups, traitName, fallback = 0) {
	for (const traits of Object.values(traitGroups || {})) {
		if (Object.prototype.hasOwnProperty.call(traits, traitName)) {
			return Number(traits[traitName]) || fallback;
		}
	}

	return fallback;
}

function calculateAdvantages(character) {
	const attributes = character.attributes || {};
	const skills = character.skills || {};
	const manualAdvantages = character.advantages || {};

	const strength = getTraitValue(attributes, "Strength");
	const dexterity = getTraitValue(attributes, "Dexterity");
	const stamina = getTraitValue(attributes, "Stamina");
	const wits = getTraitValue(attributes, "Wits");
	const resolve = getTraitValue(attributes, "Resolve");
	const composure = getTraitValue(attributes, "Composure");
	const athletics = getTraitValue(skills, "Athletics");

	const size = Number(manualAdvantages.Size) || 5;
	const moralityName = Object.prototype.hasOwnProperty.call(manualAdvantages, "Integrity") ? "Integrity" : "Morality";
	const morality = Number(manualAdvantages[moralityName]) || 7;
	const speedFactor = Number(manualAdvantages.SpeedFactor || manualAdvantages["Speed Factor"]) || 5;

	return {
		Defense: Math.min(dexterity, wits),
		Health: stamina + size,
		Initiative: dexterity + composure,
		[moralityName]: morality,
		Size: size,
		Speed: strength + dexterity + speedFactor,
		Willpower: resolve + composure
	};
}

function renderPills(items) {
	return items.map(item => `<span class="pill">${item}</span>`).join("");
}

async function loadCharacter() {
	const response = await fetch("character-data.json", { cache: 'no-store' });

	if (!response.ok) {
		throw new Error("Could not load character-data.json");
	}

	return await response.json();
}
function getMeritDots(character, meritName) {
        const merit = (character.merits || []).find(
                m => m.name.toLowerCase() === meritName.toLowerCase()
        );

        return merit ? Number(merit.dots) || 0 : 0;
}

function calculateWoundPenalty(totalDamage, maxHealth, ironStaminaDots = 0) {
        let penalty = 0;

        if (totalDamage >= maxHealth) {
                penalty = -3;
        } else if (totalDamage >= maxHealth - 1) {
                penalty = -2;
        } else if (totalDamage >= maxHealth - 2) {
                penalty = -1;
        }

        // Iron Stamina moves the penalty one step toward zero per dot.
        return Math.min(0, penalty + ironStaminaDots);
}

function loadDamageState(character) {
        const key = `damage-${character.name}`;

        try {
                const saved = JSON.parse(localStorage.getItem(key));

                if (saved) {
                        return {
                                aggravated: Number(saved.aggravated) || 0,
                                lethal: Number(saved.lethal) || 0,
                                bashing: Number(saved.bashing) || 0
                        };
                }
        } catch (error) {
                console.warn("Could not load saved damage.", error);
        }

        return {
                aggravated: Number(character.damage?.aggravated) || 0,
                lethal: Number(character.damage?.lethal) || 0,
                bashing: Number(character.damage?.bashing) || 0
        };
}

function saveDamageState(character, damage) {
        const key = `damage-${character.name}`;

        localStorage.setItem(key, JSON.stringify(damage));
}

function initDamageTracker(character, maxHealth) {
        const damage = loadDamageState(character);
        const ironStamina = getMeritDots(character, "Iron Stamina");

        function getTotalDamage() {
                return damage.aggravated + damage.lethal + damage.bashing;
        }

        function renderDamage() {
                const totalDamage = getTotalDamage();

                document.getElementById("aggravatedDamage").textContent =
                        damage.aggravated;

                document.getElementById("lethalDamage").textContent =
                        damage.lethal;

                document.getElementById("bashingDamage").textContent =
                        damage.bashing;

                const penalty = calculateWoundPenalty(
                        totalDamage,
                        maxHealth,
                        ironStamina
                );

                document.getElementById("woundPenalty").innerHTML =
                        `Wound Penalty: <strong>${penalty}</strong>`;

                document.getElementById("healthSummary").textContent =
                        `${totalDamage} / ${maxHealth} damage`;

                renderHealthBar(
                        damage,
                        maxHealth
                );

                saveDamageState(character, damage);
        }

	document.querySelectorAll("[data-damage][data-change]").forEach(button => {
		button.addEventListener("click", () => {
			const type = button.dataset.damage;
			const change = Number(button.dataset.change);

			if (change > 0) {
				addDamage(damage, type, maxHealth);
			} else {
				removeDamage(damage, type);
			}

			renderDamage();
		});
	});

        renderDamage();
}

function addDamage(damage, type, maxHealth) {
	const total =
		damage.aggravated +
		damage.lethal +
		damage.bashing;

	/*
	 * There is still an empty Health box.
	 * Just add the damage normally.
	 */
	if (total < maxHealth) {
		damage[type]++;
		return;
	}

	/*
	 * Health track is full.
	 * Additional damage upgrades existing damage.
	 */
	switch (type) {
		case "bashing":
			if (damage.bashing > 0) {
				/*
				 * Bashing on a full track upgrades one
				 * Bashing to Lethal.
				 */
				damage.bashing--;
				damage.lethal++;
			} else if (damage.lethal > 0) {
				/*
				 * No Bashing remains, so the next overflow
				 * upgrades Lethal to Aggravated.
				 */
				damage.lethal--;
				damage.aggravated++;
			}
			break;

		case "lethal":
			if (damage.bashing > 0) {
				/*
				 * Lethal replaces/upgrades Bashing.
				 */
				damage.bashing--;
				damage.lethal++;
			} else if (damage.lethal > 0) {
				/*
				 * Entire track is already Lethal/Aggravated,
				 * so additional Lethal upgrades a Lethal box
				 * to Aggravated.
				 */
				damage.lethal--;
				damage.aggravated++;
			}
			break;

		case "aggravated":
			if (damage.bashing > 0) {
				damage.bashing--;
				damage.aggravated++;
			} else if (damage.lethal > 0) {
				damage.lethal--;
				damage.aggravated++;
			}
			break;
	}
}

function removeDamage(damage, type) {
	damage[type] = Math.max(0, damage[type] - 1);
}

function renderHealthBar(damage, maxHealth) {
        const healthBar = document.getElementById("healthBar");

        const segments = [];

        for (let i = 0; i < damage.aggravated; i++) {
                segments.push("aggravated");
        }

        for (let i = 0; i < damage.lethal; i++) {
                segments.push("lethal");
        }

        for (let i = 0; i < damage.bashing; i++) {
                segments.push("bashing");
        }

        while (segments.length < maxHealth) {
                segments.push("empty");
        }

        healthBar.innerHTML = segments
                .slice(0, maxHealth)
                .map((type, index) => `
                        <div
                                class="health-segment ${type}"
                                title="Health ${index + 1}: ${type}"
                        ></div>
                `)
                .join("");
}

function loadWillpowerState(character, maxWillpower) {
	const key = `willpower-${character.name}`;
	const saved = Number(localStorage.getItem(key));

	if (!Number.isNaN(saved) && saved >= 0) {
		return Math.min(saved, maxWillpower);
	}

	return maxWillpower;
}

function saveWillpowerState(character, currentWillpower) {
	const key = `willpower-${character.name}`;

	localStorage.setItem(key, String(currentWillpower));
}

function initWillpowerTracker(character, maxWillpower) {
	let currentWillpower = loadWillpowerState(character, maxWillpower);

	function renderWillpower() {
		const bar = document.getElementById("willpowerBar");

		bar.innerHTML = Array.from(
			{ length: maxWillpower },
			(_, index) => {
				const value = index + 1;
				const filled = value <= currentWillpower;

				return `
					<button
						type="button"
						class="willpower-box ${filled ? "filled" : "empty"}"
						data-willpower="${value}"
						aria-label="Set Willpower to ${value}"
					></button>
				`;
			}
		).join("");

		document.getElementById("willpowerSummary").textContent =
			`${currentWillpower} / ${maxWillpower}`;

		bar.querySelectorAll("[data-willpower]").forEach(button => {
			button.addEventListener("click", () => {
				const value = Number(button.dataset.willpower);

				/*
				 * Clicking the currently selected box again empties it,
				 * which makes setting Willpower to 0 easy.
				 */
				currentWillpower = currentWillpower === value ? value - 1 : value;

				saveWillpowerState(character, currentWillpower);
				renderWillpower();
			});
		});
	}

	renderWillpower();
}

function renderCharacter(data) {
	const c = data.character;

	document.getElementById("characterHero").innerHTML = `
		<h1 class="character-name">${c.name}</h1>
		<div class="character-meta">
			<div class="meta-item"><span class="label">Concept</span>${c.concept}</div>
			<div class="meta-item"><span class="label">Chronicle</span>${c.chronicle}</div>
			<div class="meta-item"><span class="label">Virtue / Vice</span>${c.virtue} / ${c.vice}</div>
			<div class="meta-item"><span class="label">Faction / Group</span>${c.faction || "—"} / ${c.group || "—"}</div>
		</div>
	`;

	document.getElementById("attributesGrid").innerHTML = Object.entries(c.attributes)
		.map(([category, traits]) => renderTraitSection(`${category[0].toUpperCase()}${category.slice(1)} Attributes`, traits))
		.join("");

	document.getElementById("skillsGrid").innerHTML = Object.entries(c.skills)
		.map(([category, traits]) => {
			const labels = {
				mental: 'Mental Skills <span class="unskilled-label">-3 unskilled</span>',
				physical: 'Physical Skills <span class="unskilled-label">-1 unskilled</span>',
				social: 'Social Skills <span class="unskilled-label">-1 unskilled</span>'
			};

			return renderTraitSection(labels[category], traits);
		})
		.join("");

	const advantages = calculateAdvantages(c);

	document.getElementById("advantagesGrid").innerHTML = Object.entries(advantages)
	        .map(([name, value]) => `
	                <div class="advantage">
	                        <span class="label">${name}</span>
	                        <strong>${value}</strong>
	                </div>
	        `)
	        .join("");

	initDamageTracker(c, advantages.Health);

	initWillpowerTracker(c, advantages.Willpower);

	document.getElementById("advantagesGrid").innerHTML = Object.entries(advantages)
		.map(([name, value]) => `
			<div class="advantage">
				<span class="label">${name}</span>
				<strong>${value}</strong>
			</div>
		`)
		.join("");

	document.getElementById("specialtiesList").innerHTML = renderPills(
		c.specialties.map(s => `${s.skill}: ${s.name}`)
	);

	document.getElementById("meritsList").innerHTML = c.merits
		.map(m => `
			<div class="trait-row">
				<span>${m.name}</span>
				${dotString(m.dots)}
			</div>
		`)
		.join("");

	document.getElementById("equipmentList").innerHTML = renderPills(c.equipment);
}

setActiveNav();

loadCharacter()
	.then(renderCharacter)
	.catch(error => {
		document.getElementById("characterHero").innerHTML = `<p>${error.message}</p>`;
	});
