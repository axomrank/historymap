# The Kāmarūpa Historical Atlas (c. 350–1100+ CE)

An offline, zero-dependency interactive historical atlas and epigraphic explorer of ancient Kāmarūpa (early Assam and its interconnected northeastern landscape).

---

## 🗺️ Interactive Viewers

This suite runs entirely offline in modern web browsers without external map libraries, frameworks, or web servers:

| Viewer | File | Focus |
|---|---|---|
| **Inscriptions Atlas** | [`Inscriptions-Atlas.html`](file:///home/angsuman/extra_spac/MAP/Inscriptions-Atlas.html) | Interactive epigraphic catalogue of 53 records (350–1100+ CE) with coordinate markers, material filters, date sliders, and full scholarly summaries. |
| **Sacred Landscape & Pīṭhas** | [`Kamarupa-Explorer.html`](file:///home/angsuman/extra_spac/MAP/Kamarupa-Explorer.html) | Textual geography tracing the traditional Four Pīṭhas (Neog sequence vs. *Haragaurīsaṃvāda*), the *Kālikā Purāṇa* reach, and *Yoginī Tantra* directional anchors. |
| **Default Entry** | [`index.html`](file:///home/angsuman/extra_spac/MAP/index.html) | Quick-launch redirect to the Inscriptions Atlas. |

---

## 📂 Directory Structure

```
MAP/
├── index.html                           # Entry-point redirect to Inscriptions Atlas
├── Inscriptions-Atlas.html              # Primary epigraphic atlas interface
├── Kamarupa-Explorer.html               # Sacred landscape & Four Pīṭhas explorer
├── Kamarupa-Inscriptions-Chronology.csv # Complete 53-record chronological CSV
├── README.md                            # Project documentation & methodology
│
├── atlas-assets/                        # Application styles, rendering engines & datasets
│   ├── atlas.css                        # Inscriptions atlas UI stylesheet
│   ├── atlas.js                         # Custom SVG map renderer, marker clustering & filter engine
│   ├── inscriptions-data.js             # Serialized 53-record epigraphic database
│   ├── kamarupa.css                     # Sacred landscape explorer UI stylesheet
│   ├── kamarupa.js                      # Pīṭha boundary renderer, text comparison & overlay logic
│   └── kamarupa-data.js                 # Pīṭha river bounds, textual anchors & citation notes
│
└── maps/                                # Geographic boundaries & river vectors
    ├── atlas-geography.js               # Compiled offline bundle (Assam borders, 33 districts, 41 rivers, 8 countries)
    └── README.md                        # Provenance and licensing of geographic data
```

---

## 🚀 How to Run

1. **Direct Browser Launch**:
   Double-click either `Inscriptions-Atlas.html` or `Kamarupa-Explorer.html` to open directly in Chrome, Firefox, Safari, or Edge.
2. **Local Static Server** (optional):
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`.

---

## 🧭 Historical & Cartographic Principles

1. **Modern Geography as Orientation, Not Ancient Borders**:
   Modern international borders, district polygons, and river courses serve purely as reference scaffolding. They do not represent ancient state boundaries.
2. **Provenance & Location Precision**:
   - Points mark published findspots, monuments, nearby modern towns, or user-supplied localities.
   - Coordinates with uncertainty or regional approximations are rendered with dashed rings.
   - Unlocated inscriptions remain accessible via the catalogue filter rather than being given speculative coordinates.
3. **Directional Anchors vs. Fabricated Points**:
   Textual markers lacking confirmed modern identifications (e.g., *Kañjagiri* in the north, *Dikṣu* in the east, or the southern *Brahmaputra–Lākṣā* confluence) are presented as **directional cues** rather than plotted as artificial map coordinates.
4. **Textual Evidence over Boundary Lines**:
   Ancient polities did not have surveyed Westphalian borders. The Four Pīṭhas are drawn as illustrative washes between river corridors (Karatoyā $\to$ Sankosh $\to$ Rupahi $\to$ Bharali $\to$ Dikrang) to reflect sacred geography as described in textual traditions, rather than rigid administrative borders.

---

## 📜 Data Sources & Attribution

- **Epigraphy**: M. M. Sharma, *Inscriptions of Ancient Assam* (Gauhati University, 1978), supplemented by *Epigraphia Indica*, reports of the Archaeological Survey of India (ASI), and Assam State Museum records.
- **Geography**: Country outlines derived from Natural Earth (Public Domain); Assam state and district boundaries derived from Survey of India / Census 2011 via DataMeet Community Maps (CC BY-SA 2.5 / ODbL); river paths integrated from local geographic surveys and historical satellite tracings.
