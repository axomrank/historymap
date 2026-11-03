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

## Sources for the shapes

- North-east Indian states: [DataMeet Community Maps](https://github.com/datameet/maps), States/Admin2 (CC BY 4.0 / ODbL).
- Sylhet division: [geoBoundaries](https://www.geoboundaries.org/) gbOpen BGD ADM1 (CC BY 4.0).
- Countries and rivers: see `data/maps/README.md` (Natural Earth, DataMeet, the project's KMZ files).
