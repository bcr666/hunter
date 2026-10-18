# Hunter: The Vigil — Mobile Character Sheet

A personal, phone-friendly character sheet for my Hunter: The Vigil game. Built so I can reference my character and play at the table without bringing a paper sheet or a laptop.

## About the project

This is mainly a personal project with two goals:

- Make my character sheet easy to use on a phone during a game.
- Get hands-on experience with GitHub, Jenkins, and automated deployment.

The site is hosted on my Raspberry Pi. Previously, updating it meant connecting over SSH and editing files directly with `sudo nano`. Keeping the source in GitHub and setting up Jenkins gives me a more convenient way to make and deploy changes, along with a history of those changes.

## Deployment

The deployment workflow uses a GitHub webhook to notify Jenkins when changes are pushed. Jenkins then handles deploying the site to the Raspberry Pi.

The intended workflow is:

1. Edit the site files.
2. Commit and push the changes to GitHub.
3. Let Jenkins deploy the updated site.

## Scope

This repository is public, but the site is tailored to my own character and game. It is a learning project rather than a general-purpose character sheet application.

## Acknowledgments

Hunter: The Vigil belongs to its respective rights holders. This is an unofficial personal fan project and is not affiliated with or endorsed by the game's publisher.

## Mage sheet

The sheet supports Rory’s transition to Mage: The Awakening 1st edition.
His custom Path, Order, and other Mage choices are still being developed. Existing Hunter traits,
equipment, notes, and XP are preserved. `character.mage` holds Shadow Name, Path,
Order, Legacy, Cabal, Gnosis, Wisdom, Mana, and all ten Arcana. Undecided ratings
are `null` and undecided text is empty. Zero means an assigned rating of zero.
Set Wisdom explicitly; the old Morality value is retained in the data for reference.
Mana capacity is explicit rather than calculated so the sheet does not assume an edition.
Once `mana.max` is assigned, Spend/Restore controls track current Mana in this browser,
starting from `mana.current` (or full if omitted). As with Health and Willpower,
local tracker changes do not modify the JSON file.

### Spell catalog

`spells.json` contains `{ "spells": [] }`. Add entries using stable, unique IDs:

```json
{
  "id": "example-spell",
  "name": "Example spell (replace with your spell)",
  "arcana": { "Forces": 2, "Prime": 1 },
  "practice": "",
  "action": "",
  "duration": "",
  "range": "",
  "cost": "",
  "primaryFactor": "",
  "dicePool": "",
  "withstand": "",
  "description": "Your spell summary or text goes here.",
  "notes": "Optional casting notes.",
  "source": "Book and page reference"
}
```

This is a schema example, not a game spell. Add `"example-spell"` to
`character.spells` in `character-data.json` to include it in Rory’s list.
IDs stay fixed when a display name changes. Multi-Arcanum spells appear under
each of their Arcana filters. The Spells tab defaults to Rory’s list and can also
show the whole catalog; search and Arcana filters work together. Missing referenced
IDs are reported on the page. No spells or Mage ratings have been invented for Rory.
The catalog starts empty pending his spell choices.

Serve the repository through PHP as before; JSON fetches require an HTTP server.
Include `spells.html`, `spells.js`, and `spells.json` in deployments.
