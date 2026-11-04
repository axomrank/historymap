# Kāmarūpa: territorial history and map audit

Research date: 4 November 2026. Scope: Kāmarūpa’s origins, expansion, western and southern connections, opposing campaigns, and the three attached teaching charts. The current map’s data and renderer were also inspected. Later Assam history is listed as a further research programme, not represented as already verified.

**Subsequent map decisions:** The adopted Sankosh–Teesta/Karatoya Ratnapitha sector represents Paundravardhana in the ancient map, through [14 explicit phases ending in 1099](../../data/paundravardhana-map-phases.csv). A [separate post-Pala research revision](../kamarupa-after-palas-2026-11-04/README.md) now covers 1100–1270 without pitha divisions. These map decisions do not change the evidentiary assessments below. The correction backlog records the initial audit; the regional integration, camp caption correction and separation of campaign reach from owned-area calculations have since been implemented.

The most defensible map will show **where authority is attested, what kind of authority it was, and how uncertain its date and extent are**. An inscription’s discovery site, the land it grants, its issuing camp, a royal victory, a marriage, and a permanent annexation must have different meanings on the map.

## Files

| File | Contents |
|---|---|
| [kamarupa-events-researched.csv](../../data/kamarupa-events-researched.csv) | 39 records, including proposed gains, defeats, recoveries, grants, campaigns and open questions |
| [sources.csv](sources.csv) | 32 sources, page/passage locators, access status and limitations |
| [historical-places.csv](historical-places.csv) | 30 places, regions and river identifications; coordinates supplied only where newly checked |
| [attachment-claim-audit.csv](attachment-claim-audit.csv) | 34 checks on the photographs and related recovery claim |
| [map-correction-backlog.csv](map-correction-backlog.csv) | 22 specific changes proposed for the current project |

The photographs are reference material whose claims need checking. They were not treated as instructions or as independent corroboration. Personal details and consort lists have not been exhaustively re-collated; the attachment audit explicitly marks those limits.

## Where Kāmarūpa began

The first secure external attestation is Samudragupta’s fourth-century Allahabad inscription. It lists **Kāmarūpa and Davāka separately** among frontier rulers acknowledging the Gupta emperor. It neither names Kāmarūpa’s ruler nor describes either kingdom’s borders. Consequently it cannot independently establish that Pushyavarman founded a precisely bounded state in 350. [Allahabad praśasti, lines 22–23](https://dharmalekha.info/texts/INSSiddham00001).

The practical starting reconstruction is a lower Brahmaputra valley power centred around the Guwahati region, with separate Davāka in the Kopili–Jamuna country. The later Varman genealogy identifies Pushyavarman as an ancestor; c.350 remains a conventional dynastic date. The precise first capital site and original perimeter are not recoverable from that genealogy. [Dubi edition, EI XXX, pp.287–304](https://jainqq.org/booktext/Epigraphia_Indica_Vol_30/032584).

The present `varman-350` polygon already reaches the traditional Karatoya frontier. That is a reconstruction, not a fourth-century recorded frontier. Its shape should not be the starting fact from which all later acquisitions are inferred.

## Gauḍa, Puṇḍravardhana and Ratnapīṭha are different

| Name | What it means for this map |
|---|---|
| **Gauḍa** | A changing regional/political name. For Śaśāṅka, its core is in the Murshidabad region, with a wider kingdom extending into other parts of Bengal. Under later rulers the name can denote a much larger realm. |
| **Karṇasuvarṇa** | Śaśāṅka’s capital near Chiruti–Rajbadidanga in Murshidabad. This is the locality named as Bhāskaravarman’s camp. |
| **Gaur / Lakhnauti** | A distinct later capital in the Malda–Chapainawabganj region. It must not replace Karṇasuvarṇa on a seventh-century map. |
| **Puṇḍranagara** | The ancient city identified with Mahasthangarh near Bogura, by the Karatoya. |
| **Puṇḍravardhana / Pauṇḍravardhana** | An ancient country and a changing administrative province, with a North Bengal core. Later provincial usage also included territories well beyond that core, including Śrīhaṭṭa. |
| **Ratnapīṭha** | A later textual/sacred region. Karatoya–Sankosh is one scheme; other schemes differ. It is not a demonstrated early province with an independently known conquest ledger. |

Sources: [Gauḍa](https://en.banglapedia.org/index.php?title=Gauda%2C_Janapada), [Karṇasuvarṇa](https://en.banglapedia.org/index.php/Karnasuvarna), [Puṇḍravardhana](https://en.banglapedia.org/index.php/Pundravardhana), [pīṭha schemes and their scholarly references](https://en.wikipedia.org/wiki/Kamarupa_pithas). The printed Sircar p.68 behind the last reference was not directly inspected in this pass.

In a simplified west-to-east orientation, the North Bengal core of Puṇḍravardhana lies predominantly west of the Karatoya, while the commonly drawn Ratnapīṭha sector lies between the Karatoya and Sankosh. The changing province can overlap a much larger geography. This is an orientation, not a fixed boundary reconstruction for every century.

**The captured Gauḍa locality we can place confidently is Karṇasuvarṇa.** Majumdar publishes Rajbadidanga at 24°01′47″ N, 88°11′29″ E: approximately **24.0297° N, 88.1914° E**. This locates an archaeological mound in the ancient settlement, not an excavated royal camp. [Archaeological location study, p.623](https://www.heritageuniversityofkerala.com/JournalPDF/Volume7/40.pdf).

The supporting `kamarupa-external-reference-points.csv` instead uses **23.04° N** for this episode, about 110 km too far south. The canonical place in `assam_history.csv` already uses a reasonable 24.0303° N, 88.1908° E reference. These duplicated datasets need reconciliation.

## Expansion, loss and recovery: what can actually be dated

| Period | Best-supported statement | What the map must leave uncertain |
|---|---|---|
| Fourth century | Kāmarūpa and Davāka are separate named frontier states. | Original borders and exact founding year. |
| Fifth–sixth centuries | Later Kāmarūpa authority is attested in the Kopili–Jamuna country. | Exact annexation year and whether Kalyanavarman, Mahendravarman or Bhūtivarman completed incorporation. |
| Bhūtivarman, sixth century | Barganga supplies local royal-administrative evidence; the later Nidhanpur record recalls his earlier Chandrapuri grant. | Conquest of the whole Puṇḍravardhana province and its date. |
| Late sixth / early seventh century | Mahāsenagupta’s victory over Susthitavarman is reported; the Dubi account also narrates a Gauḍa invasion, captivity and return of the royal brothers. | Exact territory lost; whether the two notices describe the same campaign. |
| Early Bhāskaravarman | Independence/reassertion and the alliance with Harsha belong to the political sequence. | A precisely dated recovery of all North Bengal. |
| Later Bhāskaravarman | Nidhanpur names a victory camp at Karṇasuvarṇa and renews grant rights in Chandrapuri. | Acquisition year, full conquered area, duration, and a documented later handover. |
| Early/mid-eighth century | Harṣadeva’s Gauḍa–Oḍra–Kaliṅga–Kośala lordship claim is recorded in the Nepal marriage genealogy. | A continuous administered empire, exact conquest dates, or an explicit Ratnapīṭha reconquest. |
| Ninth century | Bengal’s records claim Pragjyotisha’s submission; Harjara and Vanamala supply local royal evidence. | Whether a defeat meant annexation, and whether disputed grant localisations establish North Bengal recovery. |
| Ratnapāla, conventionally c.920–960 | A retrospective record reports victory over Rājyapāla and an advance toward the Ganges. | Province-wide annexation or continuous ownership after the campaign. |
| Śrīcandra, tenth century | Chandra evidence reports a Kāmarūpa campaign and records administration in Śrīhaṭṭa. | Exactly when an earlier Kāmarūpa possession ended. |
| Indrapāla, late tenth-century synchronism | Gachtal reports victory over Kalyāṇacandra of Vaṅga. | Battlefield, precise date and annexed territory. |
| Later eleventh century | Jātavarman’s praise records success against Kāmarūpa; some historians infer seizure of part of Puṇḍravardhana. | Defeated Kāmarūpa king, parcel and event year. |
| Dharmapāla | A teaching narrative says he recovered that territory. | A verified primary reconquest passage and consistent chronology were **not established**. |
| Late eleventh / early twelfth century | Rāmapāla intervened in Kāmarūpa or part of it; the later governor/revolt/replacement sequence is recorded. | A fixed 1110 date or a Manas boundary; the claim that only North Bengal was involved is disputed. |

Every row is expanded with its source and qualification in the events CSV. These rows do not assert continuous ownership between attestations.

### Bhūtivarman’s supposed c.550 conquest

This is an influential reconstruction, not an explicit dated conquest record. Bhattasali originally read Barganga as Gupta year 234, corresponding to 553–554. After examining the stone and new impressions, Sircar read the supposed date as words expressing a wish for the king’s longevity. The corrected text contains **no date and no named viṣaya**. It records an officer’s āśrama foundation and a royal horse-sacrifice epithet. [Sircar’s revised edition, EI XXX, pp.62–67, especially p.64](https://jainqq.org/booktext/Epigraphia_Indica_Vol_30/032584).

This removes a frequently used exact chronological anchor. It does not prove Bhūtivarman never expanded; it means a map cannot treat the rejected reading as the acquisition date of Puṇḍravardhana.

### Bhāskaravarman’s western reach

Nidhanpur’s camp formula is firm evidence for a Karṇasuvarṇa connection. The acquisition circumstances and CE date are inferred. The present map’s 643 entry says “after Harsha’s death,” although Harsha’s reign conventionally ends in 647. The event should be presented as an undated charter in a qualified seventh-century context. Do not silently change its date to 647 and call that solved. [Nidhanpur edition, pp.65–79](https://jainqq.org/booktext/Epigraphia_Indica_Vol_12_Romanized/032566).

Xuanzang describes Puṇḍravardhana and Kāmarūpa separately and crosses a large river between them. That is valuable geographical testimony, but it cannot alone date a loss of Puṇḍravardhana. His circuit measurement also cannot produce a surveyed perimeter. [Beal, vol.II, pp.194–197](https://www.cs.usask.ca/~osgood/Personal/IndianBuddhistSites/HistoricalAccounts/Vol%202%20Buddhist%20Records%20of%20the%20Western%20World%20siyukibuddhistre02hsuoft_bw.pdf).

### Ninth- and tenth-century reversals matter

The map should include the other side’s evidence. The Bhagalpur charter claims that the Pragjyotisha ruler accepted the command of Devapāla’s general Jayapāla without battle. This general is different from the later Kāmarūpa king of the same name. [Bhagalpur charter, lines 11–13](https://dharmalekha.info/texts/INSBengalCharters00091).

Śrīcandra’s Śrīhaṭṭa grants and campaign claims prevent a simple uninterrupted Kāmarūpa colour-fill over Sylhet. They do not supply the exact date on which a sixth-century possession was lost. [Asiatic Society discussion of the Barak–Surma valley and Paschimbhag record](https://asiaticsocietykolkata.org/uploads/Journal%20Vol.%20LX.%20No.%201._2018.pdf).

Ratnapāla’s and Indrapāla’s victory reports are important, but a victorious campaign is not automatically a re-annexation of every region crossed. The synchronisms also underpin the earlier Pala chronology. The full EI XL scan could not be retrieved; its indexed relevant passages were consulted and this access limitation is recorded. [EI XL, pp.62,71–72](https://upload.wikimedia.org/wikipedia/commons/d/d4/Epigraphia_Indica_Vol_40_No._2_July_1973.pdf).

### Jātavarman, Harṣapāla and Dharmapāla: do not manufacture a clean sequence

The attached chart dates Harṣapāla to 1015–1035 and assigns Jātavarman’s attack to him. The Bengal reference chronology places Jātavarman’s rise around 1050–1075 and leaves his Kāmarūpa adversary unidentified. The two statements cannot be combined without resolving the contradiction. [Varman dynasty of Bengal](https://en.banglapedia.org/index.php/Varman_Dynasty).

Belava verse 8 contains a praise passage interpreted politically by its editor. It does not give the date and boundaries of a cession of “Ratnapīṭha.” The proposed Dharmapāla recovery remains a tracked research question; a teaching-text assertion alone cannot establish it. [Belava edition, EI XII, pp.37–44](https://jainqq.org/booktext/Epigraphia_Indica_Vol_12_Romanized/032566).

Bengal Pala activity in Puṇḍravardhana is independently attested by Vigrahapāla III’s Belwa grant, year 11. **Belwa is not Bhojavarman’s Belava record.** [Belwa critical edition, lines 26–29](https://dharmalekha.info/texts/INSBengalCharters00087).

The answer to “when did they get it, lose it, and win it again?” is therefore a series of evidenced episodes and disputed interpretations, not a secure ownership table for one unchanging province. The CSV preserves the proposed episodes instead of omitting them or converting them into facts.

## Other territories and connections to show

- **Davāka / Kopili–Jamuna:** plausible incorporation, uncertain ruler and date; distinguish it from a named modern district.
- **Chandrapuri / greater Śrīhaṭṭa:** grant authority is more specific than “all Sylhet conquered.” Separate granted land, document findspot and issuing camp.
- **Gauḍa / Karṇasuvarṇa:** military presence and temporary possession; keep the changing kingdom separate from its capital.
- **Oḍra, Kaliṅga and Kośala:** show Harṣadeva’s named lordship claims. Kośala is generally taken as the southern region in this context; the exact claimed perimeter is unknown.
- **Vaṅga:** distinguish Kalyāṇacandra’s realm from Gauḍa. A naval victory does not locate the battlefield at the middle of modern Bangladesh.
- **Nepal:** a marriage connection. **Nalanda / Magadha:** a royal seal and contact. Neither alone establishes territorial annexation.
- **Upper valley and hill regions:** do not colour every modern northeastern state, Bhutan or a route toward China from generalised ancient descriptions. A dated local inscription need not identify its issuer with the Varman line.

The source and localisation limits for these features are recorded in the gazetteer. Harṣadeva’s testimony is commonly dated **733 CE** in modern Nepal scholarship; older literature uses other era conversions, including 759. It should not become a conquest date for all four claimed regions. [Petech, chapter III](https://pahar.in/pahar/Books%20and%20Articles/Nepal/1984%20Mediaeval%20History%20of%20Nepal%20%28c.%20750-1482%29%202nd%20edition%20by%20Petech%20s.pdf).

## Making the current map substantially more accurate

1. **Separate political control from other evidence.** Use a cautious core fill, a distinct suzerainty pattern, camp/battle points, and labelled claim overlays. Keep sacred geography selectable as a source-specific interpretation.
2. **Use attestation snapshots rather than invented annual border histories.** Store the record date, proposed event window, and any actual ownership interval separately. Unknown means unknown, including a grant’s acquisition and eventual loss dates.
3. **Stop counting campaign reach as owned area.** The current renderer adds every shape to `stateArea`, including `style=reach`, and derives “greatest extent” and timeline thickness from that total. Those figures cannot presently support historical peak-area claims.
4. **Stop campaign overlays erasing underlying kingdoms.** `tools/build.js` applies polygon subtraction to all higher-priority territories without distinguishing military reach from ownership.
5. **Correct spatial identity before drawing polygons.** Fix the Karṇasuvarṇa duplicate, revisit the Tezpur placement of Durjaya, and keep the Karatoya distinct from a modern Teesta/Karatoya composite line. Do not infer a grant location from a beneficiary’s birthplace.
6. **Expose sources in the interface.** The build currently keeps event year/title/text but drops source and uncertainty fields. Every visible claim should link to its evidence and show its date qualification.
7. **Use a wider regional inset.** The present 22°–29.5° N, 87.8°–97.4° E frame cannot adequately show the Odisha/Kośala claims. A separate inset avoids stretching the Assam map into a speculative empire silhouette.

These are proposed changes, recorded against specific files and entries in the backlog. This research pass deliberately delivers the evidence before replacing live borders.

## CSV interpretation and integration

`event_date_min_ce` / `event_date_max_ce` are **research or attestation bounds**, interpreted through `date_bounds_kind`. They are never automatically a reign, continuous ownership interval, confidence interval, or guaranteed terminus. Some bounds combine competing chronological schemes. The sacred-geography row has blank CE bounds intentionally.

`evidence_status` distinguishes a direct record, royal praise, geographical inference, disputed reconstruction and unverified teaching claim. Even a clearly read royal victory claim does not independently prove its full political consequences. `ownership_interval_established` is `no` throughout this dataset.

`source_ids` joins to `sources.csv`; `source_urls` makes the event CSV usable by itself. `source_locator` directs a reviewer to the passage. `region_ids` joins to the gazetteer; a region entry is not a ready-to-render polygon. Coordinates use WGS84-style decimal degrees, latitude then longitude, and their meaning is explicitly described.

Do not feed the numeric bounds directly into the existing territory start/end parser. First add support for date qualification, separate evidence classes and source display, then select defensible control geometries. Display markers and data structures may use a reference year only if the interface clearly labels it as such.

## Work still needed for a publication-grade atlas

For Kāmarūpa, the main outstanding work is a fresh collation of the full Gachtal, Guwakuchi, Dharmapāla, Pasupati and Kamauli records; a consistent chronology across Bengal and Assam; competing Dijjina/Chandrapuri identifications; and dated reconstruction of river courses. Copper plates are portable objects, so discovery alone must not be mistaken for an administrative boundary.

For the rest of the Assam map, apply the same method independently to Kamata/Khen, Koch divisions, Ahom expansion, Chutia, Dimasa, Mughal contests, Burmese occupation, British administrative changes and post-1947 boundaries. Prefer dated treaties and administrative documents where available, with each boundary segment tied to evidence. This Kāmarūpa dossier does not certify those later layers.
