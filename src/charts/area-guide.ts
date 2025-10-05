import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import fs from "node:fs";
import path from "node:path";

const schema = {
  format: z.enum(["text", "html"]).optional().default("text"),
};

const tool = {
  name: "get_area_chart_guide",
  description: "Get the JSON guide for area chart (G2 v5): data shapes, encodings, transforms, styles, examples.",
  inputSchema: zodToJsonSchema(schema),
};

export const areaGuide = { schema, tool };

export function readAreaGuide(format: "text" | "html" = "text") {
  const file = path.resolve("docs/guides/area-chart.md");
  const md = fs.readFileSync(file, "utf8");
  if (format === "html") {
    return `<!doctype html><html><head><meta charset=\"utf-8\" /><title>Area Chart Guide</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:20px;max-width:900px;margin:0 auto;line-height:1.5}pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto}</style></head><body><pre>${escapeHtml(md)}</pre></body></html>`;
  }
  return md;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m] as string));
}

