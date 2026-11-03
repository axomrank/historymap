# Geography & Map Geometry

This folder contains the offline reference geography bundled for the Kāmarūpa historical map and atlas viewers.

All coordinates are `[latitude, longitude]`.

## Active Bundle

- **`atlas-geography.js`**:
  The compiled offline JavaScript bundle declaring `window.ATLAS_GEOGRAPHY`.
  - **`countries`**: Simplified boundaries of India and neighbouring countries (IND, BGD, NPL, BTN, MMR, CHN, LKA, PAK) derived from Natural Earth 1:10m admin-0 countries (Public Domain).
  - **`assam`**: Outer boundary outline dissolved from district polygons (Survey of India / Census 2011 via DataMeet Community Maps, CC BY-SA 2.5 / ODbL).
  - **`districts`**: 33 Assam district boundaries.
  - **`rivers`**: 41 river paths including the Brahmaputra, Dihing, Dikhow, plus Teesta/Karatoya and Sisi.

## Cartographic Note

Modern country and district outlines provide modern orientation and reference context only. They are not historical political boundaries of ancient Kāmarūpa.
