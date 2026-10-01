# GEE Web App — `gee_data/` guide

Bilingual flood/landslide web app for Dawei District on Google Earth Engine.
Credit: **MAGGA Initiative** | Geocode: **MIMU Pcodes v9.7 (Jan 2026)**

## Folder contents

| File | Format | Purpose / upload |
|---|---|---|
| `dawei_villages_points.geojson` | GeoJSON, EPSG:4326, 64 pts | **Upload as EE Table asset** (primary) |
| `dawei_villages_table.csv` | CSV + Latitude/Longitude | Alt upload as EE Table asset |
| `township_summary.csv/.json` | Stats | Reference only (metrics in app) |
| `aoi_bbox.json` | WGS84 bbox | App AOI fallback |
| `gee_app.js` | GEE Code Editor JS | Paste & Run, then Publish app |
| `DATA_DICTIONARY.md` | Docs | Field definitions |

## 1. Upload asset (2 min)
1. https://code.earthengine.google.com → **Assets** → **New** → **Table upload** → **Select files**: `dawei_villages_points.geojson` (or CSV).
2. Name: `dawei_villages_points`. Keep defaults (UTF-8, EPSG:4326). Ingest.
3. Copy full path, e.g. `users/<you>/dawei_villages_points` → paste into `gee_app.js` as `ASSET_VILLAGES`.

## 2. Run app
1. Paste `gee_app.js` in Code Editor → **Run**.
2. Left panel: MM/EN toggle, Township + Hazard filters, official totals, top-deaths chart.
3. Map: filtered villages (red), Flood (blue) / Landslide (orange) layers, deaths intensity, Sentinel-2, Sentinel-1 flood proxy (VV < −15 dB), CHIRPS Sep 20–30 rainfall, JRC baseline water. Click any point for details (Burmese + English + Pcode).

## 3. Publish public web app
Code Editor → **Apps** → **Publish new app** → name `dawei-flood-gee` → Publish → share URL.
(Tip: keep asset **shared publicly** or app viewers get asset errors: Asset page → Share → Anyone can view.)

## Data notes
- 64 villages: Launglon 25, Thayetchaung 34, Dawei 5. 28 exact / 11 fuzzy / 25 township-centroid (field verify).
- Village sums vs report: deaths match (40); missing/displaced/houses differ slightly because PDF township minimums include unlisted cases — app shows official totals in panel + village values on click.
- Rainfall record: Dawei 27 Sep 11.02 in (280 mm).
- CRS: WGS84 everywhere. Burmese values are UTF-8 (`*_mm` fields); GEE property keys are ASCII (`vil_en`, `tsp_en`, `haz_en`, `deaths`, `hs_dmg`, `hs_fld`, `brg`, `pcode`, `match`).
