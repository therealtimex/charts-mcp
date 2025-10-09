import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  BackgroundColorSchema,
  FormatSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Line chart data schema - flexible schema that accepts any object
const data = z.record(z.any()).describe("Data object. Use default fields (time, value, group) or provide custom fields with encode parameter");

// G2 data fetch descriptor (supports example 5 style)
const FetchDataSchema = z
  .object({
    type: z.literal("fetch"),
    value: z.string().describe("URL to fetch data from (CSV/JSON)"),
    // Optional extra fields are allowed for forward compatibility
  })
  .passthrough()
  .describe("Use G2 fetch pipeline: { type: 'fetch', value: '<url>' }");

// Transform options (support sample + map/filter like G2 options examples)
const TransformSchema = z
  .array(
    z
      .object({
        type: z
          .enum(["sample", "map", "filter"]) // keep it simple and compatible with G2 options
          .describe("Transform type: 'sample' (downsample), 'map' (transform rows), or 'filter' (predicate)"),
        thresholds: z.number().optional().describe("Target number of samples for 'sample' transform (e.g., 200)"),
        strategy: z.string().optional().describe("Sampling strategy for 'sample' transform, e.g., 'max', 'min'"),
        callback: z
          .string()
          .optional()
          .describe(
            "Function as string for 'map'/'filter' (e.g., (d)=>({...d, close: isNaN(d.close)?null:d.close})). Will be embedded as a function."
          ),
      })
      .passthrough(),
  )
  .optional()
  .describe(
    "Data transform pipeline. Supports 'sample' plus G2-style 'map' and 'filter' with callback functions (as strings).",
  );

// Line shape types
const LineShapeSchema = z
  .enum(["line", "smooth", "hv", "vh", "hvh", "vhv"])
  .optional()
  .describe(
    "Line shape type: 'line' (straight lines), 'smooth' (curved), 'hv' (step horizontal-vertical), 'vh' (step vertical-horizontal), 'hvh' (horizontal-vertical-horizontal), 'vhv' (vertical-horizontal-vertical)"
  );

// Point marker configuration
const PointSchema = z
  .object({
    show: z.boolean().optional().describe("Whether to show point markers on the line"),
    shape: z.enum(["circle", "square", "diamond", "triangle", "hollow-circle", "hollow-square"]).optional().describe("Shape of point markers"),
    size: z.number().optional().describe("Size of point markers"),
  })
  .optional()
  .describe("Configuration for point markers on the line");

// Line dash configuration
const LineDashSchema = z
  .union([
    z.array(z.number()).describe("Dash pattern array, e.g., [4, 4] for dashed line, [10, 5] for longer dashes"),
    z.null()
  ])
  .optional()
  .describe("Line dash pattern. Use [4, 4] for dashed line, null or undefined for solid line");

// Axis formatter
const AxisFormatterSchema = z
  .string()
  .optional()
  .describe("Format string for axis labels, e.g., '~s' for SI-prefix, '.2f' for 2 decimal places, or custom format");

// Encode schema for field mapping
const EncodeSchema = z
  .object({
    x: z.string().optional().describe("Field name for x-axis (defaults to 'time')"),
    y: z.string().optional().describe("Field name for y-axis (defaults to 'value')"),
    color: z.string().optional().describe("Field name for color/series (defaults to 'group')"),
  })
  .optional()
  .describe("Optional field name mapping. If not specified, defaults to { x: 'time', y: 'value', color: 'group' }");

// Line chart input schema
const schema = {
  data: z
    .union([
      z
        .array(data)
        .describe(
          "Array data. Single series: [{ time: '2015', value: 23 }]. Multi-series: [{ time: 'Jan', value: 7, group: 'Tokyo' }]. With encode: [{ month: 'Jan', temperature: 7, city: 'Tokyo' }].",
        )
        .nonempty({ message: "Line chart data cannot be empty." }),
      FetchDataSchema,
    ])
    .describe("Data can be an array or a G2 fetch descriptor (example 5)."),
  encode: EncodeSchema,
  transform: TransformSchema,
  shape: LineShapeSchema,
  point: PointSchema,
  style: z
    .object({
      texture: TextureSchema,
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      lineWidth: z
        .number()
        .optional()
        .describe("Line width for the lines of chart, such as 2 or 4."),
      lineDash: LineDashSchema,
      stroke: z.string().optional().describe("Line color, e.g., '#1890ff' (only applies to single-series charts)"),
      // Missing-data connectors
      connect: z.boolean().optional().describe("Whether to draw connector segments across missing values (NaN/null)."),
      connectStroke: z.string().optional().describe("Stroke color for connector segments across missing data."),
      connectStrokeOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Stroke opacity for connector segments."),
      connectLineWidth: z.number().optional().describe("Line width for connector segments."),
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  // Also support connectNulls at top-level as an alternative toggle
  connectNulls: z
    .boolean()
    .optional()
    .describe("Whether to connect points across null/NaN values (applies style('connectNulls', true))."),
  axis: z
    .object({
      x: z.object({
        title: z.union([z.string(), z.boolean()]).optional().describe("X-axis title or false to hide"),
        labelFormatter: AxisFormatterSchema,
      }).optional(),
      y: z.object({
        title: z.union([z.string(), z.boolean()]).optional().describe("Y-axis title or false to hide"),
        labelFormatter: AxisFormatterSchema,
      }).optional(),
    })
    .optional()
    .describe("Axis configuration for formatting and titles"),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  autoFit: z.boolean().optional().describe("Enable G2's responsive autoFit; container width becomes 100%"),
  title: TitleSchema,
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
  format: FormatSchema,
};

// Line chart tool descriptor
const tool = {
  name: "generate_line_chart",
  description:
    "Generate a line chart to show trends over time or ordered categories. Supports single or multi-series data, different line shapes (straight, smooth, step), point markers, dashed lines, remote data via G2 fetch, and sampling transform to downsample large series. Perfect for displaying continuous time series data changes, comparing multiple data series, and showing subtle data fluctuations. Examples: stock prices over time, temperature trends across cities, sales changes by month. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const line = {
  schema,
  tool,
};
