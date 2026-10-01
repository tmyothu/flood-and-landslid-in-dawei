/* ============================================================
  Dawei Flood & Landslide GEE Web App
  ထားဝယ် ရေကြီး/တောင်ပြို GEE Web App (30 Sep 2026)
  Data source Credit: MAGGA Initiative | Geocode: MIMU v9.7
  ------------------------------------------------------------
  HOW TO USE:
  1. Upload gee_data/dawei_villages_points.geojson as an
     Earth Engine TABLE asset (Assets > New > Table upload >
     Shape files / GeoJSON). Keep UTF-8, CRS EPSG:4326.
  2. Copy your asset path below (ASSET_VILLAGES).
  3. Paste this whole script in https://code.earthengine.google.com
  4. Run. To publish: Apps > Publish new app (or Manage apps).
  Docs: see gee_data/README_GEE.md
  ============================================================ */

// ---------- 0. CONFIG: edit these ----------
var ASSET_VILLAGES = 'users/YOUR_USERNAME/dawei_villages_points';
// Fallback AOI (Dawei District, WGS84) — matches aoi_bbox.json
var AOI = ee.Geometry.Rectangle([97.91927, 13.37631, 98.58668, 14.25837]);
var OFFICIAL = {deaths: 40, missing: 20, displaced: 560,
  houses_damaged: 411, bridges: 15, houses_flooded: 393, villages: 64};

// ---------- 1. LOAD DATA ----------
var villages = ee.FeatureCollection(ASSET_VILLAGES);
print('Villages loaded:', villages.size());
print('Sample:', villages.limit(3));

// Style helpers
var HAZ_COLOR = {'Flood': '0284c7', 'Landslide': 'b45309', 'Both': '7c3aed'};
function hazClass(h) {
  h = ee.String(h);
  return ee.Algorithms.If(h.match('.*[Ll]andslide.*').length().gt(0),
    ee.Algorithms.If(h.match('.*[Ff]lood.*').length().gt(0), 'Both', 'Landslide'),
    'Flood');
}

// ---------- 2. SATELLITE CONTEXT LAYERS ----------
// Sentinel-2 latest pre/post (Sep 2026 window)
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(AOI).filterDate('2026-09-20', '2026-10-01')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40)).median().clip(AOI);
// Sentinel-1 flood proxy (VV low backscatter = water), Sep 2026
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(AOI).filterDate('2026-09-25', '2026-10-01')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')).mosaic().clip(AOI);
var vv = s1.select('VV');
var floodProxy = vv.lt(-15).selfMask(); // simple water/flood proxy
// JRC Global Surface Water occurrence (baseline water)
var jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').clip(AOI);
// CHIRPS rainfall Sep 2026 total
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterBounds(AOI).filterDate('2026-09-20', '2026-09-30').sum().clip(AOI);

// ---------- 3. MAP ----------
Map.centerObject(AOI, 9);
Map.setOptions('HYBRID');
Map.addLayer(jrc.updateMask(jrc.gt(50)),
  {min: 50, max: 100, palette: ['08306b']}, 'Baseline water (JRC)', false);
Map.addLayer(chirps, {min: 0, max: 400, palette: ['ffffcc', '41b6c4', '0c2c84']},
  'Rainfall Sep 20-30 (CHIRPS mm)', false);
Map.addLayer(s2, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000},
  'Sentinel-2 latest (true color)', false);
Map.addLayer(floodProxy, {palette: ['00FFFF']}, 'Flood proxy S1 VV<-15dB', true);

function styleVillages(fc) {
  var flood = fc.filter(ee.Filter.eq('haz_en', 'Flood'));
  var land = fc.filter(ee.Filter.stringContains('haz_en', 'Landslide'));
  // GEE paint needs an image template; use point buffers
  var paint = function(col, color) {
    var img = ee.Image().byte().paint(col, 1, 3);
    return img.visualize({palette: [color]});
  };
  return {flood: flood, land: land, paint: paint};
}
var st = styleVillages(villages);
Map.addLayer(st.paint(st.flood, HAZ_COLOR.Flood), {}, 'Villages: Flood (blue)');
Map.addLayer(st.paint(st.land, HAZ_COLOR.Landslide), {}, 'Villages: Landslide (orange)');
// Deaths-sized layer via point buffers scaled by deaths
var sized = villages.map(function(f) {
  var d = ee.Number(f.get('deaths'));
  return f.buffer(300 + d.multiply(400));
});
Map.addLayer(ee.Image().byte().paint(sized, 'deaths', 2)
  .visualize({min: 0, max: 10, palette: ['yellow', 'red']}),
  {}, 'Deaths intensity', false);

// ---------- 4. UI PANEL (bilingual) ----------
var LANG = 'mm'; // 'mm' | 'en'
var T = {
  title: {en: 'Dawei Flood & Landslide — GEE App (30 Sep 2026)',
          mm: 'ထားဝယ်ရေကြီး/တောင်ပြို — GEE App (၃၀ စက် ၂၀၂၆)'},
  credit: {en: 'Data source Credit: MAGGA Initiative | Geocode MIMU v9.7',
           mm: 'အချက်အလက်ရင်းမြစ်: MAGGA Initiative | Geocode MIMU v9.7'},
  township: {en: 'Township', mm: 'မြို့နယ်'},
  hazard: {en: 'Hazard', mm: 'ဘေး'},
  all: {en: 'All', mm: 'အားလုံး'},
  official: {en: 'Official totals (report)', mm: 'တရားဝင်စုစုပေါင်း (အစီရင်ခံစာ)'}
};

var panel = ui.Panel({style: {width: '360px'}});
var title = ui.Label('', {fontWeight: 'bold', fontSize: '15px'});
var credit = ui.Label('', {fontSize: '11px', color: '555'});
var metrics = ui.Label('', {fontSize: '12px', whiteSpace: 'pre'});
var info = ui.Label('Click a village point on the map for details.',
  {fontSize: '12px', color: '333'});
var chartPanel = ui.Panel();

var selTsp = ui.Select({
  items: ['All', 'Launglon', 'Thayetchaung', 'Dawei'],
  value: 'All', onChange: refresh});
var selHaz = ui.Select({
  items: ['All', 'Flood', 'Landslide'], value: 'All', onChange: refresh});
var langBtn = ui.Button({
  label: 'English / မြန်မာ',
  onClick: function() { LANG = (LANG === 'mm') ? 'en' : 'mm'; renderStatic(); refresh(); }
});

function renderStatic() {
  var L = LANG;
  title.setValue(T.title[L]);
  credit.setValue(T.credit[L]);
  var m = OFFICIAL;
  metrics.setValue(
    (L === 'en' ? 'Deaths 40+ | Missing 20+ | Displaced 560+\nHouses damaged 411+ | Flooded 393 | Bridges 15 | Villages 64'
                : 'သေဆုံး ၄၀+ | ပျောက် ၂၀+ | ရွှေ့ပြောင်း ၅၆၀+\nအိမ်ပျက် ၄၁၁+ | ရေမြုပ် ၃၉၃ | တံတား ၁၅ | ရွာ ၆၄'));
}
renderStatic();
panel.add(title).add(credit).add(langBtn)
  .add(ui.Label('Filter / စစ်ထုတ်ရန်', {fontWeight: 'bold'}))
  .add(ui.Label('Township / မြို့နယ်')).add(selTsp)
  .add(ui.Label('Hazard / ဘေး')).add(selHaz)
  .add(metrics).add(info).add(chartPanel);
ui.root.insert(0, panel);

function currentFilter() {
  var t = selTsp.getValue(), h = selHaz.getValue();
  var fc = villages;
  if (t && t !== 'All') fc = fc.filter(ee.Filter.eq('tsp_en', t));
  if (h && h !== 'All') {
    fc = (h === 'Flood') ? fc.filter(ee.Filter.eq('haz_en', 'Flood'))
                         : fc.filter(ee.Filter.stringContains('haz_en', 'Landslide'));
  }
  return fc;
}

var filteredLayer = null;
function refresh() {
  var fc = currentFilter();
  if (filteredLayer) { Map.remove(filteredLayer); filteredLayer = null; }
  var img = ee.Image().byte().paint(fc, 1, 4).visualize({palette: ['FF0000']});
  filteredLayer = ui.Map.Layer(img, {},
    'Filtered villages (' + selTsp.getValue() + '/' + selHaz.getValue() + ')');
  Map.add(filteredLayer);
  fc.size().evaluate(function(n) { info.setValue('Matched villages: ' + n + ' / 64'); });
  // Top-10 deaths chart
  var top = fc.sort('deaths', false).limit(10);
  var chart = ui.Chart.feature.byFeature(top, 'vil_en', 'deaths')
    .setChartType('ColumnChart').setOptions({title: 'Top deaths by village',
      legend: {position: 'none'}, hAxis: {slantedText: true}});
  chartPanel.clear(); chartPanel.add(chart);
}

// Inspector: click -> village details
Map.onClick(function(coords) {
  var pt = ee.Geometry.Point([coords.lon, coords.lat]);
  villages.filterBounds(pt.buffer(1500)).limit(1).evaluate(function(fc) {
    if (fc && fc.features && fc.features.length) {
      var p = fc.features[0].properties;
      info.setValue('★ ' + p.vil_mm + ' (' + p.vil_en + ')\n' +
        p.tsp_mm + ' | ' + p.haz_mm + '\n☠ ' + p.deaths + ' | 🏠 ' +
        p.hs_dmg + ' (+' + p.hs_fld + ' flooded) | Pcode ' + p.pcode);
    } else { info.setValue('No village within ~1.5km. Zoom in and try again.'); }
  });
});

print('GEE App ready. Publish via Apps > Publish new app.');
print('Credit: MAGGA Initiative | MIMU Pcodes v9.7 Jan 2026');
