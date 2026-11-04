# British expansion and Northeast state changes

Implemented 4 November 2026 in the existing annual atlas. Open **British expansion & states**, choose a region, then use its previous/next stage controls or select a date. Shared views preserve the year and region, for example `#y=1833&c=matak` and `#y=1895&c=lushai`.

## Changes now visible

- **Matak:** separate autonomous government from the adopted 1805 settlement; survival during Burmese occupation; separate Company arrangements in 1826 and 1835; exclusion from Purandar’s 1833 restoration; direct management in 1839; formal incorporation proclamation in 1842.
- **Purandar:** restored protected rule in 1833–1837. The annual **1838** view now shows the position after annexation. Separate north/south-bank envelopes locate the restored country; Matak and the Sadiya locality are excluded.
- **Sadiya:** a separate Khamti local-authority locality symbol, alongside the British political presence. The 1839 rising/intervention is distinguished from Matak succession and direct management; the 1842 proclamation is a separate stop. The symbol is not the complete historical extent of Sadiya jurisdiction.
- **Cachar:** plains annexation in 1832, the 1834 Tularam agreement and the remaining hill-territory annexation in 1854. No precise 1834 dividing line is invented.
- **Khasi/Jaintia/Garo:** Khasi war/agreements are distinct from direct annexation; Jaintia’s adopted hill-only layer becomes British in 1835; Garo district context begins in 1869 and the administered-region proxy in 1873 after the 1872–1873 campaign.
- **Naga Hills:** separate context footprints for 1866 district formation, 1875 Lotha-country extension and 1889 Ao-country extension. Whole modern Nagaland is no longer assigned to the British province in 1874.
- **Lushai Hills:** 1871–1872 expedition marker, 1889–1890 occupation/post context, northern and southern administrative centres, the **6 September 1895** incorporation proclamation, and **1 April 1898** merger under Assam.
- **Manipur:** separate kingdom, Burmese occupation from 1819, recovery in 1825, Yandabo recognition provision in 1826, 1834 Kabaw agreement reference, and princely rule after 1891. It does not become a directly administered Assam district.
- **Tripura:** protectorate status from 1809 and Political Agent/paramountcy from 1871 are shown with British hatching; accession to India in 1947 and central administration from 1949 have distinct Indian colours.
- **Frontier tracts:** the modern Arunachal region appears as dotted context from 1914, rather than a solid claim of uniform effective administration. Indian frontier/NEFA administration, the 1972 Union Territory and 1987 statehood are separate stages.
- **Modern changes:** NHTA 1957/Nagaland statehood 1963; Meghalaya autonomy inside Assam 1970/statehood 1972; Mizoram and Arunachal UT 1972/statehood 1987; separate Manipur and Tripura integration and statehood sequences.
- **Provincial changes:** 1874, 1905, 1912 and 1947 are selectable stages. The 1905 provincial proxy uses the relevant modern district groups instead of all present Bangladesh, including Malda/Dinajpur/Jalpaiguri context on the Indian side and excluding the Khulna/Jessore/Nadia-side proxies.

The 1667, 1679 and 1682 Guwahati recovery stages from the existing bank-frontier revision are preserved.

## Geometry and annual conventions

`data/features/colonial/colonial-stages.json` contains 85 source-linked regional phases, 31 map-marker records and an eight-state separation/statehood comparison after the [Manipur/Tripura affiliation correction](manipur-tripura-affiliation-correction.md) and [statehood guide](statehood-guide.md). Its sources record verification status and links. The module extends, rather than replaces, the older CSV-based annual atlas.

Annual maps show the **position after that year’s named change**. Thus Purandar’s restored territory ends with the 1837 annual frame, and the 1838 frame is directly British. Matak is separately coloured through 1838 and directly British in the 1839 frame. The 1842 proclamation changes the explanation/formal status without another invented conquest polygon.

Matak’s new outline follows the mapped Brahmaputra and Buri Dihing with an eastern Sadiya-meridian cutoff, following the historical boundary description. It is no longer the whole present Tinsukia district. Modern river traces and the eastern cutoff remain approximate; old channels are not reconstructed.

`data/maps/colonial-regions.json` extracts modern Census 2011 district reference geometry from DataMeet. Garo and Khasi regions and the Naga district stages use these as **qualified geographic proxies**. In particular, the Naga shapes locate the Angami/Doyang, Lotha and Ao stages rather than asserting that every modern constituent district was wholly annexed in the corresponding year. Dotted context footprints do not remove the underlying political layer and do not count as measured core territory. Their outlines are not archival boundary reconstructions.

Princely/protected rule uses dashed outlines and its own polity colour. It is different from both direct British administration and dotted contextual regions. The marker and region panel provide dates and source links independently of whether a territory is large enough for a label.

The subsequent affiliation correction adds British-coloured hatching to protected/princely rule and a shared Indian fill after integration, while keeping local names/outlines. Orange hatching marks the 1947 accession stage; solid Indian colour follows the October 1949 transfer. This prevents the separate regional identity from appearing to mean continuing independence from India.

The earlier adopted hills-only Jaintia scope is retained. The 1834 Cachar dividing line, Kabaw Valley geometry, individual Khasi state boundaries, detailed frontier control and the Sylhet award line remain unresolved. Current modern outlines are explicitly qualified where used. Modern 1970 Meghalaya geography does not reconstruct Shillong exceptions.

The 1805 display starts for some neighbouring contexts are not foundation or annexation dates. Province/statehood transitions, including 1963 and 1987, are timeline stops even when the outline does not move. Older `k=ne-states` links resolve to Nagaland rather than breaking after the previously grouped state identity was split.

## Sources and validation

The source register is embedded in `data/features/colonial/colonial-stages.json`. Gait’s public-domain text was read locally, especially printed pp. 286–292 and 303–314. His colonial judgements are not adopted. Government/institutional sources substantiate the Mizoram proclamation and merger, Khasi distinctions, Garo sequence, modern statehood dates and the Manipur relationship. Hansard’s 8 August 1905 reply names the divisions transferred into Eastern Bengal and Assam. Catalogue-only sources are identified as such and do not establish precise geometry.

Reference geography: [DataMeet Census 2011 districts](https://github.com/datameet/maps/tree/master/Districts/Census_2011), CC BY 4.0 / ODbL, with provenance stored in the reference JSON. Other modern geography retains the attribution in `data/maps/README.md`.

Rebuild with `node tools/build.js`, then run `node tools/check-colonial.js` and the existing `tools/check-*.js` scripts. The new checks exercise map geometry at selected locations, Matak’s survival and restoration exclusions, direct/princely/context distinctions, Naga growth stages, 1905 exclusions, Meghalaya’s nested autonomy and modern statehood transitions. They verify the implemented reconstruction, not historical certainty for every boundary.

Validation completed: all ten `tools/check-*.js` scripts passed after the final data rebuild; JavaScript syntax and `git diff --check` passed. Browser checks exercised Matak 1833 → 1835 → 1838 → 1839, Lushai 1891 → 1895 → 1898, switching to princely Manipur, global next-change stops at 1963 and 1987, and year/region shared links. At 390×844 the document width was 390 pixels with no horizontal overflow; responsive label redraw was checked. Desktop/mobile previews are in `output/playwright/colonial-*.png`. The inspected application session reported no browser console errors or warnings.
