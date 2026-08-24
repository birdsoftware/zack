# Star Maze Dodger

Zack's reactor-core rescue run.

Star Maze Dodger is a tiny browser game where you dodge through space mazes, rescue friends, reveal puzzle maps, upgrade your pilot and ship, fight bosses, play a daily mission, and share victory cards.

## Play Locally

Open `index.html` in a browser.

## Publish On Netlify

This is a mostly static site with Netlify Functions for the shared traffic counter and monthly daily-mission leaderboard. No build command is needed.

Recommended Netlify settings:

- Build command: leave blank
- Publish directory: `.`

If you connect this folder as a GitHub repo, Netlify should read `netlify.toml` automatically.

## Shared Traffic Counter

The About page shows sitewide visits and game launches from `/.netlify/functions/traffic`. The function stores only aggregate totals in Netlify Blobs, so the numbers survive GitHub updates, rebuilds, and different browsers without saving personal visitor details.

## Daily Mission And Leaderboard

The Daily panel creates one planet challenge per day. Completed daily runs post to `/.netlify/functions/leaderboard`, which keeps top scores per month with silly anonymous pilot names only.

## Install As App

The site includes `manifest.webmanifest`, `service-worker.js`, and `icons/icon.svg` so players can add it to a phone home screen like an app.

## Files

- `index.html` - game page and panels
- `styles.css` - layout and interface styling
- `game.js` - game logic, drawing, audio, and controls
- `manifest.webmanifest` - home-screen app metadata
- `service-worker.js` - app shell cache for install support
- `netlify.toml` - Netlify static hosting config
- `netlify/functions/traffic.mjs` - shared Netlify traffic counter
- `netlify/functions/leaderboard.mjs` - monthly anonymous daily leaderboard
- `package.json` - Netlify Function dependency list

## Privacy

The About page uses a privacy-safe cartoon maker avatar and avoids sharing Zack's school, location, last name, or real photo.
