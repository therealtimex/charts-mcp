import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { launch } from "puppeteer";

type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "column"
  | "area"
  | "histogram"
  | "radar"
  | "liquid"
  | "dual-axes"
  | "fishbone-diagram"
  | "flow-diagram"
  | "network-graph"
  | "mind-map"
  | "organization-chart"
  | string;

export function buildChartHtml(type: ChartType, spec: any): string {
  const width = Number(spec.width || 600);
  const height = Number(spec.height || 400);
  const data = JSON.stringify(spec.data || []);
  const title = JSON.stringify(spec.title || "");
  const axisXTitle = JSON.stringify(spec.axisXTitle || "");
  const axisYTitle = JSON.stringify(spec.axisYTitle || "");
  const innerRadius = typeof spec.innerRadius === "number" ? spec.innerRadius : 0;

  // Special-case rendering for fishbone diagram
  if (type === "fishbone-diagram") {
    return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>charts-mcp fishbone</title>
        <style>
          html, body { margin: 0; padding: 0; }
          #title { width: ${width}px; margin: 8px auto 0; font: 600 16px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; color: #111; }
          #wrap { width: ${width}px; margin: 0 auto; }
          svg { display: block; width: ${width}px; height: ${height}px; background: #fff; }
          text { font: 12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; fill: #111; }
        </style>
      </head>
      <body>
        <div id="title"></div>
        <div id="wrap"><svg id="svg" viewBox="0 0 ${width} ${height}"></svg></div>
        <script>
          const spec = { data: ${data} };
          const pageTitle = ${title};
          const titleEl = document.getElementById('title');
          if (pageTitle && String(pageTitle).trim().length) { titleEl.textContent = pageTitle; } else { titleEl.style.display = 'none'; }

          const svg = document.getElementById('svg');
          const W = ${width}, H = ${height};
          const spineY = Math.round(H/2);
          const leftPad = 80, rightPad = 40;

          function line(x1,y1,x2,y2, opts={}) {
            const e = document.createElementNS('http://www.w3.org/2000/svg','line');
            e.setAttribute('x1', x1); e.setAttribute('y1', y1); e.setAttribute('x2', x2); e.setAttribute('y2', y2);
            e.setAttribute('stroke', opts.stroke || '#333');
            e.setAttribute('stroke-width', opts.strokeWidth || 2);
            svg.appendChild(e); return e;
          }
          function textLabel(x,y, text, anchor='start') {
            const t = document.createElementNS('http://www.w3.org/2000/svg','text');
            t.setAttribute('x', x); t.setAttribute('y', y);
            t.setAttribute('text-anchor', anchor);
            t.textContent = text; svg.appendChild(t); return t;
          }

          // Draw spine
          line(leftPad, spineY, W - rightPad, spineY);
          const root = spec.data && spec.data.name ? String(spec.data.name) : '';
          if (root) textLabel(leftPad - 8, spineY + 14, root, 'end');

          const bones = (spec.data && Array.isArray(spec.data.children)) ? spec.data.children : [];
          const n = bones.length || 1;
          let up = true;
          bones.forEach((b, i) => {
            const t = (i + 1) / (n + 1);
            const x = Math.round(leftPad + t * (W - leftPad - rightPad));
            const baseY = spineY;
            const length = Math.min(140, H * 0.35);
            const angleDeg = up ? -35 : 35; const rad = angleDeg * Math.PI / 180;
            const dx = Math.cos(rad) * length;
            const dy = Math.sin(rad) * length;
            const ex = Math.round(x + dx), ey = Math.round(baseY + dy);
            line(x, baseY, ex, ey);
            if (b && b.name) textLabel(ex + (up?6:6), ey + (up?-4:14), String(b.name));

            // Sub-branches along this bone
            const subs = Array.isArray(b && b.children) ? b.children : [];
            subs.forEach((s, j) => {
              const tt = (j + 1) / (subs.length + 1);
              const ax = Math.round(x + dx * tt);
              const ay = Math.round(baseY + dy * tt);
              // Perpendicular small bone
              const len2 = 36; // small bone length
              const vx = dx, vy = dy; const vlen = Math.max(1, Math.hypot(vx, vy));
              // Perp vector
              let nx = -vy / vlen, ny = vx / vlen;
              const sign = up ? -1 : 1;
              const px = Math.round(ax + nx * len2 * sign);
              const py = Math.round(ay + ny * len2 * sign);
              line(ax, ay, px, py, { strokeWidth: 1.5 });
              if (s && s.name) textLabel(px + (up?6:6), py + (up?-4:14), String(s.name));

              // Third level (optional) as ticks
              const subs2 = Array.isArray(s && s.children) ? s.children : [];
              subs2.forEach((tNode, k) => {
                const tt2 = (k + 1) / (subs2.length + 1);
                const bx = Math.round(ax + (px - ax) * tt2);
                const by = Math.round(ay + (py - ay) * tt2);
                const tick = 12;
                line(bx, by, bx + (up? -tick: tick), by, { strokeWidth: 1 });
                if (tNode && tNode.name) textLabel(bx + (up? -tick-2: tick+2), by + 4, String(tNode.name), up? 'end':'start');
              });
            });
            up = !up;
          });
        </script>
      </body>
    </html>`;
  }

  // Special-case rendering for flow diagram using G6 (v4 dagre layout)
  if (type === "flow-diagram") {
    return `<!doctype html>
    <html>
      <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
        <title>charts-mcp flow</title>
        <style>
          html, body { margin: 0; padding: 0; }
          #title { width: ${width}px; margin: 8px auto 0; font: 600 16px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; color: #111; }
          #wrap { width: ${width}px; margin: 0 auto; }
          #graph { width: ${width}px; height: ${height}px; background: #fff; }
        </style>
      </head>
      <body>
        <div id=\"title\"></div>
        <div id=\"wrap\"><div id=\"graph\"></div></div>
        <script>
          const spec = { data: ${data} };
          const pageTitle = ${title};
          const titleEl = document.getElementById('title');
          if (pageTitle && String(pageTitle).trim().length) { titleEl.textContent = pageTitle; } else { titleEl.style.display = 'none'; }

          const W = ${width}, H = ${height};
          const rawNodes = Array.isArray(spec.data && spec.data.nodes) ? spec.data.nodes : [];
          const rawEdges = Array.isArray(spec.data && spec.data.edges) ? spec.data.edges : [];
          const nodes = rawNodes.filter(n => n && n.name).map(n => ({ id: String(n.name), label: String(n.name) }));
          const idSet = new Set(nodes.map(n => n.id));
          const edges = rawEdges.filter(e => e && idSet.has(String(e.source)) && idSet.has(String(e.target))).map(e => ({ source: String(e.source), target: String(e.target), label: e.name ? String(e.name) : '' }));
          function loadScript(src) {
            return new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = src; s.async = true;
              s.onload = () => resolve();
              s.onerror = (e) => reject(e);
              document.head.appendChild(s);
            });
          }

          function renderWith(G) {
            try {
              const graph = new G.Graph({
                container: 'graph',
                width: W,
                height: H,
                layout: { type: 'dagre', rankdir: 'LR', nodesep: 30, ranksep: 60 },
                defaultNode: {
                  type: 'rect',
                  size: [140, 36],
                  style: { radius: 6, stroke: '#333', fill: '#f8f9fb' },
                  labelCfg: { style: { fill: '#111', fontSize: 12 } }
                },
                defaultEdge: {
                  type: 'polyline',
                  style: { stroke: '#666', endArrow: true },
                  labelCfg: { autoRotate: true, style: { fill: '#555', fontSize: 11 } }
                },
                modes: { default: ['drag-canvas', 'zoom-canvas'] },
                fitView: true,
                fitViewPadding: 20
              });
              graph.data({ nodes, edges });
              graph.render();
              return true;
            } catch (e) {
              return false;
            }
          }

          (async function main() {
            let ok = false;
            // Try G6 v5
            try { await loadScript('https://cdn.jsdelivr.net/npm/@antv/g6@5.0.49/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch (e) {}
            // Fallback to G6 v4 if v5 fails (e.g., missing dagre layout)
            if (!ok) {
              try { await loadScript('https://gw.alipayobjects.com/os/lib/antv/g6/4.8.21/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch (e) {}
            }
            if (!ok) {
              const el = document.getElementById('graph');
              el.innerHTML = '<div style="padding:12px;color:#c00;font:13px/1.4 monospace">Failed to load G6 renderer.</div>';
            }
          })();
        </script>
      </body>
    </html>`;
  }

  // Special-case rendering for network graph using G6 (positions precomputed; no layout plugin required)
  if (type === "network-graph") {
    return `<!doctype html>
    <html>
      <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
        <title>charts-mcp network</title>
        <style>
          html, body { margin: 0; padding: 0; }
          #title { width: ${width}px; margin: 8px auto 0; font: 600 16px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; color: #111; }
          #wrap { width: ${width}px; margin: 0 auto; }
          #graph { width: ${width}px; height: ${height}px; background: #fff; }
        </style>
      </head>
      <body>
        <div id=\"title\"></div>
        <div id=\"wrap\"><div id=\"graph\"></div></div>
        <script>
          const spec = { data: ${data} };
          const pageTitle = ${title};
          const titleEl = document.getElementById('title');
          if (pageTitle && String(pageTitle).trim().length) { titleEl.textContent = pageTitle; } else { titleEl.style.display = 'none'; }

          const W = ${width}, H = ${height};
          const rawNodes = Array.isArray(spec.data && spec.data.nodes) ? spec.data.nodes : [];
          const rawEdges = Array.isArray(spec.data && spec.data.edges) ? spec.data.edges : [];
          let nodes = rawNodes.filter(n => n && n.name).map(n => ({ id: String(n.name), label: String(n.name) }));
          const idSet = new Set(nodes.map(n => n.id));
          const edges = rawEdges.filter(e => e && idSet.has(String(e.source)) && idSet.has(String(e.target))).map(e => ({ source: String(e.source), target: String(e.target), label: e.name ? String(e.name) : '' }));

          // Precompute circular positions
          const cx = W/2, cy = H/2; const r = Math.max(60, Math.min(W,H)/2 - 60);
          const N = nodes.length || 1;
          nodes = nodes.map((n, i) => {
            const ang = (i / N) * Math.PI * 2;
            n.x = Math.round(cx + r * Math.cos(ang));
            n.y = Math.round(cy + r * Math.sin(ang));
            return n;
          });

          function loadScript(src) { return new Promise((res, rej) => { const s=document.createElement('script'); s.src=src; s.onload=()=>res(); s.onerror=rej; document.head.appendChild(s); }); }
          function renderWith(G) {
            try {
              const graph = new G.Graph({
                container: 'graph', width: W, height: H,
                layout: false,
                defaultNode: { type: 'circle', size: 28, style: { stroke: '#333', fill: '#f8f9fb' }, labelCfg: { style: { fill:'#111', fontSize: 12 } } },
                defaultEdge: { type: 'line', style: { stroke:'#666', endArrow: true }, labelCfg: { style: { fill:'#555', fontSize: 11 } } },
                modes: { default: ['drag-canvas','zoom-canvas'] }, fitView: true, fitViewPadding: 20
              });
              graph.data({ nodes, edges }); graph.render(); return true;
            } catch(e) { return false; }
          }

          (async function main(){
            let ok=false;
            try { await loadScript('https://cdn.jsdelivr.net/npm/@antv/g6@5.0.49/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch(e) {}
            if (!ok) { try { await loadScript('https://gw.alipayobjects.com/os/lib/antv/g6/4.8.21/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch(e) {} }
            if (!ok) document.getElementById('graph').innerHTML='<div style="padding:12px;color:#c00;font:13px/1.4 monospace">Failed to load G6 renderer.</div>';
          })();
        </script>
      </body>
    </html>`;
  }

  // Special-case rendering for mind-map using G6 with simple tree layout (no plugin)
  if (type === "mind-map" || type === "organization-chart") {
    return `<!doctype html>
    <html>
      <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
        <title>charts-mcp tree</title>
        <style>
          html, body { margin: 0; padding: 0; }
          #title { width: ${width}px; margin: 8px auto 0; font: 600 16px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; color: #111; }
          #wrap { width: ${width}px; margin: 0 auto; }
          #graph { width: ${width}px; height: ${height}px; background: #fff; }
        </style>
      </head>
      <body>
        <div id=\"title\"></div>
        <div id=\"wrap\"><div id=\"graph\"></div></div>
        <script>
          const spec = { data: ${data} };
          const pageTitle = ${title};
          const titleEl = document.getElementById('title');
          if (pageTitle && String(pageTitle).trim().length) { titleEl.textContent = pageTitle; } else { titleEl.style.display = 'none'; }

          const W = ${width}, H = ${height};
          const root = spec.data && spec.data.name ? spec.data : null;

          function buildNodesEdges(root) {
            const nodes = []; const edges = [];
            function visit(n, parentId) {
              const id = String(n.name);
              nodes.push({ id, label: id });
              if (parentId) edges.push({ source: parentId, target: id });
              if (Array.isArray(n.children)) n.children.forEach(c => visit(c, id));
            }
            if (root) visit(root, null);
            return { nodes, edges };
          }

          function computeTreePositions(nodes, edges, orientation) {
            const children = new Map(); const parent = new Map(); const ids = new Set(nodes.map(n=>n.id));
            ids.forEach(id=>children.set(id, []));
            edges.forEach(e=>{ if (ids.has(e.source) && ids.has(e.target)) { children.get(e.source).push(e.target); parent.set(e.target, e.source); } });
            // find root (node with no parent)
            let rootId = nodes[0] && nodes[0].id;
            for (const n of nodes) { if (!parent.has(n.id)) { rootId = n.id; break; } }
            const depth = new Map(); const order = [];
            (function dfs(id, d){ depth.set(id,d); order.push(id); (children.get(id)||[]).forEach(c=>dfs(c, d+1)); })(rootId, 0);
            const maxDepth = Math.max(...Array.from(depth.values()));
            const levels = Array.from({length:maxDepth+1}, ()=>[]);
            order.forEach(id=>{ levels[depth.get(id)].push(id); });
            const pad = {top:40,left:40,right:40,bottom:40};
            const usableW = Math.max(1, W - pad.left - pad.right);
            const usableH = Math.max(1, H - pad.top - pad.bottom);
            if (orientation === 'TB') {
              const dx = Math.max(140, usableW / Math.max(1, levels.reduce((m,a)=>Math.max(m,a.length),0)));
              const dy = Math.max(80, usableH / Math.max(1, levels.length));
              levels.forEach((arr, d)=>{
                const y = pad.top + d * dy;
                const spacing = arr.length>1 ? (usableW/(arr.length+1)) : usableW/2;
                arr.forEach((id, i)=>{
                  const x = pad.left + (i+1)*spacing;
                  const n = nodes.find(n=>n.id===id); if (n) { n.x = Math.round(x); n.y = Math.round(y); }
                });
              });
            } else { // LR
              const dx = Math.max(160, usableW / Math.max(1, levels.length-1));
              const dyBase = 60;
              levels.forEach((arr, d)=>{
                const x = pad.left + d * dx;
                const spacing = arr.length>0 ? Math.max(dyBase, usableH/(arr.length+1)) : dyBase;
                arr.forEach((id, i)=>{
                  const y = pad.top + (i+1)*spacing;
                  const n = nodes.find(n=>n.id===id); if (n) { n.x = Math.round(x); n.y = Math.round(y); }
                });
              });
            }
          }

          const { nodes, edges } = buildNodesEdges(root || { name: 'Root', children: [] });
          // Orientation: mind-map => LR, organization-chart => TB
          const orientation = ${type === 'organization-chart' ? `'TB'` : `'LR'`};
          computeTreePositions(nodes, edges, orientation);

          function loadScript(src) { return new Promise((res, rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>res(); s.onerror=rej; document.head.appendChild(s); }); }
          function renderWith(G) {
            try {
              const graph = new G.Graph({
                container: 'graph', width: W, height: H, layout: false,
                defaultNode: { type: 'rect', size: [140, 32], style: { radius: 6, stroke: '#333', fill: '#f8f9fb' }, labelCfg: { style: { fill:'#111', fontSize: 12 } } },
                defaultEdge: { type: 'polyline', style: { stroke:'#666', endArrow: true } },
                modes: { default: ['drag-canvas','zoom-canvas'] }, fitView: true, fitViewPadding: 20
              });
              graph.data({ nodes, edges }); graph.render(); return true;
            } catch(e) { return false; }
          }

          (async function main(){
            let ok=false;
            try { await loadScript('https://cdn.jsdelivr.net/npm/@antv/g6@5.0.49/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch(e) {}
            if (!ok) { try { await loadScript('https://gw.alipayobjects.com/os/lib/antv/g6/4.8.21/dist/g6.min.js'); ok = !!(window.G6 && renderWith(window.G6)); } catch(e) {} }
            if (!ok) document.getElementById('graph').innerHTML='<div style="padding:12px;color:#c00;font:13px/1.4 monospace">Failed to load G6 renderer.</div>';
          })();
        </script>
      </body>
    </html>`;
  }

  // Map our type to G2Plot chart constructor
  const ctor = (() => {
    switch (type) {
      case "bar":
        return "G2Plot.Bar"; // horizontal bars
      case "line":
        return "G2Plot.Line";
      case "pie":
        return "G2Plot.Pie";
      case "area":
        return "G2Plot.Area";
      case "histogram":
        return "G2Plot.Histogram";
      case "radar":
        return "G2Plot.Radar";
      case "liquid":
        return "G2Plot.Liquid";
      case "column":
        return "G2Plot.Column";
      case "dual-axes":
        return "G2Plot.DualAxes";
      default:
        return "G2Plot.Column";
    }
  })();

  const chartType = JSON.stringify(type);

  // Simple HTML page to render chart using G2Plot CDN
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>charts-mcp render</title>
      <style>
        html, body { margin: 0; padding: 0; }
        #container { width: ${width}px; height: ${height}px; margin: 0 auto; }
        #title { width: ${width}px; margin: 8px auto 0; font: 600 16px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; color: #111; }
      </style>
      <script src="https://unpkg.com/@antv/g2plot@latest/dist/g2plot.min.js"></script>
    </head>
    <body>
      <div id="title"></div>
      <div id="container"></div>
      <script>
        const data = ${data};
        const options = { data, theme: ${JSON.stringify(spec.theme || "default")} };
        const type = ${chartType};
        const specCategories = ${JSON.stringify(spec.categories || [])};
        const specSeries = ${JSON.stringify(spec.series || [])};
        // Base fields per chart type
        if (type === 'bar') {
          Object.assign(options, { xField: 'value', yField: 'category' });
        } else if (type === 'column') {
          Object.assign(options, { xField: 'category', yField: 'value' });
        } else if (type === 'line') {
          Object.assign(options, { xField: 'time', yField: 'value', smooth: true });
        } else if (type === 'pie') {
          Object.assign(options, { angleField: 'value', colorField: 'category', innerRadius: ${innerRadius} });
        } else if (type === 'area') {
          Object.assign(options, { xField: 'time', yField: 'value' });
        } else if (type === 'histogram') {
          if (${typeof ({} as any) !== 'undefined'}) { /* noop to keep template consistent */ }
          if (${String(!!('binNumber' in (spec || {})))} ) { options.binNumber = ${Number(spec.binNumber || 0)} || undefined; }
        } else if (type === 'radar') {
          Object.assign(options, { xField: 'name', yField: 'value' });
          const lw = ${Number(spec.style?.lineWidth || 0)};
          if (lw) options.lineStyle = { lineWidth: lw };
          options.point = Object.assign({}, options.point, { size: 3 });
        } else if (type === 'liquid') {
          Object.assign(options, { percent: Number(${JSON.stringify(spec.percent ?? 0)}), shape: ${JSON.stringify(spec.shape || 'circle')} });
        } else if (type === 'dual-axes') {
          // Build data for dual-axes from categories + series arrays
          const categories = specCategories;
          const series = specSeries;
          const col = Array.isArray(series) ? series.find(s => s && s.type === 'column') : null;
          const line = Array.isArray(series) ? series.find(s => s && s.type === 'line') : null;
          const colData = categories.map((c, i) => ({ category: c, colValue: (col && Array.isArray(col.data)) ? col.data[i] : null }));
          const lineData = categories.map((c, i) => ({ category: c, lineValue: (line && Array.isArray(line.data)) ? line.data[i] : null }));
          Object.assign(options, {
            data: [colData, lineData],
            xField: 'category',
            yField: ['colValue','lineValue'],
            geometryOptions: [
              { geometry: 'column' },
              { geometry: 'line' }
            ],
          });
          // Per-axis titles from series definitions
          const y1 = col && col.axisYTitle ? String(col.axisYTitle) : '';
          const y2 = line && line.axisYTitle ? String(line.axisYTitle) : '';
          options.yAxis = options.yAxis || {};
          if (y1) options.yAxis['colValue'] = { title: { text: y1 } };
          if (y2) options.yAxis['lineValue'] = { title: { text: y2 } };
        } else {
          Object.assign(options, { xField: 'category', yField: 'value' });
        }

        // Series/stack only when group present
        const hasGroup = Array.isArray(data) && data.some(d => d && d.group != null) || ${
          spec.group === true ? "true" : "false"
        };
        if (hasGroup && (type === 'bar' || type === 'column' || type === 'area' || type === 'line' || type === 'radar')) {
          options.seriesField = 'group';
          options.isStack = ${spec.stack === true ? "true" : "false"};
        } else if (type !== 'pie' && type !== 'dual-axes' && type !== 'liquid') {
          options.isStack = false;
        }

        // Palette/colors and per-category coloring when no group is present
        const palette = ${JSON.stringify(spec.style?.palette || [])};
        const defaultPalette = ['#5B8FF9','#5AD8A6','#5D7092','#F6BD16','#E8684A','#6DC8EC','#9270CA','#FF9D4D','#269A99','#FF99C3'];
        if (type === 'dual-axes') {
          // Assign colors for column/line if palette provided
          const colors = (Array.isArray(palette) && palette.length ? palette : defaultPalette);
          options.geometryOptions = options.geometryOptions || [];
          if (options.geometryOptions[0]) options.geometryOptions[0].color = colors[0];
          if (options.geometryOptions[1]) options.geometryOptions[1].color = colors[1] || colors[0];
        } else if (hasGroup) {
          // Multiple series: use palette array (or leave to theme)
          if (Array.isArray(palette) && palette.length) options.color = palette;
        } else if (type === 'bar' || type === 'column') {
          // Color by category for single-series bar/column
          const categories = Array.isArray(data) ? Array.from(new Set(data.map(d => d && d.category))) : [];
          const colors = (Array.isArray(palette) && palette.length ? palette : defaultPalette);
          options.color = (datum) => {
            const idx = Math.max(0, categories.indexOf(datum.category));
            return colors[idx % colors.length];
          };
        } else if (type === 'pie') {
          // Use palette order for slices
          if (Array.isArray(palette) && palette.length) options.color = palette;
        } else if (type === 'line') {
          // Single-series line: keep line color from palette[0] if provided; color points by time
          if (Array.isArray(palette) && palette.length) {
            options.color = palette[0];
            const times = Array.isArray(data) ? Array.from(new Set(data.map(d => d && d.time))) : [];
            const colors = palette.length ? palette : defaultPalette;
            options.point = Object.assign({}, options.point, { size: 3, shape: 'circle', color: (datum) => {
              const idx = Math.max(0, times.indexOf(datum.time));
              return colors[idx % colors.length];
            }});
          }
        } else if (type === 'histogram') {
          // Color by bin range for histogram
          const colors = (Array.isArray(palette) && palette.length ? palette : defaultPalette);
          const seen = new Map(); let i = 0;
          options.color = (datum) => {
            const key = (datum && (datum.range || datum.bin || datum.x)) ?? '';
            if (!seen.has(key)) { seen.set(key, colors[i % colors.length]); i++; }
            return seen.get(key);
          };
        } else if (type === 'liquid') {
          // Single color for liquid (use style.color or first palette color)
          const color = ${JSON.stringify(spec.style?.color || '')};
          if (color) options.color = color; else if (Array.isArray(palette) && palette.length) options.color = palette[0];
        }

        // Background color
        const bg = ${JSON.stringify(spec.style?.backgroundColor || "")};
        if (bg) { document.body.style.background = bg; }
        // Axis titles when applicable
        const xTitle = ${axisXTitle};
        const yTitle = ${axisYTitle};
        if (xTitle) options.xAxis = Object.assign({}, options.xAxis, { title: { text: xTitle } });
        if (yTitle) options.yAxis = Object.assign({}, options.yAxis, { title: { text: yTitle } });

        // Page title
        const pageTitle = ${title};
        const titleEl = document.getElementById('title');
        if (pageTitle && String(pageTitle).trim().length) {
          titleEl.textContent = pageTitle;
          titleEl.style.display = 'block';
        } else {
          titleEl.style.display = 'none';
        }
        const plot = new ${ctor}(document.getElementById('container'), options);
        plot.render();
      </script>
    </body>
  </html>`;
}

export async function renderChartToFile(type: ChartType, spec: any, outDir: string): Promise<string> {
  const html = buildChartHtml(type, spec);
  const browser = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: Number(spec.width || 600), height: Number(spec.height || 400) });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const id = crypto.randomBytes(8).toString('hex');
    const file = path.join(outDir, `${id}.png`);
    await page.screenshot({ path: file });
    return file;
  } finally {
    await browser.close();
  }
}
