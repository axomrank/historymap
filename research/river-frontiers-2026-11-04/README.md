# River frontiers and chiefdom sectors — 4 November 2026

This revision implements the user's four requested map conventions. Modern river courses and district shapes are reference geometry; these are approximate historical reconstructions.

- The early Charaideo/Ahom core follows the mapped Dikhou on its western edge and Dehing on its northern edge. The 1253 stage retains smaller approximate eastern/southern limits; the consolidated core uses the full south-bank corridor. Early migration symbols remain settlement symbols. The separate Habung and 1513–1522 wartime layers remain dated campaign contexts.
- The reconstructed Chutia domain from 1442 uses a separate north-bank sector and a Dehing–Brahmaputra south-bank sector. The Dehing frontier shares the same stored river vertices as the Ahom edge. Earlier Chutia inscription/centre symbols do not claim a continuous frontier.
- The early Dimasa realm ends on the same Dikhou trace. Both Karbi Anglong districts and Dima Hasao are included, and the user's maximum-extent convention includes all three Barak districts. This broad combined envelope is used in the existing 1275–1522 phase; it is **not independently verified as simultaneous possession throughout that interval**, or a conquest in 1275. The 1745–1831 hill–Barak phase also includes the six requested districts. The intervening Dhansiri retreat, Maibong phase, Koch Khaspur phase and Tularam hill state remain separately dated.
- Bhuyan circles are replaced with separate river-sector rows: Bharali–Borgang, Buroi–Dikrong, the atlas's Barnadi-side trace–north Dhansiri, and Kolong–Brahmaputra. The approximate existing chronology adds/removes sectors in stages. The c.1505 western recovery uses a Manas–Beki sector. Adjacent sectors remain separate features with their own outlines. They represent an adopted regional interpretation, not precisely surveyed estates of named chiefs or a unified Bhuyan state.

## Geometry corrections

The north-limit fallback previously closed in the wrong corner order when only a southern river boundary was present, producing a crossing polygon. The closure now follows the perimeter. Brahmaputra north/south masks use the Assam reach (the stored vertices north of 25.6°N), excluding the long Bangladesh-to-Bay tail that doubles back in longitude. The original full reference river remains visible on the base map. Masks preserve the actual stored river vertices, including bends, rather than averaging a river into a sketch line.

The Barnadi-side sector retains the existing dataset's `puthimari` trace labelled “Puthimari/ Bornadi”; no independently surveyed Barnadi geometry is added. River identifications in this area are complicated by connected and changing channels. The [Inland Waterways Authority of India Puthimari feasibility report](https://iwai.nic.in/sites/default/files/2536979333NW-82%20Final%20FSR%20Puthimari%20River.pdf), p.11, describes the Bornodi/Puthimari naming sequence. This supports retaining a qualified atlas reference, rather than claiming that every historical Barnadi mention identifies this modern full trace.

## Historical cross-checks and limits

The [Census of India Sivasagar handbook](https://censusindia.gov.in/nada/index.php/catalog/240/download/610/DH_2011_1812_PART_A_DCHB_SIVASAGAR.pdf) records the 1490 Kachari conflict and withdrawal across Dikhou. The [Cachar handbook](https://censusindia.gov.in/nada/index.php/catalog/200/download/450/DH_2011_1817_PART_A_DCHB_CACHAR.pdf) discusses movement to the Cachar plains and the c.1750 Khaspur chronology. These indexed official accounts support river/frontier and capital contexts; they do not prove the requested combined modern-district envelope. [Sribhumi district history](https://sribhumi.assam.gov.in/about-us/history) places Karimganj within a complex Sylhet history. Including all of modern Karimganj in the Dimasa maximum is therefore explicitly a user-adopted display convention. Sources were checked through indexed excerpts; full handbook scans were not reread for this revision.

## Validation

`node tools/check-frontiers.js` checks actual rendered ownership on both sides of Dehing and Dikhou, at least twenty exact shared river vertices per frontier, over 99.5% coverage of each of the six requested districts at the early maximum and later hill–Barak phase, and four independently drawn Bhuyan sectors. `check-growth.js`, `check-ratna.js` and `check-sankardeva.js` verify the retained staging, annual map joins and journey data.

The [subsequent chronology correction](../mainstem-chronology-2026-11-04/README.md) extends the early Kachari core through 1531 and replaces the old 1523 retreat with a contested campaign layer and approximate 1532 transition. It supersedes the 1275–1522 interval described above.
