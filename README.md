# Arzware — version 2.2

The original Arzware particle hero, with a redesigned business story, interactive starting points, service details, and solution scenarios below it.

- Website: https://admatieh.github.io/arzware-portfolio-v2/
- Alternative map artwork: https://admatieh.github.io/arzware-portfolio-v2/?art=playa
- Original source: https://github.com/arzware/arzware-portfolio

## Design

The home page retains the original four particle forms, shaders, morph timing, Playfair Display headings, Space Grotesk body text, hero layout, logo, and charcoal / ivory / sand palette. Small adjustments improve narrow layouts and text contrast. The alternate artwork interprets Black Rock City's concentric and radial streets with the same point renderer.

Below the hero, the page adds a business friction selector, three service stories with native disclosures, a four-step process, accessible scenario tabs, youth opportunities, an ecosystem illustration, practical FAQs, and a direct invitation to begin. Scenarios are illustrative possibilities; they do not claim completed client work or performance results.

The five routes are `/`, `/work/`, `/way/`, `/people/`, and `/begin/`. Booking and email links retain the original `cal.com/arzware` and `hello@arzware.net` destinations.

## Run

Use Node.js 20 or newer:

```sh
npm ci
npm run check
npm run build
npm run dev
```

The preview opens at http://127.0.0.1:4173/. JS and CSS rebuild automatically. Restart the preview after changing the HTML templates or public assets.

## Structure

```text
src/original-hero.html  Original hero markup
src/hero.css           Preserved original styling
src/hero-scene.js      Original Three.js geometry, shaders, and lifecycle
src/playa-shape.js     Optional radial city sculpture
src/pages.mjs          Five static page templates and original SVG diagrams
src/app.js             Motion preferences, navigation, disclosures, and tabs
src/styles.css         Supporting sections, responsiveness, and font declarations
scripts/build.mjs      Static build, bundled assets, and sitemap
public/                Self-hosted fonts, logo, social preview, and licenses
docs/                  Committed GitHub Pages output
```

## Motion and resilience

Three.js is pinned to `0.160.0`, matching the original implementation. The scene loads as a separate local bundle. The renderer retains 16,000 particles on desktop and 6,000 on a mobile startup, with pixel ratio capped at 1.5 and 1.0 respectively. Animation and morph timers stop when the hero is outside the viewport or the page is hidden. The blur follows pointer movement only while needed.

The site respects the operating system's reduced-motion preference and offers a persistent motion toggle. Paused motion keeps the hero text visible. Static original SVG artwork remains available if WebGL cannot start or loses its context. Content, contact links, and native disclosures remain available without JavaScript; all scenario panels are readable in that case.

## Publish

GitHub Pages publishes `main:/docs`. Build and commit source and `docs/` together. The validation workflow runs `npm ci`, syntax checks, and the build, then verifies that the published output matches the source. No deployment secrets, backend, or hosted 3D embed is required.

## Artwork and fonts

The original hero is reused from source commit `4c5b23515b003e3b605a9ce574a38cc6aa7454bf`. New diagrams and the optional map geometry are authored for this revision. The map is a sculptural interpretation, not a navigation map. Reference: https://burningman.org/black-rock-city/black-rock-city-2026/2026-black-rock-city-plan/

Fonts are self-hosted with their SIL Open Font License files in `public/licenses/`. Three.js uses its MIT license; the build includes its linked license notice.
