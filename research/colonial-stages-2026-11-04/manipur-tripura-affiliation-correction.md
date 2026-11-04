# Manipur and Tripura: political affiliation correction

4 November 2026. The earlier rendering retained local polity colours after British protection/paramountcy and Indian integration. As a result, a visitor could reasonably read both territories as remaining outside British influence and later India. This correction adds a separate political-affiliation field; local identity no longer determines the apparent sovereign grouping.

## Researched sequence used on the map

| Region | Date | Representation |
|---|---|---|
| Tripura | 1809 | British protectorate stage, following the date given in NCERT; pink hatching over local identity. |
| Tripura | 1871 | Resident Political Agent; later princely relationship under British paramountcy, also visibly hatched. |
| Manipur | 1826 | Restored kingdom with British protection/political relations. Yandabo’s recognition provision is not relabelled as direct annexation. |
| Manipur | 1891 | British takeover in April followed by the princely settlement under paramountcy; strong British-affiliation hatching. |
| Manipur | August 1947 | Accession to the Dominion of India; signature dated 11 August. Orange hatching preserves the distinction between accession and central administration. |
| Tripura | August 1947 | Accession signed 13 August; same orange affiliation treatment. |
| Manipur | 1949 | Agreement signed 21 September; transfer of administration effective **15 October 1949**. Solid Indian colour. |
| Tripura | 1949 | Agreement signed 9 September; transfer effective **15 October 1949**. Solid Indian colour. |
| Both | 26 January 1950 | Part C states under the Constitution. This is a separate stage from the 1949 transfer. |
| Both | 1956 / 1972 | Union Territories, then states from 21 January 1972; Indian membership remains visible throughout. |

The annual atlas shows the position after the named year’s transition. It does not represent every event within August–October by a separate day-level frame.

## Sources and qualifications

- **Tripura protectorate:** [NCERT history passage](https://n20.ncert.org.in/pdf/publication/otherpublications/tinei101.pdf) explicitly dates the protectorate to 1809 and distinguishes earlier intervention. The indexed passage was checked; the full PDF fetch failed. No claim is made that the underlying 1809 instrument itself was read.
- **Tripura agent and integration:** [North Tripura district history](https://northtripura.nic.in/history/) was read in full. It records the 1871 agent, 1947 accession and 1949 sequence. Its compressed 1761 conquest statement is not used to annex all modern Hill Tippera on that date; the plains/estate history is different.
- **Manipur political relations:** the [contemporary 1891 Hansard debate](https://api.parliament.uk/historic-hansard/lords/1891/jun/22/manipur) records recognition in 1826 and British assertions of political superiority. This is a British official account, not a neutral account of consent. The map distinguishes that earlier relationship from the postwar settlement.
- **Manipur takeover:** [Manipur Police’s official history](https://manipurpolice.gov.in/?page_id=4), checked in indexed passages, dates British assumption of administration to 27 April 1891 and integration to October 1949.
- **Manipur accession date:** [Lok Sabha proceedings, 7 August 2024, printed p. 723](https://eparlib.sansad.in/bitstream/123456789/2981289/1/lsd_18_II_07-08-2024.pdf) corroborate the 11 August 1947 instrument and the defence subject. This is later parliamentary corroboration; the original instrument facsimile was not inspected for this correction.
- **Transfers of administration:** the Government of India’s 1950 White Paper reproduces the [Manipur agreement, Article I](https://en.wikisource.org/wiki/White_Paper_on_Indian_States_(1950)/Part_5/Centrally_Merged_States/Manipur) and [Tripura agreement, Article I](https://en.wikisource.org/wiki/White_Paper_on_Indian_States_(1950)/Part_5/Centrally_Merged_States/Tripura). These transcriptions were read and establish the October effective date separately from signature. They document the governmental acts; they do not resolve historical debates over consent or legitimacy.

The authorities and verification notes are also in `data/colonial-stages.json`.

## Assam and India are separate questions

Neither region is recoloured as an ordinary district of Assam. Oversight involving Assam officials or the province of Eastern Bengal and Assam is not equated with ordinary district incorporation. Hill Tippera is also distinct from the directly administered plains district of Tippera.

The map now uses British pink hatching for protection/paramountcy, Indian orange hatching for the accession stage, and solid Indian orange after central administration begins. The local polity remains selectable, with its own name and outline. Other modern Indian regions use the same national fill while preserving their regional identities. Dotted frontier contexts retain their geographic qualifications.

The CSV `authority` field is compiled into the atlas. The renderer, swatches, tooltip, selected-place card and legend all use it. This prevents an independent regional ID or colour from silently implying continuing political independence.

Historical boundaries remain the previously qualified modern regional proxies; this correction changes political status and its visibility, not the surveyed extent of the older kingdoms.

## Verification

All ten historical check scripts pass, including new assertions for British protection/paramountcy, 1947 accession, 1949 transfer, 1950 Part C status and continuing Indian membership in 1972 and 2026. The checks also prevent either region from being absorbed into the Assam-state polygon.

Browser verification inspected the actual rendered fill/affiliation for both regions at 1891, 1947, 1949, 1972 and 2026. It exercised the 1947 → 1949 → 1950 stage controls and region switching. At a 390-pixel mobile viewport the document width remained 390 pixels. Settled desktop previews are in `output/playwright/affiliation-*.png`; the 2026 preview confirms the common Indian fill with separate regional labels. JavaScript syntax and `git diff --check` pass.
