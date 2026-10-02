# Arzware — Good things take root

A quiet, illustrated website for Arzware. Five static pages pair poetic editorial typography with original antique-style architectural and botanical artwork, preserving the brand palette and business purpose.

**Live:** https://admatieh.github.io/arzware-portfolio-v2/

## Run and build

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. JS/CSS changes rebuild automatically. Restart after changing the page templates or public assets.

```sh
npm run check
npm run build
```

Commit source and regenerated `docs/` together. GitHub Pages publishes **main → /docs**. CI verifies that the compiled files match the source.

## Pages

| Route | Purpose |
|---|---|
| `/` | The story: clarity, useful change, and human possibility |
| `/work/` | Websites, customer journeys, connected operations, and quiet automation |
| `/way/` | Listening, understanding, making with care, and improving |
| `/people/` | Human judgment and supervised opportunities for Lebanese youth |
| `/begin/` | Booking a review, email, and collaboration invitations |

Every route is an actual HTML file, so direct links and refreshes work on GitHub Pages without a client router.

## Structure

```text
src/pages.mjs          Content and shared semantic page templates
src/app.js             Navigation, gentle drift, reveals and motion preferences
src/styles.css         Palette, type, layouts and quiet motion
scripts/build.mjs      Generates all HTML, sitemap and bundled JS/CSS
public/assets/art/     Original transparent artwork, encoded as WebP
public/assets/fonts/   Self-hosted Instrument Serif and Fraunces
public/licenses/       Font license notices
docs/                  Generated GitHub Pages site
```

## Visual direction

- Warm ivory leads; charcoal, sand and copper carry the original palette.
- Instrument Serif headings and italic phrases, with Fraunces reading text.
- Original artwork: a cedar growing through a stone arch, an antique navigational instrument, and hands carrying a young tree. These are original compositions, not copied reference-site assets.
- Broad editorial spacing, fine rules, illustrated plates and short, human language.
- Restrained artifact floating and pointer drift, gentle reveals, and native page transitions where supported.

## Behavior and accessibility

- Semantic HTML, one main heading per page, skip link, visible focus and meaningful image descriptions.
- Mobile navigation with Escape, focus containment and focus restoration.
- Native disclosure elements work without JavaScript.
- Respects OS reduced-motion settings. The footer motion preference persists across pages.
- Artwork animation pauses offscreen and when the page is hidden. Touch scrolling stays native.
- Fonts, images and scripts are self-hosted. No WebGL, video, analytics, trackers, backend or secrets.
- Existing booking destination: https://cal.com/arzware. Existing contact: hello@arzware.net.

## Updating the site

Edit content in `src/pages.mjs`, visual tokens and layout in `src/styles.css`, and interactions in `src/app.js`. Run the build and commit the updated `docs/`. Update canonical URLs and `siteUrl` before deliberately moving the site to another domain.

Font licenses are included in `public/licenses/`. The original Arzware brand asset is retained for this authorized redesign.
