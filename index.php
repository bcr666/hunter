<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>WoD Character Sheet</title>
	<link rel="stylesheet" href="styles.css?v=<?= filemtime('styles.css') ?>">
</head>
<body data-page="character">
	<header class="site-header">
	<div class="header-inner">
		<div class="brand">
			<div class="brand-title">World of Darkness</div>
			<div class="brand-subtitle">Mobile Character Sheet</div>
		</div>
		<nav class="nav">
			<a href="index.php" data-page="character">Sheet</a>
			<a href="notes.html" data-page="notes">Notes</a>
			<a href="experience.html" data-page="experience">XP</a>
		</nav>
	</div>
</header>
	<main class="app-shell">
		<section class="hero-card" id="characterHero">
			<p>Loading character...</p>
		</section>

		<section class="grid" id="attributesGrid"></section>
		<section class="grid" id="skillsGrid"></section>

		<section class="card">
			<h2>Advantages</h2>
			<div class="advantage-grid" id="advantagesGrid"></div>
		</section>

		<section class="card damage-card">
		        <div class="damage-heading">
		                <h2>Health & Damage</h2>
		                <div class="wound-penalty" id="woundPenalty">
		                        Wound Penalty: <strong>0</strong>
		                </div>
		        </div>

		        <div class="damage-controls">
		                <div class="damage-counter aggravated">
			                <span class="damage-label">Aggravated</span>
		                        <div class="counter-controls">
		                                <button type="button" data-damage="aggravated" data-change="-1">−</button>
		                                <strong id="aggravatedDamage">0</strong>
		                                <button type="button" data-damage="aggravated" data-change="1">+</button>
		                        </div>
		                </div>

		                <div class="damage-counter lethal">
		                        <span class="damage-label">Lethal</span>
		                        <div class="counter-controls">
		                                <button type="button" data-damage="lethal" data-change="-1">−</button>
		                                <strong id="lethalDamage">0</strong>
		                                <button type="button" data-damage="lethal" data-change="1">+</button>
		                        </div>
		                </div>

                		<div class="damage-counter bashing">
		                        <span class="damage-label">Bashing</span>
		                        <div class="counter-controls">
		                                <button type="button" data-damage="bashing" data-change="-1">−</button>
		                                <strong id="bashingDamage">0</strong>
		                                <button type="button" data-damage="bashing" data-change="1">+</button>
		                        </div>
		                </div>
		        </div>

        		<div class="health-bar" id="healthBar"></div>

		        <div class="health-summary">
		                <span id="healthSummary">0 / 0 damage</span>
		        </div>
		</section>

		<section class="card willpower-card">
			<div class="damage-heading">
				<h2>Willpower</h2>
				<div class="willpower-summary">
					<strong id="willpowerSummary">0 / 0</strong>
				</div>
			</div>

			<div class="willpower-bar" id="willpowerBar"></div>
		</section>

		<section class="grid" style="margin-top: 1rem;">
			<section class="card">
				<h2>Specialties</h2>
				<div class="pill-list" id="specialtiesList"></div>
			</section>
			<section class="card">
				<h2>Merits</h2>
				<div id="meritsList"></div>
			</section>
			<section class="card">
				<h2>Equipment</h2>
				<div class="pill-list" id="equipmentList"></div>
			</section>
		</section>

		<div class="footer-note">Edit <strong>character-data.json</strong> to change the character.</div>
	</main>
	<script src="app.js?v=<?= filemtime('app.js') ?>"></script>
</body>
</html>
