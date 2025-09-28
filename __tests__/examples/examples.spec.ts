import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import * as Charts from "../../src/charts";

function loadJson(p: string) {
  return JSON.parse(readFileSync(resolve(p), "utf-8"));
}

describe("examples validate against schemas", () => {
  const samples: Array<{ chart: keyof typeof Charts; file: string }> = [
    { chart: "area", file: "examples/charts/area.basic.json" },
    { chart: "bar", file: "examples/charts/bar.basic.json" },
    { chart: "boxplot", file: "examples/charts/boxplot.basic.json" },
    { chart: "column", file: "examples/charts/column.basic.json" },
    { chart: "dual-axes", file: "examples/charts/dual-axes.basic.json" },
    { chart: "fishbone-diagram", file: "examples/charts/fishbone-diagram.basic.json" },
    { chart: "flow-diagram", file: "examples/charts/flow-diagram.basic.json" },
    { chart: "funnel", file: "examples/charts/funnel.basic.json" },
    { chart: "histogram", file: "examples/charts/histogram.basic.json" },
    { chart: "line", file: "examples/charts/line.basic.json" },
    { chart: "liquid", file: "examples/charts/liquid.basic.json" },
    { chart: "mind-map", file: "examples/charts/mind-map.basic.json" },
    { chart: "network-graph", file: "examples/charts/network-graph.basic.json" },
    { chart: "organization-chart", file: "examples/charts/organization-chart.basic.json" },
    { chart: "pie", file: "examples/charts/pie.basic.json" },
    { chart: "radar", file: "examples/charts/radar.basic.json" },
    { chart: "sankey", file: "examples/charts/sankey.basic.json" },
    { chart: "scatter", file: "examples/charts/scatter.basic.json" },
    { chart: "treemap", file: "examples/charts/treemap.basic.json" },
    { chart: "venn", file: "examples/charts/venn.basic.json" },
    { chart: "violin", file: "examples/charts/violin.basic.json" },
    { chart: "word-cloud", file: "examples/charts/word-cloud.basic.json" },
    { chart: "pin-map", file: "examples/maps/pin-map.basic.json" },
    { chart: "path-map", file: "examples/maps/path-map.basic.json" },
    { chart: "district-map", file: "examples/maps/district-map.basic.json" },
  ];

  for (const { chart, file } of samples) {
    it(`${chart} example should be valid`, () => {
      const schema = Charts[chart].schema;
      const data = loadJson(file);
      const result = z.object(schema).safeParse(data);
      if (!result.success) {
        // Emit a friendly error for debugging
        const error = result.error.flatten();
        throw new Error(`Validation failed for ${chart} (${file}): ${JSON.stringify(error, null, 2)}`);
      }
      expect(result.success).toBe(true);
    });
  }
});
