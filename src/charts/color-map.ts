import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Color map data schema
const ColorMapDataSchema = z.object({
  x: z.string().describe("First categorical dimension (e.g., month, product)"),
  y: z.string().describe("Second categorical dimension (e.g., category, student)"),
  value: z.number().describe("Numerical value to encode as color (e.g., sales, score)"),
});

// Label configuration
const LabelSchema = z
  .object({
    show: z.boolean().default(true).describe("Whether to show value labels in cells"),
    field: z.string().default("value").describe("Field to display in labels. Default: 'value'"),
    formatter: z.string().optional()
      .describe("JavaScript formatter function as string, e.g., '(d) => d.value.toFixed(0)'"),
    textColor: z.string().optional()
      .describe("Text color. Can be a static color or a conditional function string, e.g., '(d) => (d.value > 200 ? \"#fff\" : \"#000\")'"),
    fontSize: z.number().optional().describe("Font size for labels. Default: 12"),
  })
  .optional()
  .describe("Label configuration for displaying values in cells");

// Color scale configuration
const ColorScaleSchema = z
  .object({
    type: z.enum(["linear", "threshold", "quantile", "quantize", "log", "pow", "sqrt"]).optional()
      .describe("Color scale type. Use 'threshold' for conditional formatting. Default: 'linear'"),
    palette: z.union([
      z.enum([
        "rdBu", "rdYlGn", "rdYlBu", "ylGnBu", "ylGn", "ylOrRd", "ylOrBr",
        "puBu", "puRd", "orRd", "rdPu", "buPu", "buGn", "gnBu",
        "blues", "greens", "greys", "oranges", "purples", "reds",
        "spectral", "viridis", "plasma", "magma", "inferno"
      ]),
      z.array(z.string())
    ]).optional()
      .describe("Color palette name or custom color array. Default: 'rdBu'"),
    domain: z.array(z.number()).optional()
      .describe("Custom domain values for threshold or other scales, e.g., [0.8, 1, 1.2] for performance thresholds"),
    reverse: z.boolean().optional()
      .describe("Reverse the color palette. Default: false"),
  })
  .optional()
  .describe("Color scale configuration");

// Legend configuration
const LegendSchema = z
  .object({
    show: z.boolean().default(true).describe("Whether to show color legend"),
    position: z.enum(["top", "right", "bottom", "left"]).optional()
      .describe("Legend position. Default: 'right'"),
    title: z.string().optional().describe("Legend title"),
    flipPage: z.boolean().optional()
      .describe("Enable pagination for legends with many items. Default: false"),
  })
  .optional()
  .describe("Legend configuration");

// Scale configuration for axis value ordering
const ScaleSchema = z
  .object({
    x: z.object({
      values: z.array(z.string()).optional()
        .describe("Explicit order of x-axis values. Useful for controlling category order."),
    }).optional(),
    y: z.object({
      values: z.array(z.string()).optional()
        .describe("Explicit order of y-axis values. Useful for controlling category order."),
    }).optional(),
  })
  .optional()
  .describe("Scale configuration for controlling axis value ordering");

// Axis configuration
const AxisSchema = z
  .object({
    x: z.object({
      title: z.string().optional().describe("X-axis title. Set to empty string to hide."),
      labelRotate: z.number().optional()
        .describe("Label rotation in radians, e.g., -Math.PI/4 for -45 degrees"),
      labelOffset: z.number().optional()
        .describe("Label offset in pixels. Automatically set when rotation is used."),
      grid: z.boolean().optional()
        .describe("Show grid lines for x-axis. Default: false"),
      tickLine: z.boolean().optional()
        .describe("Show tick lines for x-axis. Default: false"),
    }).optional(),
    y: z.object({
      title: z.string().optional().describe("Y-axis title. Set to empty string to hide."),
      grid: z.boolean().optional()
        .describe("Show grid lines for y-axis. Default: false"),
      tickLine: z.boolean().optional()
        .describe("Show tick lines for y-axis. Default: false"),
    }).optional(),
  })
  .optional()
  .describe("Axis configuration");

// Tooltip configuration
const TooltipSchema = z
  .object({
    title: z.string().optional()
      .describe("JavaScript function as string for tooltip title, e.g., '(d) => `${d.x} - ${d.y}`'"),
    items: z
      .array(
        z.object({
          name: z.string().describe("Display name in tooltip"),
          field: z.string().describe("Data field name to display"),
          valueFormatter: z.string().optional()
            .describe("JavaScript formatter function as string, e.g., '(value) => value.toFixed(2)'"),
        })
      )
      .optional()
      .describe("Custom tooltip items"),
  })
  .optional()
  .describe("Tooltip configuration");

// Style configuration
const StyleSchema = z
  .object({
    backgroundColor: BackgroundColorSchema,
    palette: PaletteSchema,
    inset: z.number().optional()
      .describe("Spacing between cells in pixels. Default: 1"),
    stroke: z.string().optional()
      .describe("Border color for cells. Default: '#fff'"),
    strokeWidth: z.number().optional()
      .describe("Border width for cells. Default: 1"),
  })
  .optional()
  .describe("Style configuration for the color map");

// Interaction configuration
const InteractionSchema = z
  .object({
    tooltip: z.boolean().default(true).describe("Enable tooltip interaction"),
    highlight: z.boolean().default(true).describe("Enable cell highlight on hover"),
  })
  .optional()
  .describe("Interaction configuration");

// Link encoding configuration
const LinkSchema = z
  .object({
    enabled: z.boolean().default(false).describe("Enable link encoding for connector lines between cells"),
    field: z.string().optional()
      .describe("Field to use for link encoding. Typically the value field."),
  })
  .optional()
  .describe("Link encoding configuration for creating connector lines between cells (advanced feature)");

// Color map input schema
const schema = {
  data: z
    .array(ColorMapDataSchema)
    .describe(
      "Data for the color map. Each item requires 'x' (first categorical dimension), 'y' (second categorical dimension), and 'value' (numerical data). Example: [{ x: 'January', y: 'Product A', value: 123 }, { x: 'January', y: 'Product B', value: 231 }]"
    ),
  xField: z.string().default("x")
    .describe("Field name for x-axis categorical dimension. Default: 'x'"),
  yField: z.string().default("y")
    .describe("Field name for y-axis categorical dimension. Default: 'y'"),
  valueField: z.string().default("value")
    .describe("Field name for the value to encode as color. Default: 'value'"),
  colorScale: ColorScaleSchema,
  scale: ScaleSchema,
  label: LabelSchema,
  legend: LegendSchema,
  axis: AxisSchema,
  tooltip: TooltipSchema,
  link: LinkSchema,
  style: StyleSchema,
  interaction: InteractionSchema,
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
};

// Color map tool descriptor
const tool = {
  name: "generate_color_map",
  description:
    "Generate color maps (also called color block charts) for visualizing relationships between two categorical dimensions. Color maps use a regular grid where each cell represents the intersection of two categorical variables (x and y axes), with color intensity encoding numerical values. Perfect for showing patterns and relationships in multi-dimensional categorical data. Common use cases: (1) Product sales across time periods - see which products perform best in which months; (2) Student exam scores across subjects - identify strengths and weaknesses; (3) Fare matrices - show pricing between different origin-destination pairs; (4) Performance tracking - compare metrics across teams and time periods; (5) Conditional formatting - use threshold scales to highlight cells meeting specific criteria (e.g., above/below target). Features: Sequential color palettes (rdBu, ylGnBu, etc.) for continuous data ranges, threshold scales for conditional formatting with custom breakpoints, value labels in cells with conditional text colors, customizable cell spacing and borders, interactive tooltips and highlighting. Best for datasets with up to 20 categories per dimension (max ~400 cells). Not suitable for: very few data points (use bar/table instead), showing precise trends over time (use line chart instead), continuous data distributions (use heatmap instead). Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const colorMap = {
  schema,
  tool,
};
