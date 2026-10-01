# Dawei Flood & Landslide Dashboard — ထားဝယ်ရေကြီး/တောင်ပြိုဒက်ရှ်ဘုတ်

Interactive bilingual (Myanmar/English) dashboard for Dawei District floods & landslides, 30 Sep 2026.

**Live demo (after Pages enabled):** `https://<your-username>.github.io/<repo-name>/`

## Files
- `index.html` / `dashboard.html` — interactive dashboard (map, metrics, filters, MM/EN toggle)
- `flood_data.csv` — structured database, 64 villages (Launglon 25, Thayetchaung 34, Dawei 5)
- `flood_data.json` — same data as JSON
- `Dawei_flooding_data__30_Sep_-_9.40_Pm_update_.pdf` — source report

## Data sources
- Source report: Dawei flooding data 30 Sep 9:40PM PDF (14 pages)
- Geocoding: MIMU Place Codes v9.7 Jan 2026 — https://www.themimu.info/mm/place-codes
  - `Myanmar_PCodes_Release_9.7_Jan2026_Tanintharyi.xlsm` + GeoNode village points (1306 pts, WGS84)
  - Match: 28 exact, 11 fuzzy, 25 township_centroid (needs field verification)

## Summary (30 Sep 2026)
- Deaths 40+, Missing/trapped 20+, Displaced 560+, Houses damaged 411+, Bridges 15, Houses flooded 393
- Rainfall Dawei 27 Sep: 11.02 inch (280mm) record

## Run locally
Just open `index.html` in a browser (internet needed for map tiles). No build step.

## GitHub Pages (public link)
1. Push this folder to a public GitHub repo
2. Repo → Settings → Pages → Deploy from branch → `main` / `/ (root)` → Save
3. Open `https://<username>.github.io/<repo>/`

## License / Data use
- Code: MIT
- Data: compiled from field report + MIMU Pcodes. MIMU data: free with attribution, see https://themimu.info/mimu-terms-conditions. Verify with field teams before operational use — some locations are township centroids.
