# Adventuress Ty website

Static site built from the approved design canvas.

- `src/build.mjs` renders every page into `public/` (run `node src/build.mjs`).
- `src/styles.css` and `src/main.js` are copied into `public/assets/`.
- `data/*.json` holds each trip's content (prices, itinerary, inclusions), taken from the design.
- Deploy: `cd public && npx vercel deploy` (static, no build step).
