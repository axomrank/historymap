# Dataset map

| Location | Role | Editing rule |
|---|---|---|
| source/polities.csv | Polity identities, colours, capitals and narrative | Stable IDs |
| source/territories.csv | Dated territory stages and shape expressions | Inclusive years; preserve uncertainty |
| source/events.csv | Timeline events | Optional polity reference |
| source/extra-places.csv | Additional named coordinates | Decimal lat/lon |
| source/assam_history.csv | Earlier mixed catalogue; realms, places and people are live inputs | Preserve record types and IDs |
| source/sources.json | Shared bibliographic registry | Keep namespaced citation IDs stable |
| features/colonial/ | Colonial stages and statehood | colonial-stages.json is authoritative |
| features/growth/ | Medieval stages, routes and markers | medieval-growth.json; CSV is a research export |
| features/kamarupa/ | Post-Pala evidence and adopted Ratnapitha phases | JSON and phase CSV have distinct roles |
| features/sankardeva/ | Journey anchors and supplied pins | JSON is authoritative; CSV is a supplied pin export |
| maps/ | Reference geography and pilgrimage outlines | See maps/README.md for provenance |
| research/ | Supporting catalogues, audits and earlier reach studies | Evidence, not automatically adopted website facts |
| legacy/ | Earlier browser datasets and exports | Retained for reference; not live website inputs |
| schemas/ | Machine-readable core and feature table contracts | Update with structural changes |
| generated/atlas.js | Browser-ready window.ATLAS output | Rebuild only |
| atlas-config.json | Year range, era labels, dataVersion | Keep eras continuous; update dataVersion when releasing data changes |
| migration.json | Previous paths mapped to current paths | Lookup for older notes/bookmarks |

Use `npm run verify` after editing. Source records flow through tools/build/inputs.js;
feature-local `sourceSet` names resolve against source/sources.json. The compiled atlas
embeds the matching sources, preserving existing citation IDs and browser interfaces.
The standalone journey page resolves the same registry through app/core/datasets.js.

Some research and legacy files contain historical generation notes for tools no longer
present. They are preserved archives, not alternative editing instructions. Matching
CSV/JSON/JS filenames do not imply automatic synchronization. Use the authority column
above and search consumers before changing a dataset.

Generated output is committed so static hosting needs no build server. Old file URLs
have moved; migration.json records their replacements. Application share links keep
their year, polity, region and colour-mode compatibility.
