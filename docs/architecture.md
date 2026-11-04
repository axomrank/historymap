# Architecture

The site uses plain browser scripts and static hosting. Builds/checks need Node.js 18+
and preview uses Python 3. No npm installation, framework or database is required.

## Data flow

Editable data/source + data/features + data/maps
→ tools/build.js → data/generated/atlas.js (window.ATLAS)
→ browser factories → app/explore.js controller → map, timeline and details.

## Build modules

| Module | Responsibility |
|---|---|
| tools/build/inputs.js | Read authoritative records; hydrate citations and index places/realms |
| tools/build/geometry.js | Projection, shape grammar, clipping, area and label points |
| tools/build/compile.js | Territory priority and deduplicated per-year maps |
| tools/build/polities.js | Rulers, capital intervals and polity lifetimes |
| tools/build/base-map.js | Background countries, modern boundaries, rivers and towns |
| tools/build.js | Compose modules and write the browser payload |
| tools/lib/csv.js | Shared parser; strict mode for modern table inputs |
| tools/validate/ | Core and feature integrity checks before geometry compilation |

## Website modules

| Module | Responsibility |
|---|---|
| app/explore.js | Own current year, selection, playback and feature actions; wire dependencies |
| app/core/model.js | Area lookup, polity peaks, era lookup and change-year index |
| app/core/navigation.js | URL parsing/serialization and year bounds, including legacy polity links |
| app/core/datasets.js | Shared source-registry hydration for build and standalone page |
| app/map/renderer.js | Initialize SVG layers, reuse shapes, render labels and feature markers |
| app/map/interaction.js | Tooltips, pointer/keyboard interaction, pan/zoom and region focus |
| app/map-appearance.js | State colours and political affiliations |
| app/timeline/renderer.js | Territory bands, era labels, names and selected-year cursor |
| app/ui/panel.js | Polity summaries, detail cards and nearby events |
| app/features/*/cards.js | Colonial, medieval-growth and Kamarupa evidence cards |
| app/sankardeva-journey.js | Deterministic journey interpolation shared by both pages |
| app/sankardeva-page.js | Standalone journey page controller |
| app/*.css | Main and standalone presentation |

Factories are loaded in dependency order in index.html. Each accepts one object of
explicit dependencies and returns a small API. `getState()` reads the controller's
current year/selection; rendering modules never retain a stale snapshot across renders.
Map interaction owns its viewport and exposes getViewport(); the renderer reads it.
Callbacks handle controller actions without duplicating shared state. Factories are
plain scripts so the site retains its existing static-server deployment contract.

## Verification and deployment

`npm run verify` validates inputs, rebuilds the atlas, then runs all tools/check-*.js.
`npm run preview` serves http://localhost:8000. Preview affected years and both pages
when shared code changes. CI runs the same verification and rejects stale committed
atlas output. Builds are deterministic: `built` comes from config.dataVersion, not the
machine's clock. Update that date when releasing historical data changes.

Validation checks structural integrity, not historical truth. Geometry helpers retain
existing clipping fallbacks; inspect changed frontiers and their evidence separately.
Research evidence, adopted map interpretations and illustrative pacing remain distinct.
