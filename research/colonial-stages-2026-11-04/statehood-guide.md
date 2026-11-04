# Separation from Assam and full statehood

Researched and implemented 4 November 2026. The guide covers the eight states in the present-day Northeastern region; it does not project that modern regional grouping backwards as a political unit.

| State | Origin / separation from Assam | Full Indian statehood |
|---|---|---|
| Assam | Continuation of the earlier Assam province; not carved out of Assam | 26 January 1950 |
| Nagaland | Formally ceases to be part of Assam on 1 December 1963. Special NHTA administration began inside constitutional Assam on 1 December 1957 | 1 December 1963 |
| Meghalaya | Autonomous state within Assam on 2 April 1970; separate state on 21 January 1972 | 21 January 1972 |
| Mizoram | Mizo district of Assam becomes a separate Union Territory on 21 January 1972 | 20 February 1987 |
| Arunachal Pradesh | NEFA ceases to form part of constitutional Assam and becomes a separate Union Territory on 21 January 1972. Earlier frontier/central administration was special | 20 February 1987 |
| Manipur | Former princely state; not carved out of Assam. Central administration 15 October 1949; Part C state from 1950; Union Territory from 1 November 1956 | 21 January 1972 |
| Tripura | Former princely state; not carved out of Assam. Central administration 15 October 1949; Part C state from 1950; Union Territory from 1 November 1956 | 21 January 1972 |
| Sikkim | Separate kingdom/protectorate; not carved out of Assam. Protectorate treaty signed 5 December 1950 | 16 May 1975, the officially observed admission/statehood date |

## Evidence behind the distinctions

- [Naga Hills–Tuensang Area Act, 1957, section 2](https://www.indiacode.nic.in/bitstream/123456789/1417/3/a1957-42.pdf): the new administrative unit is **in the State of Assam**. Its commencement notification is dated for 1 December 1957.
- [State of Nagaland Act, 1962, section 3](https://www.indiacode.nic.in/bitstream/123456789/1384/1/196227.pdf): the territory ceases to form part of Assam on the appointed statehood day. [Nagaland government history](https://lokbhavan.nagaland.gov.in/2074-2/) corroborates 1 December 1963.
- [North-Eastern Areas (Reorganisation) Act, 1971](https://www.indiacode.nic.in/indiacode/handle/123456789/1534?view_type=browse), effective 21 January 1972: sections 3–4 establish Manipur and Tripura from their previous Union Territories; section 5 covers Meghalaya; sections 6–7 establish Mizoram and Arunachal as Union Territories. Section 7 expressly ends NEFA’s inclusion in Assam. The indexed official Act passages/metadata were checked; the full PDF fetch timed out during this research.
- [Meghalaya 1971 Census jurisdiction account](https://censusindia.gov.in/nada/index.php/catalog/30689/download/33870/47363_1971_GEN.pdf): distinguishes 1970 autonomy from 1972 statehood, including Shillong exceptions.
- [State of Mizoram Act, 1986](https://www.indiacode.nic.in/bitstream/123456789/1869/1/198634.pdf): indexed commencement note confirms 20 February 1987. [State of Arunachal Pradesh Act, 1986](https://www.indiacode.nic.in/bitstream/123456789/1878/1/198669.pdf) and [APPSC history](https://appsc.gov.in/Index/history) provide the parallel Arunachal transition. Enactment in 1986 is not statehood in 1986.
- [Manipur Public Service Commission history](https://mpscmanipur.gov.in/historical-perspective.html) distinguishes central administration through October 1956 from the later UT phase. The original merger agreements remain linked in the [earlier affiliation correction](manipur-tripura-affiliation-correction.md).
- [Lok Sabha answer, 1 April 1970](https://eparlib.sansad.in/bitstream/123456789/2090328/1/04_X_01-04-1970_p64_p64_u4751.pdf) identifies Sikkim as an Indian protectorate and dates the treaty to 5 December 1950. [Official Statehood Day account](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1924577&lang=2&reg=48) gives 16 May 1975. This guide uses the officially observed statehood/admission date, not a referendum or parliamentary-passage date.
- Assam’s constitutional-state date follows the [Constitution’s commencement and First Schedule](https://legislative.gov.in/constitution-of-india/); it does not erase the earlier history of Assam province.

Primary statutory indexed passages were used to resolve the 1957/1963 distinction where historical summaries compress administrative and constitutional change. Source records and verification notes are embedded in `data/colonial-stages.json`.

## Changes to the site

The **Separation & statehood** button opens an eight-row comparison with independently selectable separation, administrative and statehood dates. The URL uses `c=statehood`; a selected state adds its existing polity ID. Dates focus the state on the map while retaining the comparison table.

The NHTA map for 1957–1962 is now a dotted special-unit overlay inside the Assam envelope; Assam loses that territory at the 1963 transition. This corrects the earlier representation that could imply full separation in 1957. Meghalaya’s 1970 autonomy similarly preserves the within-Assam relationship until 1972.

Sikkim now appears in the postwar map sequence: separate kingdom context, protectorate from the 1950 treaty, and full Indian-state colour from 1975. Its modern outline is a geographic proxy for the earlier context. No ancient or colonial frontier has been invented for it. The earlier intermediate constitutional changes in Sikkim are not exhaustively reconstructed here.

Annual frames show the position after the year’s named change. For example, the 1972 frame shows Mizoram/Arunachal as Union Territories and the 1987 frame shows them as states. Earlier geographic qualifications, including the 1970 Shillong exceptions, remain explicit.

Run `node tools/check-statehood.js` and all existing historical checks after rebuilding. The checks verify the eight dates, constitutional nesting, distinct UT/statehood phases, Sikkim’s affiliation change and source/event joins.

Validation completed: all eleven `tools/check-*.js` scripts pass. Browser checks exercised the NHTA and Nagaland dates, Mizoram’s UT/statehood distinction, Sikkim’s protectorate/statehood controls, all eight table rows and selected-state shared-link reloads. Overview links clear a previous state selection. The settled 390-pixel mobile layout has a 390-pixel document width and a 328-pixel table, without horizontal overflow. Desktop and mobile previews are in `output/playwright/statehood-guide-*.png`; JavaScript syntax and `git diff --check` pass.
