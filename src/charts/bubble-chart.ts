import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Bubble chart data schema
const data = z.object({
  x: z.union([z.string(), z.number()]).describe("X-axis value"),
  y: z.number().describe("Y-axis value"),
  size: z.number().describe("Bubble size value (will be mapped to area)"),
  group: z.string().optional().describe("Group/category for color encoding"),
});

// Scale configuration
const ScaleSchema = z
  .object({
    size: z
      .object({
        type: z.enum(["linear", "log", "pow", "sqrt"]).optional()
          .describe("Scale type for size. 'log' is recommended for data with large value ranges"),
        range: z.tuple([z.number(), z.number()]).optional()
          .describe("Size range as [min, max], e.g., [4, 20]"),
      })
      .optional(),
    x: z
      .object({
        type: z.enum(["linear", "log", "pow", "time", "band", "point"]).optional(),
      })
      .optional(),
    y: z
      .object({
        type: z.enum(["linear", "log", "pow", "sqrt"]).optional(),
      })
      .optional(),
  })
  .optional()
  .describe("Scale configuration for size, x, and y axes. Use log scale for size when dealing with large value ranges");

// Legend configuration
const LegendSchema = z
  .object({
    size: z.boolean().optional()
      .describe("Whether to show size legend. Typically false for bubble charts"),
    color: z.boolean().optional()
      .describe("Whether to show color legend"),
  })
  .optional()
  .describe("Legend visibility configuration");

// Bubble chart input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for bubble chart. Each item requires x, y, and size fields. Example: [{ x: 12547, y: 76.9, size: 1403500365, group: 'Asia' }]"
    )
    .nonempty({ message: "Bubble chart data cannot be empty." }),
  scale: ScaleSchema,
  legend: LegendSchema,
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
      fillOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Fill opacity from 0 to 1. Default is 0.3 for better visibility with overlapping bubbles"),
      lineWidth: z
        .number()
        .optional()
        .describe("Border line width. Default is 1"),
      stroke: z
        .string()
        .optional()
        .describe("Border color"),
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Bubble chart tool descriptor
const tool = {
  name: "generate_bubble_chart",
  description:
    "Generate bubble charts for multivariate data visualization. Bubble charts display relationships between three or more variables using position (X, Y) and bubble size. The chart uses area (not radius) for size encoding to ensure accurate visual perception. Supports logarithmic scales for handling data with large value ranges (e.g., population data, GDP), color encoding for categorical grouping (e.g., continents), semi-transparent bubbles to handle overlapping, and customizable legends. Perfect for analyzing correlations, comparing clusters, and showing multidimensional patterns like economic indicators vs. health metrics vs. population. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const bubbleChart = {
  schema,
  tool,
};
