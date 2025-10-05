/**
 * Fishbone Diagram Builder (Ishikawa Diagram)
 * Custom SVG-based implementation for root cause analysis
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class FishboneDiagramBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    // No external libraries needed - pure SVG
    return '';
  }

  buildHtml(spec: ChartSpec): string {
    const width = spec.width || 800;
    const height = spec.height || 500;
    const data = JSON.stringify(spec.data || {});
    const title = JSON.stringify(spec.title || '');

    const chartScript = `<script>
  const spec = { data: ${data} };
  const pageTitle = ${title};
  const titleEl = document.getElementById('title');
  if (pageTitle && String(pageTitle).trim().length) {
    titleEl.textContent = pageTitle;
  } else {
    titleEl.style.display = 'none';
  }

  const svg = document.getElementById('svg');
  const W = ${width}, H = ${height};
  const spineY = Math.round(H / 2);
  const leftPad = 80, rightPad = 40;

  function line(x1, y1, x2, y2, opts = {}) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    e.setAttribute('x1', x1);
    e.setAttribute('y1', y1);
    e.setAttribute('x2', x2);
    e.setAttribute('y2', y2);
    e.setAttribute('stroke', opts.stroke || '#333');
    e.setAttribute('stroke-width', opts.strokeWidth || 2);
    svg.appendChild(e);
    return e;
  }

  function textLabel(x, y, text, anchor = 'start') {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', anchor);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  }

  // Draw spine (main horizontal line)
  line(leftPad, spineY, W - rightPad, spineY);

  // Draw root cause label
  const root = spec.data && spec.data.name ? String(spec.data.name) : '';
  if (root) {
    textLabel(leftPad - 8, spineY + 14, root, 'end');
  }

  // Draw bones (main categories)
  const bones = (spec.data && Array.isArray(spec.data.children)) ? spec.data.children : [];
  const n = bones.length || 1;
  let up = true;

  bones.forEach((b, i) => {
    const t = (i + 1) / (n + 1);
    const x = Math.round(leftPad + t * (W - leftPad - rightPad));
    const baseY = spineY;
    const length = Math.min(140, H * 0.35);
    const angleDeg = up ? -35 : 35;
    const rad = angleDeg * Math.PI / 180;
    const dx = Math.cos(rad) * length;
    const dy = Math.sin(rad) * length;
    const ex = Math.round(x + dx);
    const ey = Math.round(baseY + dy);

    // Draw main bone
    line(x, baseY, ex, ey);

    // Label main bone
    if (b && b.name) {
      textLabel(ex + 6, ey + (up ? -4 : 14), String(b.name));
    }

    // Draw sub-branches along this bone
    const subs = Array.isArray(b && b.children) ? b.children : [];
    subs.forEach((s, j) => {
      const tt = (j + 1) / (subs.length + 1);
      const ax = Math.round(x + dx * tt);
      const ay = Math.round(baseY + dy * tt);

      // Perpendicular small bone
      const len2 = 36;
      const vx = dx, vy = dy;
      const vlen = Math.max(1, Math.hypot(vx, vy));
      const nx = -vy / vlen, ny = vx / vlen;
      const sign = up ? -1 : 1;
      const px = Math.round(ax + nx * len2 * sign);
      const py = Math.round(ay + ny * len2 * sign);

      line(ax, ay, px, py, { strokeWidth: 1.5 });

      if (s && s.name) {
        textLabel(px + 6, py + (up ? -4 : 14), String(s.name));
      }

      // Third level (optional detail ticks)
      const subs2 = Array.isArray(s && s.children) ? s.children : [];
      subs2.forEach((tNode, k) => {
        const tt2 = (k + 1) / (subs2.length + 1);
        const bx = Math.round(ax + (px - ax) * tt2);
        const by = Math.round(ay + (py - ay) * tt2);
        const tick = 12;

        line(bx, by, bx + (up ? -tick : tick), by, { strokeWidth: 1 });

        if (tNode && tNode.name) {
          textLabel(
            bx + (up ? -tick - 2 : tick + 2),
            by + 4,
            String(tNode.name),
            up ? 'end' : 'start'
          );
        }
      });
    });

    up = !up;
  });
</script>`;

    return this.buildFishboneContainer(spec, chartScript);
  }

  private buildFishboneContainer(spec: ChartSpec, chartScript: string): string {
    const width = spec.width || 800;
    const height = spec.height || 500;

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(spec.title || 'Fishbone Diagram')}</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
      }
      #title {
        width: ${width}px;
        margin: 8px auto 0;
        font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
        color: #111;
        text-align: center;
      }
      #wrap {
        width: ${width}px;
        margin: 0 auto;
      }
      svg {
        display: block;
        width: ${width}px;
        height: ${height}px;
        background: #fff;
      }
      text {
        font: 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
        fill: #111;
      }
    </style>
  </head>
  <body>
    <div id="title"></div>
    <div id="wrap">
      <svg id="svg" viewBox="0 0 ${width} ${height}"></svg>
    </div>
    ${chartScript}
  </body>
</html>`;
  }
}
