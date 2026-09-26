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