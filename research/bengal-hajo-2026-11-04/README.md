# Mughal Bengal and the fall of Koch Hajo

Researched and implemented 4 November 2026. This revision removes the western Koch Behar successor state from the displayed atlas, retains the earlier undivided Koch kingdom, and adds a Bengal-wide conquest view. Removing a state from this atlas does not reassign its land automatically to another ruler.

## Research before the map changes

The conquest of Bengal was a process, not one modern-country takeover. Rajmahal in **1576** ended the Karrani sultanate. Eastern resistance continued; the decisive delta submissions occurred in **1611–1612**. The Chittagong conquest was a separate **1666** event. These stages must not be collapsed into “all West Bengal and Bangladesh became Mughal in 1576.” Modern political borders are also different from the historical province: northern hill/princely territories and the Chittagong Hill Tracts cannot simply be added as direct imperial possessions.

The core chronological sources are Abdul Karim’s [Banglapedia account of Islam Khan](https://en.banglapedia.org/index.php/Islam_Khan_Chisti), Richard Eaton’s publisher-hosted [*The Rise of Islam and the Bengal Frontier*, chapter 6](https://publishing.cdlib.org/ucpressebooks/public/book/the-rise-of-islam-and-the-bengal-frontier-1204-1760.html), the indexed Rajmahal passage in [V. A. Smith’s *Akbar the Great Mogul*, p.145](https://tile.loc.gov/storage-services/service/gdc/gdclccn/18/00/26/77/18002677/18002677.pdf), and the indexed Chittagong account in [Sarkar’s *History of Aurangzib*, III](https://library.bjp.org/jspui/bitstream/123456789/678/1/History%20Aurangzib%20Vol-%203.pdf). The Banglapedia article and relevant Eaton passages were read; the two older volumes were checked through indexed passages, not claimed as full-volume reads.

For Koch Hajo, [University of North Bengal research, printed pp.94–96](https://ir.nbu.ac.in/bitstreams/83784646-b244-41b6-bd40-f5095c135918/download) identifies the core between Sankosh and Barnadi and the conquest in 1613. Eaton describes a western fortress siege, subsequent advance, fiscal incorporation and resistance after annexation. Accounts differ over 1612/1613 dating; the map therefore uses a **1612–1613 campaign window**, followed by **1614–1615 resistance**, rather than inventing precise district-conquest dates.

Koch Bihar’s submission and Koch Hajo’s conquest are different political events. The former is not treated as automatic direct annexation of the latter. References using “Kuch Bihar” broadly are not used to paint the omitted western successor state as uniformly annexed.

## Adopted display stages

| Years | Bengal display | Koch Hajo / Kamrup display |
|---|---|---|
| 1576–1579 | Approximate western provincial envelope after Rajmahal | The earlier undivided Koch kingdom remains separately mapped |
| 1580–1586 | Western context with contested-authority hatching | Independent eastern successor phase begins in 1581 |
| 1587–1607 | Western consolidation; eastern local/Afghan resistance remains separate | Assam-confined core, with eastern dependencies distinguished as reach |
| 1608–1610 | Eastern campaigning shown as reach; Dhaka base from 1610 | Pressure from Mughal Bengal, without instant annexation |
| 1611 | Delta submissions; Sylhet resistance retained separately | Independent annual core remains |
| 1612 | Sylhet consolidation; Chittagong still outside | Western invasion overlay in the Dhubri-side sector |
| 1613 | Consolidated delta | Annexed Kamrup core; independent Koch Hajo ends |
| 1614–1615 | Bengal base retained | Resistance/reconsolidation hatching qualifies the annexed core |
| 1615–1616 | Bengal base retained | Temporary eastern invasion reach, removed after the Ahom reversal |
| 1617–1665 | Chittagong remains unannexed | Subsequent Assam wars retain their separate dated layers |
| 1666–1716 | Chittagong coastal proxy added | Separate local frontier geography retained |
| 1717–1764 | Increasingly autonomous Bengal nawabs under nominal Mughal sovereignty | This is not continuous direct administration from Delhi |

These are annual display contexts. The 1612 western overlay illustrates the documented order of advance within the 1612–1613 campaign window; it is **not a dated cadastral map of every parcel captured in 1612**. Post-annexation hatching does not restore a single independent Koch Hajo state. The eastward campaign is separated from lasting control and from the Ahom-protected Darrang succession.

## Geographic interpretation

- Koch Hajo core and dependencies are clipped to the project’s modern Assam reference and have no overlap with the stored Bangladesh outline. The core uses the existing qualified Puthimari/Bornadi trace. This is an adopted Assam-focused reconstruction, not a blanket assertion that no Koch army or claimant ever operated across a modern international boundary.
- The broad western Bengal envelope is low confidence. Earlier occupation was uneven, and the district-level intermediate contours are illustrative regional proxies. Rebellion hatching indicates uncertain authority rather than an unsupported claim that every place revolted simultaneously.
- The Bengal view contains modern West Bengal and Bangladesh reference geography. Direct-rule shading excludes the 2011 Darjiling, Jalpaiguri and Koch Bihar districts and the three Bangladesh Hill Tracts districts. The final coastal addition uses Chittagong/Cox’s Bazar district proxies. These exclusions prevent a false “every square kilometre of today’s two territories” conquest claim.
- District boundaries do not represent surveyed Mughal borders. The lowland shapes are simplified geographic carriers for the researched sequence, not evidence of uniform control within every modern district.
- A neutral regional layer distinguishes eastern chiefs and Afghan resistance from Mughal possession. It does not invent one unified eastern Bengal dynasty.
- The lowland context transitions to Company/British shading at the 1765 Diwani instead of disappearing without explanation. This is a revenue/political transition, not the annexation date of every modern hill or princely region.

Geometry: [district data and provenance](../../data/maps/bengal-districts.json). West Bengal uses DataMeet Census 2011 district outlines (CC BY 4.0 / ODbL); Bangladesh uses BBS/OCHA 2020 districts through geoBoundaries (CC BY 3.0 IGO). The Bengal frame expands west and south to show both modern reference areas without cropping.

## Controls and validation

Use **Bengal & Koch Hajo** in the header. The Mughals tab provides dated stages and a **Koch Hajo frontier** focus button. Campaign and annexation layers remain visible together during 1612–1616 even when either participant is selected. Playback slows through the conquest sequence.

`node tools/check-bengal-hajo.js` checks removal of the Koch Behar state/town label, Koch Hajo’s Assam confinement and zero Bangladesh overlap, the delayed Dhaka/Sylhet/Chittagong additions, excluded hill/princely regions, campaign/annexation/resistance/reversal layers, source-stage continuity and full Bengal reference-frame coverage. Projected border comparisons allow a tiny tolerance for one-decimal SVG rounding; the geographic masks are clipped before projection. Existing river-frontier, treaty, Jaintia, Koch formation, regional chronology and Sankardeva checks also pass.
