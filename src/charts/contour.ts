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

// Contour plot data schema
const data = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// Contour line data schema (for line variant)
const lineData = z.object({
  x: z.number(),
  y: z.number(),
  level: z.number(),
  lineId: z.string(),
});

// Contour plot input schema
const schema = {
  data: z
    .array(z.union([data, lineData]))
    .describe(
      "Data for contour plot. For cell variant: [{ x: 0, y: 0, z: 10 }, ...]. For line variant: [{ x: 0, y: 0, level: 20, lineId: 'line_20' }, ...]. Z values or levels represent the intensity or magnitude at each point.",
    )
    .nonempty({ message: "Contour plot data cannot be empty." }),
  variant: z
    .enum(["cell", "line"])
    .optional()
    .describe(
      "Visualization variant: 'cell' for heatmap-style contour (default), 'line' for contour outline chart with actual contour lines.",
    ),
  contourLevels: z
    .array(z.number())
    .optional()
    .describe(
      "Specific contour levels to display (for line variant). Example: [20, 40, 60, 80, 100]. If not specified, levels will be derived from data.",
    ),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
      strokeWidth: z
        .number()
        .optional()
        .describe("Width of contour lines (for line variant) or cell borders (for cell variant). Default: 0.5 for cell, 2 for line."),
      strokeOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Opacity of contour lines or cell borders. Default: 0.8."),
      inset: z
        .number()
        .optional()
        .describe("Inset spacing for cell variant. Default: 0.5."),
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

// Contour plot tool descriptor
const tool = {
  name: "generate_contour_plot",
  description:
    "Generate a contour plot to visualize three-dimensional data on a two-dimensional plane. Supports two variants: 'cell' for heatmap-style visualization with color gradients (like topographic maps), and 'line' for traditional contour outline charts with isolines. Useful for showing temperature distributions, elevation maps, density plots, terrain visualization, or any continuous spatial data. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const contour = {
  schema,
  tool,
};
