import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Bullet chart data schema
const data = z.object({
  title: z.string().describe("Category/metric title (e.g., 'Sales Completion Rate', 'CPU Usage')"),
  measures: z.number().describe("Actual measured value"),
  target: z.number().describe("Target value to achieve"),
  ranges: z.union([
    z.number().describe("Single range value (typically 100 for percentage-based metrics)"),
    z.array(z.number()).describe("Multiple performance ranges for layered backgrounds (e.g., [40, 30, 30] for Poor/Good/Excellent)")
  ]).optional().describe("Performance range(s) for background. Single number or array of stacked values."),
});

// Performance range levels for layered ranges
const RangeLevelsSchema = z
  .object({
    labels: z.array(z.string()).optional()
      .describe("Labels for each range level (e.g., ['Poor', 'Good', 'Excellent'])"),
    colors: z.array(z.string()).optional()
      .describe("Colors for each range level (e.g., ['#ffebee', '#fff3e0', '#e8f5e8'])"),
  })
  .optional()
  .describe("Configuration for layered performance ranges");

// Label configuration
const LabelSchema = z
  .object({
    enabled: z.boolean().optional().describe("Whether to show labels on measures bar. Default: false"),
    position: z.enum(["top", "right", "bottom", "left"]).optional()
      .describe("Label position. 'right' for horizontal, 'top' for vertical. Default: 'right'"),
    formatter: z.string().optional()
      .describe("JavaScript formatter function as string, e.g., '(d) => `${d}%`'"),
  })
  .optional()
  .describe("Label configuration for measures");

// Color configuration
const ColorSchema = z
  .object({
    ranges: z.string().optional().describe("Background range color. Default: '#f0efff' or '#f5f5f5'"),
    measures: z.union([z.string(), z.enum(["conditional"])]).optional()
      .describe("Measures bar color. Use hex color or 'conditional' to color based on target comparison. Default: '#5B8FF9'"),
    target: z.string().optional().describe("Target marker color. Default: '#3D76DD'"),
    rangesLevels: z.array(z.string()).optional()
      .describe("Colors for layered ranges (overrides rangeLevels.colors)"),
  })
  .optional()
  .describe("Color configuration for bullet chart elements");

// Style configuration
const StyleSchema = z
  .object({
    rangesWidth: z.number().optional().describe("Maximum width for ranges bar. Default: 30"),
    measuresWidth: z.number().optional().describe("Maximum width for measures bar. Default: 20"),
    targetSize: z.number().optional().describe("Size of target marker line. Default: 8"),
  })
  .optional()
  .describe("Size/width configuration for chart elements");

// Bullet chart input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for bullet chart. Each item requires title, measures, and target. Example: [{ title: 'Sales', measures: 80, target: 85, ranges: 100 }]"
    )
    .nonempty({ message: "Bullet chart data cannot be empty." }),
  orientation: z
    .enum(["horizontal", "vertical"])
    .optional()
    .default("horizontal")
    .describe("Chart orientation. 'horizontal' (transposed) is typical for bullet charts. Default: 'horizontal'"),
  rangeLevels: RangeLevelsSchema,
  label: LabelSchema,
  colors: ColorSchema,
  styleConfig: StyleSchema,
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
    })
    .optional()
    .describe("General style configuration"),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Bullet chart tool descriptor
const tool = {
  name: "generate_bullet_chart",
  description:
    "Generate bullet charts for KPI and performance monitoring. Bullet charts are compact dashboard visualizations that display actual values against targets with performance ranges. Components include: (1) Background ranges showing performance zones (poor/good/excellent), (2) Measures bar showing actual achieved value, (3) Target marker line showing goal. Features: horizontal or vertical orientation, single or layered performance ranges (e.g., [40, 30, 30] for 3-tier ranges), conditional coloring (green when above target, red when below), customizable labels with formatters, multi-metric comparison support. Perfect for dashboards, KPI tracking, resource utilization monitoring (CPU, memory, disk), sales completion rates, budget execution, and project progress. More space-efficient than gauge charts while providing richer context than simple progress bars. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const bullet = {
  schema,
  tool,
};
