# Mechanical FEA & CAD Portfolio (Multi-page)

## Pages
- `index.html` — Home / Overview
- `fea.html` — FEA projects (filterable)
- `cad.html` — CAD projects (filterable)
- `contact.html` — Contact + skills

## Shared assets
- `styles.css`
- `site.js` (loads `projects.json`, renders cards, applies filters)
- `projects.json` (your project data)

## Run
This is a static site.

### Open directly
You can open `index.html` in a browser, but filtering may require a local server (because it uses `fetch` for `projects.json`).

### Recommended: local server
From inside `portfolio-site/`:
- Python: `python -m http.server 5500`
Then open: `http://localhost:5500/`

## How to edit projects
Edit `projects.json`.

Each project has:
- `id`
- `title`
- `category` (`FEA` or `CAD`)
- `tools` (array)
- `year`
- `summary`
- `highlights` (array)
- `link` (optional)
- `image` (optional; currently not used)

## Deployment
You can upload the whole `portfolio-site/` folder to GitHub Pages / Netlify.

