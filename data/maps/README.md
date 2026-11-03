# Map shapes

Copied from the AHOM project (`assets/maps/`) on 2026-10-26. These are **modern reference geography**, not historical borders.
Every coordinate is `[latitude, longitude]`.

| File | What it holds | Source and licence |
|---|---|---|
| `assam.json` | 33 district polygons, 41 river paths (the Sisi and the Teesta/Karatoya was added 2026-10-31 from the user's own "Assam Rivers.kml") (Brahmaputra, Dihing, Dikhow and others), and an approximate Patkai ridge | Local KMZ `Dist + Rivers (simplified).kmz`. The licence of that file is not recorded; check it before wider reuse. |
| `boundaries.json` | Outline rings for Assam (dissolved from the district polygons) and India | India: [DataMeet Community Maps, india-soi.geojson](https://github.com/datameet/maps/blob/master/Country/india-soi.geojson), from Survey of India / Census 2011 geometry, simplified. **CC BY-SA 2.5 / ODbL: keep the attribution.** |
| `neighbours.json` | Outlines of Bangladesh, Bhutan, Myanmar, China and Nepal near Assam, plus the north-east piece of India (so India and Bangladesh come from one source), cut from `world.json` for the map | Natural Earth, public domain. |
| `world.json` | 258 country and territory outlines | [Natural Earth 1:10m admin-0 countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/), public domain, simplified at 0.012 degrees. |

## Spots

The map spots are not a separate file. They are the `lat` and `lon` columns of the `place` rows in `data/assam_history.csv`
(193 places; 128 have a point, from the AHOM map catalogue; its separate "Rangpur" spot is the same town as Sivasagar). Each point is an approximate catalogue reference point, not a surveyed
location: it marks "about here" for a named place, region or river. `data/site.js` carries it as `geo: [lat, lon]` on each place.

Not brought over: the AHOM map renderer (`map.js`) and the event routes (`map-stories.json`).

## Boundary data (kingdoms through time)

The kingdom shapes on the map page are built from `realm` rows of `data/assam_history.csv`; the geometry is not stored here. Each row names its limits
(`limit_west`, `limit_east`, `limit_north`, `limit_south`) as `river:<id>` (a line in `assam.json`), `place:<id>` (a place with lat/lon), `ridge:patkai`,
`lat:<deg>` or `lon:<deg>`; `a>b` means follow `a`, then `b` below its end (the Teesta/Karatoya, then the Brahmaputra). Land comes from the present Assam
districts (less the hill districts and the Barak valley where they were not held), plus the north Bengal duars and Bangladesh for the western kingdoms.
Rivers added from the user's `Assam Rivers.kml` (2026-10-31/11-01): Teesta/Karatoya and Sisi. Identifications and the reading of the boundary texts:
`research/places/boundary-reports-2026-11-01.md` (local). Sacred-geography rows (`kamarupa-kalika`, `kamarupa-yogini`) describe texts, not political frontiers.

The map also has a "Pithas" layer (off by default) with a scheme picker: realm rows with ids `pitha-<source>-<name>` and a source in `collection` describe the
four sacred sectors of Kamarupa as each source gives them. They have no years, so the year slider ignores them. See `research/places/pithas-2026-11-01.md`.
