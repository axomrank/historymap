# Adding a website feature

1. Identify the source records and the user-visible behavior. Search existing feature
   code and checks before introducing another representation of the same facts.
2. Put new feature-specific records in data/features/<feature>/ and document their
   schema, sources and relationship to shared polity/place IDs. Use sourceSet to reference the central data/source/sources.json registry.
3. Add a small adapter in the build if the atlas needs the records. Keep source loading,
   historical transformation and SVG/UI rendering separate. Validate new required
   fields and references before geometry compilation.
4. Put a cohesive controller in app/features/<feature>/. Pass data and callbacks
   explicitly; document exports and any owned DOM elements. Load browser scripts in
   dependency order in the HTML. Common year/selection/playback state belongs to
   app/explore.js; avoid creating independent copies of the current year or selection.
5. Keep colours and presentation rules separate from historical evidence. Use existing
   shared appearance and journey helpers where applicable. Put styling in CSS.
6. Add meaningful regression assertions in tools/check-<feature>.js for new dated
   behavior; npm run check discovers it automatically. Run npm run verify.
7. Preview keyboard controls, playback, URL restoration, panel interaction and the
   relevant year boundaries. Check the standalone journey page if shared code changed.
8. Update data/README.md and the root README with the editing location and command.

For simple text/data edits, use the existing module and checks. New directories are
boundaries for cohesive features, not a requirement to split every small function.
