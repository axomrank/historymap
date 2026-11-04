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

The map spots are not a separate file. They are the `lat` and `lon` columns of the `place` rows in `data/source/assam_history.csv`
(193 places; 128 have a point, from the AHOM map catalogue; its separate "Rangpur" spot is the same town as Sivasagar). Each point is an approximate catalogue reference point, not a surveyed
location: it marks "about here" for a named place, region or river. `data/legacy/site.js` carries it as `geo: [lat, lon]` on each place.

Not brought over: the AHOM map renderer (`map.js`) and the event routes (`map-stories.json`).

## Boundary data (kingdoms through time)

The kingdom shapes on the map page are built from `realm` rows of `data/source/assam_history.csv`; the geometry is not stored here. Each row names its limits
(`limit_west`, `limit_east`, `limit_north`, `limit_south`) as `river:<id>` (a line in `assam.json`), `place:<id>` (a place with lat/lon), `ridge:patkai`,
`lat:<deg>` or `lon:<deg>`; `a>b` means follow `a`, then `b` below its end (the Teesta/Karatoya, then the Brahmaputra). Land comes from the present Assam
districts (less the hill districts and the Barak valley where they were not held), plus the north Bengal duars and Bangladesh for the western kingdoms.
Rivers added from the user's `Assam Rivers.kml` (2026-10-31/11-01): Teesta/Karatoya and Sisi. Identifications and the reading of the boundary texts:
`research/places/boundary-reports-2026-11-01.md` (local).

The four traditional river-bounded divisions of Kāmarūpa (Ratnapīṭha: Karatoyā to Sankosh; Kāmapīṭha: Sankosh to Bornadi; Suvarṇapīṭha: Bornadi to Bharali; Saumārapīṭha: Bharali to Dikrang) are integrated directly into the Kāmarūpa kingdom layer as an internal subdivision toggle rather than a disconnected separate layer.

### Joined Brahmaputra main stem

The interactive atlas renders Siang, Dihang and Brahmaputra as one continuous feature with regional aliases. `brahmaputra-mainstem.json` supplies the missing inter-segment reach from Natural Earth 1:10m rivers (public domain), with its source URL and approximation note. The original lower-Brahmaputra territory-mask geometry is retained. See the [continuity and chronology revision](../../research/mainstem-chronology-2026-11-04/README.md).

`jaintia-hills.json` extracts the former Jaintia Hills district (Meghalaya, Census 2011 code 299) from [DataMeet district boundaries](https://github.com/datameet/maps/tree/master/Districts/Census_2011), CC BY 4.0 / ODbL. The builder clips this modern hill-region proxy to Meghalaya and excludes all mapped Assam geometry. The adopted display omits the historical kingdom’s Jaintiapur/Sylhet plains.

`bengal-districts.json` supplies modern reference geometry for the researched Bengal conquest stages. West Bengal: DataMeet Census 2011 districts (CC BY 4.0 / ODbL). Bangladesh: BBS/OCHA districts (2020), geoBoundaries gbOpen ADM2 (CC BY 3.0 IGO). The source URLs, district names and geographic groups are stored in the file. Modern district contours are approximate display proxies, not Mughal administrative boundaries. The atlas frame now extends to 85.6°E and 20.5°N to avoid cropping Bengal.

`colonial-regions.json` extracts Meghalaya, Nagaland and Mizoram district reference polygons from DataMeet Census 2011 districts (CC BY 4.0 / ODbL; source and licence stored in the file). Its Garo/Khasi groups and Naga 1866/1875/1889 groups are qualified regional proxies, not surveyed colonial boundaries. The builder’s Matak region follows the present mapped Brahmaputra/Buri Dihing traces with a Sadiya-meridian eastern cutoff, rather than modern Tinsukia district. See the [colonial stage notes](../../research/colonial-stages-2026-11-04/README.md).

The `eastern-bengal-1905` group in `bengal-districts.json` approximates the Dacca, Chittagong and Rajshahi (except Darjeeling) divisions and Malda through modern districts. It includes Indian-side Malda/Dinajpur/Jalpaiguri proxies and excludes the Khulna/Jessore/Nadia-side modern district proxies; it is not the precise 1905 province boundary.
