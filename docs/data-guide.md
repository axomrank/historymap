# Editing data

Start at data/README.md to find the authoritative input. Do not edit the generated
atlas or copy an existing fact into a second file merely to make it appear on screen.

## Core fields

- polities: id is a stable reference; name/name_as/short are presentation text;
  lane controls timeline placement; color is a six-digit hex colour (legacy whitespace
  is normalized); capitals links place IDs and inclusive year intervals.
- territories: id identifies a stage; polity references a polity ID; start/end are
  inclusive integer years; z resolves overlapping shapes (then row order breaks ties).
  shape uses the expression grammar described in README.md and tools/build.js.
  style is core/reach/legend/context/protected; confidence is high/medium/low.
  note preserves interpretation and uncertainty; authority links a political affiliation.
- events: year is an integer; polity optionally links a polity; title/text describe it.
- extra-places: id, name, lat and lon use decimal degrees; note explains identification.
- assam_history: mixed record types. The builder resolves realm/place IDs and people
  from this catalogue. Preserve type and ID relationships when editing it.

Exact required fields, enums and numeric/reference checks are machine-readable in
../data/schemas/catalogue.json. CSV text containing commas or line breaks must be quoted;
quotes inside quoted fields are doubled.

## Common edits

Add an event to data/source/events.csv. For a border change, edit or add an inclusive
stage in data/source/territories.csv; check its polity and every shape reference.
For a journey or colonial stage, edit the relevant feature JSON and preserve its
existing source and uncertainty fields. Run npm run verify, then preview the year
before, the transition year and the year after.

## Evidence

Keep documented dates separate from approximate display dates. Keep a campaign's
reach separate from core possession. Preserve competing identifications and unlocated
places rather than inventing coordinates. Record new evidence under research/ and link
it from the applicable dataset's existing note/source fields. Bibliographic records live in data/source/sources.json, namespaced by feature.
Feature JSON selects a sourceSet; local source IDs must resolve within it. Preserve
IDs when updating a title, URL or verification note. See data/migration.json for old paths.
