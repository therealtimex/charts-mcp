import express, { type Request, type Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { buildChartHtml, renderChartToFile } from "./chart";
import { buildMapHtmlForPinOrPath, buildDistrictMapHtml, geocodeAll, fetchGeoJSONByName, renderMapToFile } from "./map";

let started = false;
let serverPort: number | undefined;
let startPromise: Promise<void> | undefined;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getRendererPort(): number | undefined {
  return serverPort;
}

export function startRendererServer(port = Number(process.env.RENDER_PORT) || 3210): Promise<void> {
  if (started && startPromise) return startPromise;
  if (started) return Promise.resolve();
  started = true;

  startPromise = new Promise<void>((resolve) => {

  const app = express();
  app.use(express.json({ limit: "2mb" }));

  const cacheDir = path.resolve(".cache", "renderer");
  ensureDir(cacheDir);
  const pagesDir = path.join(cacheDir, "pages");
  ensureDir(pagesDir);

  // Serve cached assets
  app.use("/assets", express.static(cacheDir, { maxAge: "1h" }));
  app.use("/pages", express.static(pagesDir, { maxAge: 0 }));

  // Health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Chart rendering: conforms to VIS_REQUEST_SERVER contract
  app.post("/chart", async (req: Request, res: Response) => {
    try {
      const { type, format, ...options } = req.body || {};
      if (!type) return res.json({ success: false, errorMessage: "missing chart type" });
      const base = process.env.RENDER_PUBLIC_BASE || `http://localhost:${serverPort}`;
      const fmt = String(format || process.env.RENDER_FORMAT || (process.env.RENDER_INTERACTIVE ? 'html' : '')).toLowerCase();
      if (fmt === "html" || fmt === "html-url") {
        const html = await buildChartHtml(type, options);
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const file = path.join(pagesDir, `${id}.html`);
        fs.writeFileSync(file, html, "utf-8");
        return res.json({ success: true, resultObj: `${base}/pages/${id}.html` });
      }
      const file = await renderChartToFile(type, options, cacheDir);
      const filename = path.basename(file);
      return res.json({ success: true, resultObj: `${base}/assets/${filename}` });
    } catch (e: any) {
      return res.json({ success: false, errorMessage: e?.message || "render error" });
    }
  });

  // Map rendering: conforms to MAP_REQUEST_SERVER contract
  app.post("/map", async (req: Request, res: Response) => {
    try {
      const { tool, input } = req.body || {};
      if (!tool) return res.json({ success: false, errorMessage: "missing map tool name" });
      const base = process.env.RENDER_PUBLIC_BASE || `http://localhost:${serverPort}`;
      const fmt = String(input?.format || process.env.RENDER_FORMAT || (process.env.RENDER_INTERACTIVE ? 'html' : '')).toLowerCase();
      if (fmt === "html" || fmt === "html-url") {
        if (tool === 'generate_pin_map' || tool === 'generate_path_map' || tool === 'generate_district_map') {
          const width = Number(input?.width || 800);
          const height = Number(input?.height || 600);
          if (tool === 'generate_pin_map') {
            const pois: string[] = Array.isArray(input?.data) ? input.data : [];
            const pts = await geocodeAll(pois);
            const html = buildMapHtmlForPinOrPath(pts, width, height, false);
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const file = path.join(pagesDir, `${id}.html`);
            fs.writeFileSync(file, html, 'utf-8');
            return res.json({ success: true, resultObj: `${base}/pages/${id}.html` });
          } else if (tool === 'generate_path_map') {
            const routes: Array<{ data: string[] }> = Array.isArray(input?.data) ? input.data : [];
            const flattened = routes.flatMap(r => r.data || []);
            const pts = await geocodeAll(flattened);
            const html = buildMapHtmlForPinOrPath(pts, width, height, true);
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const file = path.join(pagesDir, `${id}.html`);
            fs.writeFileSync(file, html, 'utf-8');
            return res.json({ success: true, resultObj: `${base}/pages/${id}.html` });
          } else {
            const regionName: string = String(input?.data?.name || '');
            const region = regionName ? await fetchGeoJSONByName(regionName) : null;
            const subsInput: Array<{ name: string; dataValue?: string | number }> = Array.isArray(input?.data?.subdistricts) ? input.data.subdistricts : [];
            const subs: Array<{ name: string; geojson: any; value?: string | number }> = [];
            for (const s of subsInput) {
              const g = s?.name ? await fetchGeoJSONByName(s.name) : null;
              if (g && g.geojson) subs.push({ name: s.name, geojson: g.geojson, value: s.dataValue });
            }
            const html = buildDistrictMapHtml(input, width, height, { region, subs });
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const file = path.join(pagesDir, `${id}.html`);
            fs.writeFileSync(file, html, 'utf-8');
            return res.json({ success: true, resultObj: `${base}/pages/${id}.html` });
          }
        }
      }
      const file = await renderMapToFile(tool, input, cacheDir);
      const filename = path.basename(file);
      return res.json({ success: true, resultObj: `${base}/assets/${filename}` });
    } catch (e: any) {
      return res.json({ success: false, errorMessage: e?.message || "render error" });
    }
  });

    const server = app.listen(port, () => {
      const a = server.address();
      if (typeof a === "object" && a) {
        serverPort = a.port;
        // eslint-disable-next-line no-console
        console.error(`Renderer server listening on http://localhost:${serverPort}`);
        resolve();
      }
    });

    server.on('error', (err) => {
      console.error(`Renderer server error:`, err);
      // If port is in use, try random port
      if ((err as any).code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use, retrying with port 0 (random)`);
        const retryServer = app.listen(0, () => {
          const a = retryServer.address();
          if (typeof a === "object" && a) {
            serverPort = a.port;
            console.error(`Renderer server listening on http://localhost:${serverPort}`);
            resolve();
          }
        });
        retryServer.on('error', (retryErr) => {
          console.error(`Renderer server retry error:`, retryErr);
          resolve(); // Resolve anyway to not block startup
        });
      } else {
        console.error(`Renderer server failed to start, continuing without it`);
        resolve(); // Resolve anyway to not block startup
      }
    });
  });

  return startPromise;
}