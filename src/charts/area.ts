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

// Area chart data schemas for different types
const basicData = z.object({
  x: z.union([z.string(), z.number()]).describe("X-axis value (time or category)"),
  y: z.number().describe("Y-axis value"),
  group: z.string().optional().describe("Group/category for multi-series charts"),
});

const rangeData = z.object({
  x: z.union([z.string(), z.number()]).describe("X-axis value"),
  low: z.number().describe("Lower bound of range"),
  high: z.number().describe("Upper bound of range"),
});

const legacyData = z.object({
  time: z.string(),
  value: z.number(),
  group: z.string().optional(),
});

// Common G2 alias data shape (e.g., step area examples use `year` + `value`)
const yearAliasData = z.object({
  year: z.union([z.string(), z.number()]),
  value: z.number(),
  group: z.string().optional(),
});

// Remote data via G2 fetch connector
const fetchData = z.object({
  type: z.literal("fetch"),
  value: z.string().url(),
});

// Transform options
const TransformSchema = z
  .array(
    z.object({
      type: z
        .enum(["stackY", "normalizeY", "diffY", "map", "fold"])
        .describe("Transform type"),
      orderBy: z
        .string()
        .optional()
        .describe("Field to order by for stackY transform (e.g., 'series' for streamgraph)"),
      offset: z
        .enum(["wiggle", "expand", "silhouette", "diverging"])
        .optional()
        .describe("Offset for stackY transform: 'wiggle' for streamgraph, 'expand' for normalized, 'silhouette' for centered, 'diverging' for positive/negative split"),
      reverse: z.boolean().optional().describe("Reverse stacking order for stackY"),
      y: z.string().optional().describe("Alternate output channel name for y (e.g., 'y1')"),
      fields: z.array(z.string()).optional().describe("Fields for fold transform"),
      key: z.string().optional().describe("Key field name for fold transform"),
      value: z.string().optional().describe("Value field name for fold transform"),
      callback: z.string().optional().describe("JavaScript callback function as string for map transform"),
    })
  )
  .optional()
  .describe(
    "Data transformations: stackY (stacking with optional orderBy/offset for streamgraph), normalizeY (percentage), diffY (difference), map (transform data), fold (reshape data)"
  );

// Scale configuration
const ScaleSchema = z
  .object({
    x: z
      .object({
        type: z.enum(["linear", "log", "pow", "time", "band", "point"])
        .optional(),
        tickCount: z.number().optional().describe("Number of ticks"),
      })
      .optional(),
    y: z
      .object({
        type: z.enum(["linear", "log", "pow", "sqrt"])
        .optional(),
        tickCount: z.number().optional(),
      })
      .optional(),
    color:
      z
        .object({
          range: z
            .array(z.string())
            .optional()
            .describe("Explicit color range for series"),
          palette: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .describe("Named palette (e.g., 'reds') or palette array"),
        })
        .optional(),
  })
  .optional()
  .describe("Scale configuration for axes and color");

// Encode configuration for advanced mapping
const EncodeSchema = z
  .object({
    x: z.string().optional().describe("Field name for x-axis"),
    y:
      z
        .union([z.string(), z.array(z.string())])
        .optional()
        .describe("Field name(s) for y-axis. Array for range area charts like ['low', 'high']"),
    color: z.string().optional().describe("Field name for color encoding"),
    series: z.string().optional().describe("Field name for series encoding"),
  })
  .optional()
  .describe("Advanced encoding configuration for custom field mapping");

// Children marks for combined visualizations
const ChildDataSchema = z.union([
  z.object({
    value: z.array(z.record(z.any())),
    transform: TransformSchema.optional(),
  }),
  z.object({
    type: z.literal("fetch"),
    value: z.string().url(),
    transform: TransformSchema.optional(),
  }),
  z.object({
    transform: TransformSchema,
  }),
]);

const ChildMarkSchema = z.object({
  type: z.enum(["line", "point", "area"])
    .describe("Mark type"),
  encode:
    z
      .object({
        x: z.string().optional(),
        y: z.union([z.string(), z.array(z.string())]).optional(),
        color: z.string().optional(),
        size: z.number().optional(),
        shape: z.string().optional(),
      })
      .optional(),
  data: ChildDataSchema.optional().describe("Per-mark data: value/fetch and/or transform pipeline"),
  style: z.record(z.any()).optional().describe("Style properties as key-value pairs"),
  tooltip: z.union([
    z.object({
      items: z.array(z.string()).optional(),
    }),
    z.boolean()
  ]).optional(),
  transform: TransformSchema,
});

// Axis configuration with formatter
const AxisConfigSchema = z
  .object({
    x:
      z
        .object({
          title: z.union([z.string(), z.boolean()]).optional(),
          labelFormatter: z.string().optional().describe("Format string like '.0%' for percentages"),
        })
        .optional(),
    y:
      z
        .object({
          title: z.union([z.string(), z.boolean()]).optional(),
          labelFormatter: z.string().optional().describe("Format string like '.0%', '.2f' for numbers"),
        })
        .optional(),
  })
  .optional();

// Area chart input schema
const schema = {
  data:
    z
      .union([
        z.array(basicData).nonempty({ message: "Area chart data cannot be empty." }),
        z.array(rangeData).nonempty({ message: "Area chart data cannot be empty." }),
        z.array(legacyData).nonempty({ message: "Area chart data cannot be empty." }),
        z.array(yearAliasData).nonempty({ message: "Area chart data cannot be empty." }),
        fetchData,
        // Fallback: allow arbitrary records when encode maps fields (e.g., { date, close })
        z.array(z.record(z.any())).nonempty({ message: "Area chart data cannot be empty." })
      ])
      .describe(
        "Data for area chart. Basic: [{ x: '2018', y: 99.9, group: 'A' }]. Range: [{ x: '2018', low: 10, high: 20 }]. Legacy: [{ time: '2018', value: 99.9 }]. G2 alias: [{ year: '2018', value: 99.9 }]. Fetch: { type: 'fetch', value: 'https://...' }. Or any record array when encode provides x/y mapping (e.g., [{ date, close }] + encode.x='(d)=>new Date(d.date)', encode.y='close')."
      ),
  chartType:
    z
      .enum(["basic", "range", "stacked", "percentage", "difference", "streamgraph"])
      .optional()
      .default("basic")
      .describe(
        "Chart type: basic (single series), range (show data range), stacked (stacked areas), percentage (normalized stack), difference (compare two series), streamgraph (flowing stream layout)"
      ),
  encode: EncodeSchema,
  transform: TransformSchema,
  scale: ScaleSchema,
  axis: AxisConfigSchema,
  shape:
    z
      .enum(["area", "smooth", "vh", "hv", "hvh"])
      .optional()
      .describe("Area shape: smooth for curves, vh/hv/hvh for step patterns"),
  connectNulls:
    z.boolean()
      .optional()
      .describe("Whether to connect points across null data values. Default: false"),
  children:
    z.array(ChildMarkSchema)
      .optional()
      .describe("Additional marks to overlay (line, point, area) for combined visualizations"),
  style:
    z.object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
      lineWidth: z.number().optional().describe("Line width for area boundary"),
      fill:
        z.string()
          .optional()
          .describe("Fill color or gradient like 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff'"),
      gradient: z.string().optional().describe("Gradient direction: 'x' or 'y' for band charts"),
      fillOpacity:
        z.number()
          .min(0)
          .max(1)
          .optional()
          .describe("Fill opacity from 0 to 1"),
      stroke: z.string().optional().describe("Stroke color"),
      strokeOpacity: z.number().min(0).max(1).optional(),
      // Missing-data connector support (G2 area)
      connect: z.boolean().optional().describe("Draw connectors across missing data segments"),
      connectFill: z.string().optional().describe("Fill color for missing-data connector"),
      connectFillOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Opacity for missing-data connector fill"),
      // Overall mark opacity
      opacity: z.number().min(0).max(1).optional().describe("Overall area opacity"),
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  // Legacy support
  stack:
    z.boolean()
      .optional()
      .describe(
        "Legacy: Whether stacking is enabled. Use chartType='stacked' or transform=[{type:'stackY'}] instead."
      ),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Area chart tool descriptor
const tool = {
  name: "generate_area_chart",
  description:
    "Generate area charts with full G2 v5 capabilities. Supports: basic area (single series trends), range area (data uncertainty/bounds), stacked area (multiple series comparison), percentage stacked (proportion changes), difference area (comparing two series), and streamgraph (flowing stream layout with wiggle offset). Features include smooth curves, gradient fills, opacity control, advanced transforms (stackY with orderBy/offset, normalizeY, diffY), combined marks (area+line+point), scale configuration, axis formatting, and connectNulls for handling missing data. Perfect for time series data, trend analysis, and showing magnitude of change. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const area = {
  schema,
  tool,
};
