import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  HeightSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Statistical data schema for choropleth maps
const StatisticalDataSchema = z.object({
  id: z.string().describe("Identifier to join with geographic features (e.g., state code, county FIPS code)"),
  value: z.number().describe("Statistical value to visualize (e.g., population, unemployment rate, GDP)"),
  name: z.string().optional().describe("Human-readable name for the region"),
});

// Geographic feature schema (GeoJSON/TopoJSON feature)
const GeoFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: z.union([z.string(), z.number()]).optional().describe("Feature identifier for joining with statistical data"),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.any()),
  }),
  properties: z.record(z.any()).optional(),
});

// Color scale configuration
const ColorScaleSchema = z
  .object({
    type: z.enum(["quantile", "quantize", "threshold", "linear", "log", "pow", "sqrt"]).optional()
      .describe("Color scale type. Default: 'quantile'"),
    palette: z.union([
      z.enum([
        "ylGnBu", "ylGn", "ylOrRd", "ylOrBr", "yiGnBu",
        "rdYlGn", "rdYlBu", "rdPu", "rdGy", "rdBu",
        "puBuGn", "puBu", "puRd", "orRd", "gnBu",
        "buPu", "buGn", "blues", "greens", "greys",
        "oranges", "purples", "reds", "spectral", "viridis"
      ]),
      z.array(z.string())
    ]).optional()
      .describe("Color palette name or custom color array. Default: 'ylGnBu'"),
    domain: z.array(z.number()).optional()
      .describe("Custom domain values for threshold scales"),
    unknown: z.string().optional()
      .describe("Color for missing/unknown data. Default: '#fff'"),
  })
  .optional()
  .describe("Color scale configuration for the choropleth values");

// Legend configuration
const LegendSchema = z
  .object({
    color: z.boolean().optional()
      .describe("Whether to show color legend. Default: true"),
    layout: z.object({
      justifyContent: z.enum(["flex-start", "center", "flex-end", "space-between"]).optional(),
    }).optional()
      .describe("Legend layout configuration"),
  })
  .optional()
  .describe("Legend configuration");

// Tooltip configuration
const TooltipSchema = z
  .object({
    title: z.string().optional()
      .describe("Property path for tooltip title (e.g., 'properties.name'). Default: uses region name from joined data"),
    items: z
      .array(
        z.object({
          name: z.string().describe("Display name in tooltip"),
          field: z.string().describe("Data field name to display"),
          valueFormatter: z.string().optional()
            .describe("JavaScript formatter function as string, e.g., '(value) => `${value.toFixed(2)}%`'"),
        })
      )
      .optional()
      .describe("Custom tooltip items configuration"),
  })
  .optional()
  .describe("Tooltip configuration");

// Projection configuration
const ProjectionSchema = z
  .object({
    type: z.enum([
      "mercator", "albers", "albersUsa", "equalEarth",
      "equirectangular", "naturalEarth1", "orthographic"
    ]).optional()
      .describe("Map projection type. Default: 'mercator'"),
    center: z.tuple([z.number(), z.number()]).optional()
      .describe("Center point [longitude, latitude] for the projection"),
    scale: z.number().optional()
      .describe("Projection scale factor"),
    rotate: z.tuple([z.number(), z.number(), z.number()]).optional()
      .describe("Rotation [lambda, phi, gamma] in degrees"),
  })
  .optional()
  .describe("Map projection configuration");

// Style configuration
const StyleSchema = z
  .object({
    backgroundColor: BackgroundColorSchema,
    stroke: z.string().optional()
      .describe("Border color for regions. Default: '#666'"),
    lineWidth: z.number().optional()
      .describe("Border line width. Default: 0.5"),
  })
  .optional()
  .describe("Style configuration for the choropleth map");

// Choropleth map input schema
const schema = {
  geoData: z
    .array(GeoFeatureSchema)
    .describe(
      "Geographic features (GeoJSON/TopoJSON format). Each feature should have an 'id' or property for joining with statistical data. Example: output from topojson-client's feature() function."
    ),
  data: z
    .array(StatisticalDataSchema)
    .describe(
      "Statistical data to visualize. Each item requires 'id' (for joining) and 'value' (numeric data). Example: [{ id: '01', value: 5.2, name: 'Alabama' }]"
    ),
  joinKeys: z
    .object({
      geo: z.string().default("id")
        .describe("Property path in geographic features to use for joining. Default: 'id'"),
      data: z.string().default("id")
        .describe("Property name in statistical data to use for joining. Default: 'id'"),
    })
    .optional()
    .describe("Keys to use when joining geographic and statistical data"),
  valueField: z.string().default("value")
    .describe("Field name in statistical data containing the value to visualize. Default: 'value'"),
  colorScale: ColorScaleSchema,
  projection: ProjectionSchema,
  legend: LegendSchema,
  tooltip: TooltipSchema,
  style: StyleSchema,
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
};

// Choropleth map tool descriptor
const tool = {
  name: "generate_choropleth_map",
  description:
    "Generate choropleth maps (also called thematic maps or shaded maps) for geographic data visualization. Choropleth maps use color shading to represent statistical values across geographic regions like countries, states, or counties. Color intensity or hue represents the magnitude of values (e.g., population density, unemployment rate, election results, GDP per capita). Uses G2 v5 geoPath with data joins to combine geographic boundaries with statistical data. Features: (1) Flexible projections - support for mercator, albers, albersUsa, equalEarth, and other geographic projections; (2) Rich color palettes - built-in ColorBrewer schemes (ylGnBu, rdYlGn, spectral, etc.) or custom color arrays; (3) Multiple scale types - quantile, quantize, threshold, linear, log for different data distributions; (4) Data joins - automatically joins statistical data with GeoJSON/TopoJSON features by ID; (5) Custom tooltips with formatters. Perfect for visualizing census data, election results, economic indicators, disease spread, climate data, and any metric that varies by geographic region. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const choroplethMap = {
  schema,
  tool,
};
