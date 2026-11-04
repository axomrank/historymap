# Main-stem continuity, Kachari chronology and the 1563 campaign

Revision: 4 November 2026.

## One river feature

The interactive river layer now contains one continuous **Brahmaputra (Siang / Dihang)** feature instead of three separately selectable rivers. All three regional names remain aliases. Dehing/Burhi Dehing remains a separate tributary. This naming is supported by the [Central Water Commission Siang-basin report](https://cwc.gov.in/sites/default/files/volume-i.pdf) and [Assam Water Resources description](https://kamrup.assam.gov.in/departments/water-resources).

The existing Siang and Dihang segments had a gap. A short reach from Natural Earth’s Dihang centreline fills it, retaining the original segment vertices on both sides. The joins reconcile different dataset resolutions and are approximate modern reference geometry. [Connector coordinates and provenance](../../data/maps/brahmaputra-mainstem.json); [Natural Earth source](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_rivers_lake_centerlines.geojson), public domain. The lower Brahmaputra trace used to calculate territorial masks remains the same, so joining the visible river does not redraw historical banks inadvertently.

## Kachari retreat no longer occurs in 1523

The previous territory row switched to a Dhansiri-limited Kachari shape in 1523, independently of the Ahom western phase starting in 1532. That inconsistency also prematurely removed the intervening Kachari corridor. The Chutia annexation is a separate event and no longer triggers a Kachari retreat.

The revised display carries the existing Kachari core through 1531. It shows a hatched Ahom campaign corridor in 1526–1531, then changes the settled border at the existing approximate 1532 stage. The later 1536 Dimapur event and 1537 phase remain separate. This should not be read as evidence that the first Ahom attack occurred in 1532: [Acharyya’s Kachari chapter, p.219 onward](https://pahar.in/pahar/Books%20and%20Articles/Indian%20Subcontinent/1966%20The%20History%20of%20Medieval%20Assam%20from%20the%2013th%20to%20the%2017th%20century%20by%20Acharya%20s.pdf) describes a December 1526 campaign and renewed Marangi fighting in 1531. [Ahom–Tribal Relations, p.32](https://ocrdigitalfile.nvli.in/dlirepository/736/Ahom-tribal-Relations-ocr.pdf) also describes the 1531 Marangi episode. Those passages were checked through indexed excerpts; direct full scans were inaccessible. Carrying core possession between disputed campaign dates is an editorial convention, not proof of unchanged administration in every locality.

## Koch forces reached Majuli and Garhgaon

The [University of North Bengal campaign chapter, printed p.92](https://ir.nbu.ac.in/bitstreams/4761b814-9600-4b41-8532-358adf761c63/download) explicitly places Naranarayan at Majuli and describes the occupation of Garhgaon. The indexed passage was checked; full download remains intermittent. Separate 1563-only campaign markers now show those locations, using the existing approximate geographic references rather than claiming to locate the exact camp.

The campaign’s maximum reach, the Majuli settlement, tribute, and lasting territorial administration are distinct. The island is not automatically recoloured as a permanently annexed Koch province simply because the Koch king camped there. The map retains its qualified Narayanpur-side reconstruction for the settlement envelope; descriptions of north-bank cession west of the Subansiri should not be confused with Majuli being the final campaign endpoint.

Run `node tools/check-mainstem-chronology.js`, along with the existing atlas checks, after rebuilding. It checks a single continuous main stem, the exact sequence of joined source vertices, preservation of Dehing as a tributary, no Kachari core-area reduction in 1523, the separate contested and settled-border stages, and both 1563 campaign markers.
