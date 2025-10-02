import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  FormatSchema,
  HeightSchema,
  PaletteSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Bubble map data schema
const data = z.object({
  name: z.string().optional().describe("Name of the location/city"),
  lng: z.number().describe("Longitude coordinate"),
  lat: z.number().describe("Latitude coordinate"),
  size: z.number().describe("Value for bubble size (e.g., GDP, population)"),
  group: z.string().optional().describe("Category/region for color encoding"),
  time: z.union([z.string(), z.number()]).optional().describe("Time value for time-series animations"),
});

// Layer configuration for multi-layer bubble maps
const LayerSchema = z.object({
  name: z.string().describe("Name of the layer"),
  data: z.array(data).describe("Data for this layer"),
  style: z.object({
    fillOpacity: z.number().min(0).max(1).optional().describe("Fill opacity for this layer"),
    lineWidth: z.number().optional().describe("Border line width"),
    stroke: z.string().optional().describe("Border color"),
  }).optional().describe("Layer-specific style configuration"),
  scale: z.object({
    size: z.object({
      type: z.enum(["linear", "log", "pow", "sqrt"]).optional(),
      range: z.tuple([z.number(), z.number()]).optional(),
    }).optional(),
  }).optional().describe("Layer-specific scale configuration"),
  tooltip: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      name: z.string(),
      field: z.string().optional(),
      channel: z.enum(["size", "color"]).optional(),
      valueFormatter: z.string().optional(),
    })).optional(),
  }).optional().describe("Layer-specific tooltip configuration"),
});

// Map background data schema (GeoJSON feature)
const MapBackgroundSchema = z
  .array(
    z.object({
      type: z.literal("Feature"),
      geometry: z.object({
        type: z.string(),
        coordinates: z.array(z.any()),
      }),
      properties: z.record(z.any()).optional(),
    })
  )
  .optional()
  .describe("GeoJSON features for map background. If not provided, a simple world outline will be used.");

// Scale configuration
const ScaleSchema = z
  .object({
    size: z
      .object({
        type: z.enum(["linear", "log", "pow", "sqrt"]).optional()
          .describe("Scale type for size"),
        range: z.tuple([z.number(), z.number()]).optional()
          .describe("Size range as [min, max], e.g., [8, 40]"),
      })
      .optional(),
  })
  .optional()
  .describe("Scale configuration for bubble size");

// Legend configuration
const LegendSchema = z
  .object({
    size: z.boolean().optional()
      .describe("Whether to show size legend. Default: false"),
    color: z.boolean().optional()
      .describe("Whether to show color legend. Default: true if groups exist"),
  })
  .optional()
  .describe("Legend visibility configuration");

// Tooltip configuration
const TooltipSchema = z
  .object({
    title: z.string().optional().describe("Field to use as tooltip title. Default: 'name'"),
    items: z
      .array(
        z.object({
          name: z.string().describe("Display name in tooltip"),
          field: z.string().optional().describe("Data field name"),
          channel: z.enum(["size", "color"]).optional().describe("Visual channel to display"),
          valueFormatter: z.string().optional().describe("JavaScript formatter function as string, e.g., '(value) => `${value} million`'"),
        })
      )
      .optional()
      .describe("Custom tooltip items configuration"),
  })
  .optional()
  .describe("Tooltip configuration");

// Map background style
const MapBackgroundStyleSchema = z
  .object({
    fill: z.string().optional().describe("Fill color for map background. Default: '#f0f0f0'"),
    stroke: z.string().optional().describe("Stroke color for map boundaries. Default: '#d0d0d0'"),
    lineWidth: z.number().optional().describe("Line width for boundaries. Default: 1"),
  })
  .optional()
  .describe("Style configuration for map background");

// Projection configuration
const ProjectionSchema = z
  .object({
    type: z.enum(["mercator", "albers", "albersUsa", "equalEarth", "equirectangular", "naturalEarth1", "orthographic"]).optional()
      .describe("Map projection type. Default: 'mercator'"),
    center: z.tuple([z.number(), z.number()]).optional()
      .describe("Center point [longitude, latitude] for the projection"),
    scale: z.number().optional()
      .describe("Projection scale factor"),
    rotate: z.tuple([z.number(), z.number(), z.number()]).optional()
      .describe("Rotation [lambda, phi, gamma] in degrees"),
  })
  .optional()
  .describe("Map projection configuration for advanced geographic transformations");

// Animation configuration for time series
const AnimationSchema = z
  .object({
    enabled: z.boolean().default(true).describe("Enable time series animation"),
    duration: z.number().optional().describe("Duration of each frame in milliseconds. Default: 1000"),
    interval: z.number().optional().describe("Interval between frames in milliseconds. Default: 2000"),
    loop: z.boolean().optional().describe("Whether to loop the animation. Default: true"),
    timeField: z.string().default("time").describe("Field name for time values. Default: 'time'"),
  })
  .optional()
  .describe("Animation configuration for time-series bubble maps");

// Bubble map input schema
const schema = {
  data: z
    .array(data)
    .optional()
    .describe(
      "Data for single-layer bubble map. Each item requires lng, lat, and size fields. Example: [{ name: 'Beijing', lng: 116.4074, lat: 39.9042, size: 4027, group: 'Asia' }]. Use this OR layers, not both."
    ),
  layers: z
    .array(LayerSchema)
    .optional()
    .describe("Multiple data layers for multi-layer bubble maps. Each layer can have its own data, style, scale, and tooltip configuration. Use this OR data, not both."),
  mapBackground: MapBackgroundSchema,
  mapBackgroundStyle: MapBackgroundStyleSchema,
  projection: ProjectionSchema,
  animation: AnimationSchema,
  scale: ScaleSchema,
  legend: LegendSchema,
  tooltip: TooltipSchema,
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      fillOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Fill opacity for bubbles from 0 to 1. Default: 0.8"),
      lineWidth: z
        .number()
        .optional()
        .describe("Border line width for bubbles. Default: 2"),
      stroke: z
        .string()
        .optional()
        .describe("Border color for bubbles. Default: 'white'"),
    })
    .optional()
    .describe("Custom style configuration for bubbles (applies to single-layer or as default for multi-layer)."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  format: FormatSchema,
};

// Bubble map tool descriptor
const tool = {
  name: "generate_bubble_map",
  description:
    "Generate bubble maps for geographic data visualization. Bubble maps display data on a geographic background using bubbles where position represents coordinates (longitude/latitude), bubble size represents values (e.g., GDP, population), and colors distinguish categories or regions. Uses G2 v5 geoView with point marks. Advanced features: (1) Multi-layer bubble maps - display multiple data series with different styles and opacities on the same map via 'layers' array; (2) Time-series animations - show temporal changes with automatic frame transitions via 'animation' config; (3) Map projections - support for mercator, albers, equalEarth, orthographic, and other geographic projections; (4) Custom GeoJSON backgrounds, logarithmic scales, and rich tooltips with formatters. Perfect for showing geographic distribution patterns, regional comparisons, temporal trends, and multidimensional location-based data like city economics, population growth, or business metrics. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const bubbleMap = {
  schema,
  tool,
};
