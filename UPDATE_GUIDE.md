# Update guide — how to update villages, figures & info
ဒက်ရှ်ဘုတ်ပြင်ဆင်နည်း (အဆင့်ဆင့်)

Master file: **`flood_data.csv`** — always edit this first.
Then run the script, then push. GitHub Pages updates itself in ~1–2 min.

## 0. Files map

| File | Role | Edit by hand? |
|---|---|---|
| `flood_data.csv` | **Master data** — all 64 villages | ✅ YES, this is where you edit |
| `update_dashboard.py` | Regenerates JSON + embedded dashboard data | No (just run it) |
| `flood_data.json` | Auto-generated from CSV | No — auto |
| `dashboard.html` / `index.html` | Dashboard (data embedded as `EMBEDDED_DATA`) | Only header/date/summary/footer (see §3) |
| `gee_data/` | GEE web-app copy (separate repo) | See §5 |

> ⚠️ The dashboard reads **embedded data first** (`EMBEDDED_DATA` inside the
> HTML). Editing only the CSV without running the script will NOT change the
> live dashboard. Always run `py update_dashboard.py` after a CSV edit.

## 1. Edit a village's figures (most common)

1. Open `flood_data.csv` in **Excel / LibreOffice / Google Sheets**.
   Keep encoding **UTF-8** (Excel: Save As → CSV UTF-8).
2. Find the row by `id` or `village_en` (e.g. `Ti Zit`).
3. Edit the number columns (leave blank = unknown, never type text in them):
   `deaths, missing_trapped, displaced, houses_damaged, houses_flooded, bridges_damaged`
   Edit text columns as needed: `village_mm, hazard_en/_mm, needs_en/_mm, notes_en/_mm`.
4. Save, then run:
   `py update_dashboard.py` → expect `OK: 64 villages ...`
5. Check locally: open `dashboard.html` in a browser (map + table should show new numbers).
6. Publish:
   `git add -A` → `git commit -m "Update Ti Zit figures"` → `git push origin main`

## 2. Add a new village

1. In `flood_data.csv`, append a row with the **next `id`** (65, 66, …).
   Required: `id, township_en, township_mm, village_en, village_mm, lat, lon`.
2. Coordinates: get from MIMU (see §4). No GPS yet? Use the township
   capital as placeholder AND set `match_status = township_centroid`
   (Launglon ≈ 13.99/98.17, Thayetchaung ≈ 13.54/98.40, Dawei ≈ 14.08/98.20).
3. `hazard_en` must contain the word **Flood** and/or **Landslide**
   (map color + filter depend on it). Mirror it in `hazard_mm`
   (ရေကြီး / တောင်ပြို).
4. Run `py update_dashboard.py`, check, commit, push (same as §1 steps 4–6).

## 3. Update header figures, date & footer (by hand in HTML)

Top metric cards are **hand-edited** (official report totals, not auto-sums).
Apply the same edit to **both** `dashboard.html` and `index.html`:

| What | Where | Example |
|---|---|---|
| Report date in title | line ~42, `data-en` + `data-mm` + inner text | `(30 Sep 2026)` → `(05 Oct 2026)` |
| Subtitle source line | line ~43 | `... 30 Sep 9:40PM PDF` → new source |
| Metric totals | line ~87 `const summary={deaths:40,...}` | `deaths:40` → `deaths:45` etc. |
| Village/township counts | `renderMetrics()`: `'64'` / `'3'` | bump after adding villages |
| Rainfall / needs line | footer ~line 77 | new rainfall, needs |
| Credit | footer | keep `MAGGA Initiative` |

Then commit + push (no script needed for these).

## 4. Match a new location to MIMU (Pcode + GPS)

1. Look up the village in MIMU Pcodes v9.7 Tanintharyi file or
   https://www.themimu.info/mm/place-codes (check Township + Village Tract too).
2. Fill `vt_en`, `pcode` (e.g. `177147`), exact `lat`/`lon` from MIMU/GeoNode.
3. Set `match_status`: `exact` (name+township match) / `fuzzy` (spelling close,
   note variant in `notes_en`) / `township_centroid` (temporary, needs field check).
4. Run script → check popup on map shows Pcode → commit + push.

## 5. Also update the GEE web app (optional)

The GEE repo (`dawei_flood_landslide_gee_webapp`) has its own copies:
1. Copy fresh `flood_data.csv` → GEE repo as `dawei_villages_table.csv`
   (keep `Latitude`/`Longitude` columns), or re-export GeoJSON the same way.
2. If you edited figures only, re-upload the Table asset in
   code.earthengine.google.com (same asset name overwrites) — `gee_app.js`
   needs no change. If you changed columns, mirror them in `gee_app.js`.
3. Commit + push GEE repo. Re-publish the EE App if the asset ID changed.

## 6. Full checklist (copy-paste commands)

```powershell
# in mmgga folder
py update_dashboard.py
# open dashboard.html, verify map/table/metrics
git add -A
git commit -m "Update <what changed>"
git push origin main
# wait ~2 min → https://tmyothu.github.io/flood-and-landslid-in-dawei/
```

Burmese font broken after Excel save? Re-save as **CSV UTF-8** (not plain CSV)
and re-run the script. Still broken → tell me the village id and new values,
I can apply the edit directly.
