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

// Label configuration schema
const LabelConfigSchema = z.object({
  text: z.union([
    z.string(),
    z.enum(['category', 'value', 'percentage']),
  ]).optional().describe("Label content: field name, 'percentage', or custom text"),
  position: z.enum(['inside', 'outside', 'spider']).optional().describe("Label position relative to slice"),
  style: z.object({
    fontSize: z.number().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    fill: z.string().optional(),
    dy: z.number().optional().describe("Vertical offset"),
    dx: z.number().optional().describe("Horizontal offset"),
  }).optional(),
}).optional();

// Legend configuration schema
const LegendConfigSchema = z.object({
  position: z.enum(['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  layout: z.object({
    justifyContent: z.enum(['center', 'flex-start', 'flex-end', 'space-between', 'space-around']).optional(),
    alignItems: z.enum(['center', 'flex-start', 'flex-end']).optional(),
  }).optional(),
  disabled: z.boolean().optional().describe("Set to true to hide legend"),
}).optional();

// Center annotation schema
const CenterAnnotationSchema = z.object({
  text: z.string().describe("Text to display in the center"),
  style: z.object({
    fontSize: z.number().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    fill: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
  }).optional(),
}).optional();

// Faceting configuration schema
const FacetConfigSchema = z.object({
  field: z.string().describe("Field name to facet by"),
  columnCount: z.number().optional().describe("Number of columns in facet grid"),
}).optional();

// Mark style schema
const MarkStyleSchema = z.object({
  stroke: z.string().optional().describe("Border color of slices"),
  lineWidth: z.number().optional().describe("Border width of slices"),
  opacity: z.number().optional(),
  fillOpacity: z.number().optional(),
}).optional();

// Encode configuration for flexible field mapping
const EncodeConfigSchema = z.object({
  angleField: z.string().optional().describe("Field name for angle/value (default: 'value')"),
  colorField: z.string().optional().describe("Field name for color/category (default: 'category')"),
}).optional();

// Donut chart input schema
const schema = {
  data: z
    .array(z.record(z.any()))
    .describe(
      "Data for donut chart. Each object can have any field names. Use 'encode' to specify which fields to use for angle and color, or use default 'category' and 'value' fields.",
    )
    .nonempty({ message: "Donut chart data cannot be empty." }),
  encode: EncodeConfigSchema.describe(
    "Field mapping configuration. Specify which fields to use for angle (value) and color (category). If not specified, defaults to 'value' and 'category'.",
  ),
  innerRadius: z
    .number()
    .min(0.1)
    .max(0.9)
    .default(0.6)
    .describe(
      "Set the innerRadius of donut chart, the value between 0.1 and 0.9. Default is 0.6 for optimal donut appearance.",
    ),
  labels: z
    .array(LabelConfigSchema)
    .optional()
    .describe(
      "Array of label configurations. Can have multiple labels with different content (category, value, percentage) and styles.",
    ),
  legend: LegendConfigSchema.describe(
    "Legend configuration including position, layout, and visibility.",
  ),
  centerAnnotation: CenterAnnotationSchema.describe(
    "Text annotation to display in the hollow center area of the donut chart.",
  ),
  facet: FacetConfigSchema.describe(
    "Faceting configuration to create small multiples (e.g., by year, region).",
  ),
  markStyle: MarkStyleSchema.describe(
    "Style configuration for donut slices (stroke, lineWidth, opacity, etc.).",
  ),
  autoFit: z
    .boolean()
    .optional()
    .describe("Whether to automatically fit the chart to container. Default is false."),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
};

// Donut chart tool descriptor
const tool = {
  name: "generate_donut_chart",
  description:
    "Generate a donut chart (doughnut chart) with full G2 v5 capabilities. Features include: customizable labels (category, value, percentage with multiple label layers), flexible legend positioning, center annotations for totals/titles, faceted small multiples for comparisons, mark-specific styling (stroke, opacity), and flexible data field mapping. Ideal for proportional relationships with better space utilization (max 9 categories recommended).",
  inputSchema: zodToJsonSchema(schema),
};

export const donutChart = {
  schema,
  tool,
};
