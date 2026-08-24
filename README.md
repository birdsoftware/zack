# Star Maze Dodger

Zack's reactor-core rescue run.

Star Maze Dodger is a tiny browser game where you dodge through space mazes, rescue friends, reveal puzzle maps, upgrade your pilot and ship, fight bosses, and share completed rescue maps.

## Play Locally

Open `index.html` in a browser.

## Publish On Netlify

This is a mostly static site with one Netlify Function for the shared traffic counter. No build command is needed.

Recommended Netlify settings:

- Build command: leave blank
- Publish directory: `.`

If you connect this folder as a GitHub repo, Netlify should read `netlify.toml` automatically.

## Shared Traffic Counter

The About page shows sitewide visits and game launches from `/.netlify/functions/traffic`. The function stores only aggregate totals in Netlify Blobs, so the numbers survive GitHub updates, rebuilds, and different browsers without saving personal visitor details.

## Files

- `index.html` - game page and panels
- `styles.css` - layout and interface styling
- `game.js` - game logic, drawing, audio, and controls
- `netlify.toml` - Netlify static hosting config
- `netlify/functions/traffic.js` - shared Netlify traffic counter
- `package.json` - Netlify Function dependency list

## Privacy

The About page uses a privacy-safe cartoon maker avatar and avoids sharing Zack's school, location, last name, or real photo.
