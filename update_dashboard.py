"""Regenerate dashboard data files from flood_data.csv (master).

Usage (in this folder):
    py update_dashboard.py

What it does:
  1. Reads flood_data.csv (UTF-8 with BOM ok).
  2. Rewrites flood_data.json (same rows).
  3. Replaces const EMBEDDED_DATA=[...]; in dashboard.html AND index.html
     with the fresh rows (dashboard prefers embedded data, so this step
     is REQUIRED after any CSV edit).

After running: check `git diff --stat`, then commit + push.
GitHub Pages rebuilds automatically in ~1-2 min.
"""
import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
FIELDS = ['id', 'township_en', 'township_mm', 'village_en', 'village_mm',
          'vt_en', 'pcode', 'lat', 'lon', 'match_status', 'hazard_en',
          'hazard_mm', 'deaths', 'missing_trapped', 'displaced',
          'houses_damaged', 'houses_flooded', 'bridges_damaged',
          'needs_en', 'needs_mm', 'notes_en', 'notes_mm']


def main():
    with open(HERE / 'flood_data.csv', encoding='utf-8-sig') as f:
        rows = [dict(r) for r in csv.DictReader(f)]
    # drop fully-empty trailing rows (Excel often adds them)
    rows = [r for r in rows if (r.get('id') or '').strip()]
    for r in rows:
        for k in FIELDS:
            r.setdefault(k, '')
    with open(HERE / 'flood_data.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    blob = 'const EMBEDDED_DATA=' + json.dumps(rows, ensure_ascii=False) + ';'
    for name in ('dashboard.html', 'index.html'):
        p = HERE / name
        html = p.read_text(encoding='utf-8')
        new, n = re.subn(r'const EMBEDDED_DATA=.*?;\nlet LANG',
                         blob + '\nlet LANG', html, count=1, flags=re.S)
        if n != 1:
            raise SystemExit(f'pattern not found once in {name} (found {n})')
        p.write_text(new, encoding='utf-8')
    print(f'OK: {len(rows)} villages -> flood_data.json + EMBEDDED_DATA '
          f'in dashboard.html + index.html')


if __name__ == '__main__':
    main()
