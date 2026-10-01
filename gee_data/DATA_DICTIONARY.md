# Data dictionary — Dawei villages (GEE + GitHub Pages shared)

CRS: EPSG:4326 (WGS84). Encoding: UTF-8.

| Key (GEE) | CSV column | Type | Example | Notes |
|---|---|---|---|---|
| id | id | int | 23 | 1–64, PDF order |
| tsp_en | township_en | string | Launglon | Launglon / Thayetchaung / Dawei |
| tsp_mm | township_mm | string-MM | လောင်းလုံး | Burmese township |
| vil_en | village_en | string | Ti Zit | MIMU transliteration (matched) |
| vil_mm | village_mm | string-MM | တီဇစ် | Burmese name |
| pcode | pcode | string | 177147 | MIMU village Pcode v9.7; empty if centroid |
| match | match_status | enum | exact/fuzzy/township_centroid | Geocode confidence |
| haz_en | hazard_en | string | Flood / Landslide… | Flood, Landslide, Flood+landslide |
| haz_mm | hazard_mm | string-MM | ရေကြီး | Burmese hazard |
| deaths | deaths | int | 2 | 0 if unknown |
| missing | missing_trapped | int | 5 | Missing/trapped |
| displaced | displaced | int | 500 | IDP/displaced |
| hs_dmg | houses_damaged | int | 18 | Destroyed/damaged |
| hs_fld | houses_flooded | int | 200 | Inundated (Thayetchaung) |
| brg | bridges_damaged | int | 1 | Bridges |
| needs_en/needs_mm | needs_en/needs_mm | string | Rescue… | Needs |
| Latitude/Longitude | lat/lon | float | 13.90/98.17 | WGS84 (CSV: Latitude, Longitude) |

Official report totals (panel): deaths 40+, missing 20+, displaced 560+, houses damaged 411+, flooded 393, bridges 15.
Credit: MAGGA Initiative. Geocode: MIMU v9.7 Jan 2026 (https://www.themimu.info/mm/place-codes).
