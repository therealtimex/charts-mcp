import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { launch } from "puppeteer";
import axios from "axios";

type MapTool = "generate_pin_map" | "generate_path_map" | "generate_district_map";

export async function geocodeAll(pois: string[]): Promise<Array<{ name: string; lat: number; lon: number }>> {
  const out: Array<{ name: string; lat: number; lon: number }> = [];
  for (const name of pois) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`;
      const res = await axios.get(url, { headers: { 'User-Agent': 'charts-mcp/1.0 (Nominatim usage for map rendering)' } });
      const first = Array.isArray(res.data) ? res.data[0] : undefined;
      if (first) out.push({ name, lat: Number(first.lat), lon: Number(first.lon) });
    } catch {
      // skip failures
    }
  }
  return out;
}

export async function fetchGeoJSONByName(name: string): Promise<{ name: string; geojson: any; bbox?: number[] } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&polygon_geojson=1&q=${encodeURIComponent(
      name,
    )}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "charts-mcp/1.0 (Nominatim usage for district map)",
      },
    });
    const first = Array.isArray(res.data) ? res.data[0] : undefined;
    if (!first || !first.geojson) return null;
    const bbox = first.boundingbox?.map((x: string) => Number(x));
    return { name, geojson: first.geojson, bbox };
  } catch {
    return null;
  }
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const bigint = Number.parseInt(m, 16);
  if (m.length === 6) {
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }
  // fallback gray
  return { r: 120, g: 120, b: 120 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => {
        const h = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("")
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateHex(c1: string, c2: string, t: number) {
  const A = hexToRgb(c1);
  const B = hexToRgb(c2);
  return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
}

export function buildDistrictMapHtml(input: any, width: number, height: number, payload: {
  region: { name: string; geojson: any; bbox?: number[] } | null;
  subs: Array<{ name: string; geojson: any; value?: string | number } >;
}): string {
  const region = payload.region;
  const subs = payload.subs;
  const title = String(input?.title || "");
  const colors: string[] = Array.isArray(input?.data?.colors) && input.data.colors.length > 0
    ? input.data.colors
    : ["#1783FF", "#FF80CA"]; // default gradient
  const dataType: string = String(input?.data?.dataType || "enum");
  const dataLabel: string = String(input?.data?.dataLabel || "");

  // prepare JS arrays
  const subsFeatures = subs
    .filter((s) => s && s.geojson)
    .map((s) => ({ name: s.name, geojson: s.geojson, value: s.value }))
  ;

  // center map
  const centerScript = (() => {
    if (region?.bbox && region.bbox.length >= 4) {
      // bbox: [south, north, west, east]
      const south = region.bbox[0];
      const north = region.bbox[1];
      const west = region.bbox[2];
      const east = region.bbox[3];
      return `const bounds = L.latLngBounds([${south}, ${west}], [${north}, ${east}]); map.fitBounds(bounds);`;
    }
    return `map.setView([48.8584, 2.2945], 6);`;
  })();

  const subsJson = JSON.stringify(subsFeatures);
  const regionJson = JSON.stringify(region?.geojson || null);

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title || "District Map"}</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style> html, body { margin: 0; padding: 0; } #map { width: ${width}px; height: ${height}px; } .legend { background: white; padding: 6px; line-height: 1.4; } .legend span { display: inline-block; width: 12px; height: 12px; margin-right: 6px; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        ${centerScript}

        const regionGeo = ${regionJson};
        if (regionGeo) {
          L.geoJSON(regionGeo, { style: { color: '#555', weight: 1, fillOpacity: 0.05 } }).addTo(map);
        }

        const subs = ${subsJson};
        const dataType = ${JSON.stringify(dataType)};
        const colors = ${JSON.stringify(colors)};
        const dataLabel = ${JSON.stringify(dataLabel)};

        function hexToRgb(hex){ hex=hex.replace('#',''); const bigint=parseInt(hex,16); return {r:(bigint>>16)&255,g:(bigint>>8)&255,b:bigint&255}; }
        function rgbToHex(r,g,b){ const toH=(v)=>{const h=Math.max(0,Math.min(255,Math.round(v))).toString(16); return h.length===1?'0'+h:h}; return '#'+toH(r)+toH(g)+toH(b); }
        function lerp(a,b,t){ return a+(b-a)*t; }
        function interpolateHex(c1,c2,t){ const A=hexToRgb(c1), B=hexToRgb(c2); return rgbToHex(lerp(A.r,B.r,t), lerp(A.g,B.g,t), lerp(A.b,B.b,t)); }

        if (dataType === 'enum') {
          const values = [...new Set(subs.map(s=>String(s.value||'')))];
          const palette = colors.length ? colors : ['#1783FF','#60C42D','#FF80CA','#F0884D'];
          const mapColor = (val) => { const idx = values.indexOf(String(val||'')); return palette[idx % palette.length]; };
          subs.forEach(s => {
            if (!s.geojson) return;
            L.geoJSON(s.geojson, { style: { color: '#333', weight: 1, fillOpacity: 0.5, fillColor: mapColor(s.value) } })
              .bindPopup((dataLabel?dataLabel+': ':'') + (s.value??''))
              .addTo(map);
          });

          // legend
          const legend = L.control({position:'bottomright'});
          legend.onAdd = function(){
            const div = L.DomUtil.create('div','legend');
            div.innerHTML = '<b>'+(dataLabel||'Legend')+'</b><br/>' + values.map((v,i)=>'<span style="background:'+mapColor(v)+'"></span>'+v).join('<br/>');
            return div;
          };
          legend.addTo(map);
        } else { // number
          const nums = subs.map(s=> Number(s.value || 0));
          const min = Math.min(...nums);
          const max = Math.max(...nums);
          const c1 = colors[0] || '#1783FF';
          const c2 = colors[colors.length-1] || '#FF80CA';
          const colorOf = (x) => {
            if (max === min) return c1;
            const t = (Number(x)-min)/(max-min);
            return interpolateHex(c1,c2, Math.max(0, Math.min(1, t)) );
          };
          subs.forEach(s => {
            if (!s.geojson) return;
            const fill = colorOf(s.value);
            L.geoJSON(s.geojson, { style: { color: '#333', weight: 1, fillOpacity: 0.55, fillColor: fill } })
              .bindPopup((dataLabel?dataLabel+': ':'') + (s.value??''))
              .addTo(map);
          });
        }
      </script>
    </body>
  </html>`;
}

export function buildMapHtmlForPinOrPath(points: Array<{ name: string; lat: number; lon: number }>, width: number, height: number, drawPath: boolean): string {
  const pointsStr = JSON.stringify(points);
  const center = points.length ? `[${points[0].lat}, ${points[0].lon}]` : `[48.8584, 2.2945]`;
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>charts-mcp map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style> html, body { margin: 0; padding: 0; } #map { width: ${width}px; height: ${height}px; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const points = ${pointsStr};
        const map = L.map('map').setView(${center}, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        const latlngs = [];
        points.forEach(p => {
          const m = L.marker([p.lat, p.lon]).addTo(map);
          m.bindPopup(p.name);
          latlngs.push([p.lat, p.lon]);
        });
        if (${drawPath ? 'true' : 'false'} && latlngs.length > 1) {
          const line = L.polyline(latlngs, { color: 'blue' }).addTo(map);
          map.fitBounds(line.getBounds());
        } else if (latlngs.length) {
          const group = L.featureGroup(latlngs.map(ll => L.marker(ll)));
          map.fitBounds(group.getBounds().pad(0.2));
        }
      </script>
    </body>
  </html>`;
}

export async function renderMapToFile(tool: MapTool, input: any, outDir: string): Promise<string> {
  const width = Number(input.width || 800);
  const height = Number(input.height || 600);

  let html = '';
  if (tool === 'generate_pin_map') {
    const pois: string[] = Array.isArray(input?.data) ? input.data : [];
    const pts = await geocodeAll(pois);
    html = buildMapHtmlForPinOrPath(pts, width, height, false);
  } else if (tool === 'generate_path_map') {
    const routes: Array<{ data: string[] }> = Array.isArray(input?.data) ? input.data : [];
    const flattened = routes.flatMap(r => r.data || []);
    const pts = await geocodeAll(flattened);
    html = buildMapHtmlForPinOrPath(pts, width, height, true);
  } else if (tool === 'generate_district_map') {
    const regionName: string = String(input?.data?.name || '');
    const region = regionName ? await fetchGeoJSONByName(regionName) : null;
    const subsInput: Array<{ name: string; dataValue?: string | number }> = Array.isArray(input?.data?.subdistricts) ? input.data.subdistricts : [];
    const subs: Array<{ name: string; geojson: any; value?: string | number }> = [];
    for (const s of subsInput) {
      const g = s?.name ? await fetchGeoJSONByName(s.name) : null;
      if (g && g.geojson) subs.push({ name: s.name, geojson: g.geojson, value: s.dataValue });
    }
    html = buildDistrictMapHtml(input, width, height, { region, subs });
  } else {
    throw new Error('Unsupported map tool');
  }

  const browser = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const id = crypto.randomBytes(8).toString('hex');
    const file = path.join(outDir, `${id}.png`);
    await page.screenshot({ path: file });
    return file;
  } finally {
    await browser.close();
  }
}
