# Arzware / Edition 002

A complete visual and interaction redesign of the [original Arzware website](https://github.com/arzware/arzware-portfolio), preserving its brand, color palette, business positioning, booking destination and contact details.

**Live:** https://admatieh.github.io/arzware-portfolio-v2/

## Run locally

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. JavaScript and CSS changes rebuild automatically. Restart the dev server after editing `index.html` or anything in `public/`.

```sh
npm run check
npm run build
```

The build generates `docs/`. Commit the updated source **and** `docs/` when changing the site. GitHub Pages publishes from **main → /docs**. `.nojekyll` bypasses Jekyll processing. All asset paths are relative so the site works under a repository path.

## Structure

```text
index.html             Semantic content, navigation and SEO
src/app.js             Tabs, menu, reveal animations and motion preference
src/scene.js           Custom Three.js sculpture and rendering lifecycle
src/styles.css         Design tokens, typography, layouts and motion
public/assets/         Original logo, self-hosted fonts and social preview
public/licenses/       Font and Three.js license notices
scripts/build.mjs      esbuild compiler and local preview
docs/                  Generated GitHub Pages site
```

## Design

- Charcoal `#0e0e0e`, ivory `#eee9e1`, sand `#c4a882`, copper `#d69a68` and restrained blue `#7eb8e0`.
- Space Grotesk, Cormorant Garamond and IBM Plex Mono; fonts are served from the site.
- A bespoke bronze sculpture of three intersecting open arcs, detailed rims and an independent central core. Procedurally built geometry; no downloaded model or video.
- Alternating charcoal and ivory chapters, editorial typography and interactive system illustrations.
- Solution illustrations describe possible engagements; they are not presented as completed client projects or measured client results.

## Accessibility and rendering

- Semantic landmarks, one main heading, skip navigation and visible keyboard focus.
- Accessible solution tabs with arrow keys, Home/End and roving tabindex.
- Mobile navigation supports Escape, focus containment and focus restoration.
- Respects `prefers-reduced-motion`; the footer motion control stores an explicit preference.
- A static SVG sculpture remains when WebGL is unavailable. Core content and contact links work without JavaScript.
- The 3D module loads separately from the small interaction entry point. Rendering is capped at 30 FPS, pixel density is limited, and animation pauses offscreen or when the page is hidden.
- WebGL context loss switches to the static fallback. Resources are disposed on exit.
- No analytics, trackers, backend, contact form or secret keys. Booking opens the original Cal.com link; email opens the visitor’s email client.

## Content and updates

Edit copy and links in `index.html`, palette/layout tokens in `src/styles.css`, and sculpture geometry in `src/scene.js`. Generate the site again with `npm run build` before pushing.

The canonical URL, Open Graph metadata, sitemap and social image identify this separate v2 preview. If moving to the main Arzware domain, update those URLs deliberately before changing domain settings.

## Verification

Browser checks cover desktop and mobile layouts from 320px to 1920px, all solution panels, keyboard navigation, mobile menu behavior, motion preferences, reduced-motion mode, WebGL fallback, and essential content without JavaScript. Automated WCAG checks are run with axe on desktop and mobile; these support, rather than replace, manual review.

The original Arzware brand assets and content are retained for this authorized redesign. Three.js and font license notices are in `public/licenses/` and included in the published site.
