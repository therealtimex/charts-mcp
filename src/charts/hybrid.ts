import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Hybrid chart input schema - combines G2 (charts) and G6 (graphs)
const schema = {
  type: z
    .literal("hybrid")
    .default("hybrid")
    .describe("Type must be 'hybrid' for combined G2+G6 visualization."),
  title: TitleSchema,
  width: WidthSchema,
  height: HeightSchema,
  layout: z
    .enum(["split-horizontal", "split-vertical"])
    .optional()
    .default("split-horizontal")
    .describe(
      "Layout arrangement: 'split-horizontal' places charts side by side, 'split-vertical' places them top and bottom.",
    ),
  g2Config: z
    .object({
      type: z
        .string()
        .describe("G2 chart type (e.g., 'bar', 'line', 'pie', etc.)"),
      data: z.array(z.any()).describe("Data for the G2 chart."),
      position: z
        .enum(["left", "right", "top", "bottom"])
        .optional()
        .describe("Position of G2 chart in the layout."),
      size: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional()
        .describe("Custom size for G2 chart area."),
    })
    .describe("Configuration for G2 chart component."),
  g6Config: z
    .object({
      type: z
        .string()
        .describe("G6 graph type (e.g., 'force', 'dagre', 'circular', etc.)"),
      data: z
        .object({
          nodes: z.array(z.any()).describe("Graph nodes."),
          edges: z.array(z.any()).describe("Graph edges."),
        })
        .describe("Data for the G6 graph."),
      position: z
        .enum(["left", "right", "top", "bottom"])
        .optional()
        .describe("Position of G6 graph in the layout."),
      size: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional()
        .describe("Custom size for G6 graph area."),
    })
    .describe("Configuration for G6 graph component."),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
    })
    .optional()
    .describe("Custom style configuration for the hybrid visualization."),
  theme: ThemeSchema,
};

// Hybrid chart tool descriptor
const tool = {
  name: "generate_hybrid_chart",
  description:
    "Generate a hybrid visualization combining G2 statistical charts with G6 graph/network layouts. Ideal for showing both quantitative data (bar, line charts) alongside relational data (network graphs) in a single integrated view. For example, displaying sales data alongside product relationship networks. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const hybrid = {
  schema,
  tool,
};
