# Subansiri treaty frontier and eastern-Meghalaya Jaintia display

Adopted 4 November 2026 at the user’s request.

## Treaty phase: 1563–1580

The north-bank Koch–Ahom frontier now follows the **Subansiri river**, rather than a longitude through the Narayanpur reference point. Koch territory lies west and Ahom territory east of the same stored river polyline. The south-bank interpretation remains separately defined. This change applies to the existing 1563–1580 post-Majuli phase; the 1581 Koch Bihar/Koch Hajo successor-state phase is separate.

The [user-supplied Treaty of Majuli summary](https://en.wikipedia.org/wiki/Treaty_of_Majuli) describes north-bank cession west of the Subansiri and cites Nath (1989), p.58, and Sarkar (1992), p.80. The summary was read; those original book pages were not inspected directly. Earlier notes retaining the Narayanpur-side sketch are superseded by this river-frontier correction. Camp and occupation markers at Majuli/Garhgaon continue to record 1563 campaign presence, without permanently colouring the island or the whole Ahom realm as annexed Koch territory.

The endpoint in 1580 is the project’s existing phase boundary, not a claim that every treaty provision remained equally effective for seventeen years. Later resistance and changing control remain qualified.

## Jaintia: adopted modern geographic limits

The map now uses the former **Jaintia Hills district** as the geographic proxy for the Jaintia kingdom’s hill-region display. This is the region now divided into East and West Jaintia Hills in eastern Meghalaya. The builder intersects the district with the project’s Meghalaya outline and subtracts both the project’s Assam state outline and every stored Assam district polygon. The old hand-drawn sketch is removed.

Source geometry: [DataMeet Census 2011 district boundaries](https://github.com/datameet/maps/tree/master/Districts/Census_2011), Jaintia Hills, Meghalaya, census code 299. Local [district outline and provenance](../../data/maps/jaintia-hills.json). DataMeet Community Maps attribution: CC BY 4.0 / ODbL. [East Jaintia Hills district administration](https://eastjaintiahills.gov.in/about-district/) describes the eastern-Meghalaya location; the [Census of India East Khasi Hills handbook](https://censusindia.gov.in/nada/index.php/catalog/863/download/36320/DH_2011_1706_PART_B_DCHB_EAST_KHASI_HILLS.pdf) distinguishes the historical kingdom’s hill tracts from its plains.

This is the user-adopted **hill-only display**, not a claim that the complete historical Jaintia kingdom never extended into the Jaintiapur/Sylhet plains. Modern district and state boundaries are geographic proxies, not surveyed medieval borders. The same named hill-region geometry is used for later British annexation rows, avoiding inconsistent copies of the old sketch.

## Verification

`node tools/check-treaty-jaintia.js` checks ownership west/east of Subansiri and exact shared river vertices in 1563, 1570 and 1580; zero Koch–Ahom area overlap; separation of the 1581 phase; Jowai/Khliehriat coverage; containment within Meghalaya; and no area overlap with any stored Assam district. Existing frontier, Koch, main-stem, regional and Sankardeva checks also pass.
