# Assam Through Time

One page to explore Assam's history year by year, from 350 CE to today: how each kingdom
began, grew to its greatest extent and gave way to the next.

Open `index.html` through any static server (the map data is a plain script, so double-clicking
the file also works in most browsers):

```bash
python3 -m http.server 8000
```

## Using it

- **Play** runs through every year; it slows down whenever the map changes or something happens.
- **◀ change / change ▶** jump straight to the previous or next year in which a border moved.
- The **bands** at the bottom are the kingdoms. Each lane holds a kingdom and the ones that
  followed it, and a band's thickness is the land it held that year, so you can see each one
  rise, peak and fade. Click or drag on them to move in time; click a name to follow that kingdom.
- Click a kingdom on the map for its story: how it began, its greatest extent, rulers, capital and
  how it ended. Hatched shapes are campaign reach, dashed outlines are uncertain borders.
- Keyboard: ← → (one year, with Shift ten), Page Up / Page Down (previous / next change), Space (play).
- The URL keeps the year and the selected kingdom (`#y=1671&k=ahom`), so a view can be shared.

## Data

Edit the CSV files and rebuild with `node tools/build.js`, which writes `data/atlas.js`
(a map for every year 350–2026; identical years share one map).

| File | What it holds |
|---|---|
| `data/polities.csv` | Kingdoms and states: name (English and Assamese), colour, timeline lane, capitals by year, how each began and ended |
| `data/territories.csv` | The land each one held, period by period. `shape` is built from `realm:<id>` (a boundary row of `assam_history.csv`), `limits:W\|E\|N\|S` (rivers, places, lat/lon lines), `land:<districts or states>` or `poly:lat lon;…`, joined by ` + `. Where two overlap, the higher `z` (then the later row) wins. `confidence` and `style` (`core`, `reach`, `legend`) set how it is drawn |
| `data/events.csv` | Turning points from 350 to 2024 |
| `data/extra-places.csv` | Places not in `assam_history.csv` (Shillong, Dispur, Dhaka) |
| `data/assam_history.csv` | The earlier research catalogue: periods, people, places, events and realm boundaries. Rulers and places are read from it |
| `data/maps/` | Reference geography (see `data/maps/README.md`); `northeast.json` (north-east states and Sylhet division) is made by `tools/make_northeast.py` |
| other `data/` files | Kamarupa inscription catalogue and reach studies, kept from the earlier atlas |

Borders before the British period are reconstructions from the boundary texts noted in each row;
they show roughly where a kingdom held power, not surveyed frontiers.

The [Kamarupa research audit (4 November 2026)](research/kamarupa-2026-11-04/README.md)
includes a [39-event, source-linked CSV](data/kamarupa-events-researched.csv), an audit of
the supplied teaching charts, a historical gazetteer, and proposed map corrections.
These research records preserve uncertain dates and distinguish campaigns, grants,
and territorial control. The adopted [Paundravardhana map phases](data/paundravardhana-map-phases.csv)
now drive a separate region between the Sankosh and the project's Teesta/Karatoya line.
This ancient pitha display ends before 1100. The [post-Pala research revision](research/kamarupa-after-palas-2026-11-04/README.md)
provides a separate 1100–1270 evidence panel, source-linked rulers and events, and
inscription/capital markers without pitha divisions or red river boundaries.
The side panel provides previous/next phase controls, approximate dates and evidence qualifications.
This user-adopted map interpretation uses Ratnapitha as Paundravardhana; it does not
redefine the changing historical province in the research catalogue. Northern and
southern cutoffs at 27°N and 25.46°N are schematic. Playback anchors and carried-forward
possession are editorial assumptions. Unknown intervals use neutral shading.

After rebuilding, run `node tools/check-ratna.js` to verify the regional transitions.

## British expansion, Matak and Northeast states

Click **British expansion & states** to see regional acquisition/status dates on the map. Choose Upper Assam/Matak, Cachar, Khasi–Jaintia–Garo, Naga Hills, Lushai Hills, Manipur, Tripura, frontier tracts, or provincial/state changes. Each region has source-linked stages, previous/next controls and map markers. URLs preserve the region, for example `#y=1833&c=matak`.

The [colonial stage revision](research/colonial-stages-2026-11-04/README.md) separates Matak’s 1805 autonomy, 1833 exclusion from Purandar’s restoration, 1839 direct Company management and the 1842 incorporation proclamation. It adds staged hill expansion, princely Manipur, and 1963/1970/1972/1987 status changes. Dotted regions are qualified geographic contexts; dashed princely outlines are distinct from direct British administration. Annual maps show the position after the named year’s transition. Source-linked phases are in `data/colonial-stages.json`; run `node tools/check-colonial.js` after rebuilding.

The [Manipur/Tripura affiliation correction](research/colonial-stages-2026-11-04/manipur-tripura-affiliation-correction.md) makes the political relationship visible as well as the local identity: British pink hatching for protection/paramountcy, orange hatching for accession to India in 1947, and solid Indian orange following the transfer of administration on 15 October 1949. Part C status from 1950, Union Territory status and 1972 statehood are separate dated stages. Both remain selectable as regions without appearing outside India in modern views.

## Sources for the shapes

- North-east Indian states: [DataMeet Community Maps](https://github.com/datameet/maps), States/Admin2 (CC BY 4.0 / ODbL).
- Sylhet division: [geoBoundaries](https://www.geoboundaries.org/) gbOpen BGD ADM1 (CC BY 4.0).
- Countries and rivers: see `data/maps/README.md` (Natural Earth, DataMeet, the project's KMZ files).

## Sankardeva’s journeys

Click **Sankardeva’s path** in the main atlas to play from 1449, with a growing red trail and a moving position marker on the shared year controls. The **All pilgrimage locations** view uses the same route model and automatically shows India during pilgrimage windows. Scrub either timeline forward or backward to reveal the route for that year.

`data/sankardeva-routes.json` holds the supplied qualified pins and explicit animation anchors; the CSV exports the pins. Annual pilgrimage order/pacing and connections between approximate migration dates are illustrative, not documented itineraries. The two birthplace candidates remain separate; unlocated sites remain unpinned. Supplied corrections include Singari, Mahendra Kandali’s Tol, Kapalabari, Kumarkuchi, and the Badrikashram association with the first Borgeet.

After editing the JSON, rebuild with `node tools/build.js` and run `node tools/check-sankardeva.js`. Both pages share `app/sankardeva-journey.js`; the main atlas embeds the same data in `data/atlas.js`.

## River-frontier revision

The [4 November river-frontier revision](research/river-frontiers-2026-11-04/README.md) replaces early Ahom/Chutia and Ahom/Dimasa sketch edges with shared Dehing and Dikhou geometry, replaces Bhuyan circles with separate river-bounded sectors, and applies the requested six-district Dimasa maximum envelope. Its historical and river-identification qualifications are recorded in the notes and map cards. Run `node tools/check-frontiers.js` after rebuilding.

## Koch formation and expansion

The [Koch research revision](research/koch-growth-2026-11-04/README.md) starts with a small Chikna foothill region and provides nine formation, enlargement, setback and treaty stages from 1515–1580. Temporary campaign reach is hatched separately from core territory. Early intermediate dates and outlines are explicitly approximate. The map uses small “Bhuyan Confedaracy” labels for the river sectors. Run `node tools/check-koch.js` after rebuilding.

The [main-stem and chronology revision](research/mainstem-chronology-2026-11-04/README.md) joins Siang–Dihang–Brahmaputra into one river, removes the premature 1523 Kachari retreat, separates 1526–1531 campaigning from the approximate 1532 border stage, and marks the Koch presence at Majuli and Garhgaon in 1563. Run `node tools/check-mainstem-chronology.js` after rebuilding.

The [Subansiri/Jaintia correction](research/subansiri-jaintia-2026-11-04/README.md) uses Subansiri as the shared north-bank Koch–Ahom frontier for the 1563–1580 treaty phase and confines the adopted Jaintia hill-region display to eastern Meghalaya, excluding Assam. Run `node tools/check-treaty-jaintia.js` after rebuilding.

## Bengal and the Mughal conquest of Koch Hajo

The [researched Bengal/Koch Hajo revision](research/bengal-hajo-2026-11-04/README.md) removes Koch Behar from the displayed states, confines Koch Hajo’s mapped core to Assam, adds the 1576 → 1611–1612 → 1666 Bengal conquest sequence, and separates the 1612–1613 invasion/annexation from later resistance and reversal. Click **Bengal & Koch Hajo** for the expanded map. The notes distinguish modern geographic proxies from surveyed historical borders and exclude hill/princely regions from blanket annexation claims. Run `node tools/check-bengal-hajo.js` after rebuilding.

## Ahom western frontiers and Guwahati

The [bank-specific frontier research](research/ahom-bank-frontiers-2026-11-04/README.md) separates the 1614–1616 political/tributary reach toward Barnadi from direct control, temporary Pandu/Hajo campaigns, the two-bank 1639 treaty, and the Guwahati capture/recovery sequence through 1682. Ahom cards now show north- and south-bank summaries and qualified dates. Run `node tools/check-ahom-frontiers.js` after rebuilding.
