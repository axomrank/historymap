# Working on Assam Through Time

Read README.md and docs/architecture.md first. For data changes read docs/data-guide.md;
for website work read docs/adding-a-feature.md.

- Editable core records live in data/source/. Feature inputs live in data/features/;
  consult data/README.md before editing. Reference geography lives in data/maps/.
- Never manually edit data/generated/atlas.js. Regenerate with npm run build.
- Keep stable record IDs. Check references before deleting or renaming any ID.
- Preserve sources, uncertainty, approximate dates and editorial qualifications.
  A map proxy, campaign route or animation anchor is not proof of territorial control.
- Historical inputs use inclusive start/end years. Coordinate conventions vary:
  catalogue/place fields are lat/lon, geography helper arrays often [lat, lon],
  polygon-clipping uses [lon, lat]. Read the adapter before changing geometry.
- This is a static site with plain browser scripts, no framework or runtime dependencies.
  Keep index.html and sankardeva.html working through a static server.
- app/explore.js owns shared state and wiring; map/timeline/panel/features are factories.
  Keep historical facts out of new rendering code and document any new public interface.
- Run npm run verify after dataset or build changes; after UI changes also preview
  affected years and both pages when shared code changes.
- Existing tools/check-*.js encode historical regression expectations. Do not weaken
  an expectation just to pass a check; explain and document evidence for a correction.
- Do not modify unrelated local output or research work. Add new findings under research/.
