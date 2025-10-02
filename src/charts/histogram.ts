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

// Histogram chart input schema
const schema = {
  data: z
    .union([
      z.array(z.number()).nonempty({ message: "Histogram chart data cannot be empty." }),
      z.array(
        z.object({
          value: z.number().describe("The numerical value to be binned."),
          group: z
            .string()
            .describe(
              "The categorical group this value belongs to (for multi-distribution comparison).",
            ),
        }),
      ).nonempty({ message: "Histogram chart data cannot be empty." }),
    ])
    .describe(
      "Data for histogram chart. Can be either:\n" +
        "1. Simple array of numbers for single distribution: [78, 88, 60, 100, 95]\n" +
        "2. Array of objects for multi-distribution comparison: [{value: 78, group: 'A'}, {value: 85, group: 'B'}]",
    ),
  binNumber: z
    .number()
    .optional()
    .describe(
      "Number of bins (intervals) for the histogram. Controls the granularity of the distribution. Default is auto-calculated based on data.",
    ),
  mode: z
    .enum(["frequency", "density"])
    .optional()
    .describe(
      "Display mode:\n" +
        "- 'frequency' (default): Show raw counts in each bin\n" +
        "- 'density': Show normalized probability density (useful for comparing distributions of different sizes)",
    ),
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
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Histogram chart tool descriptor
const tool = {
  name: "generate_histogram_chart",
  description:
    "Generate a histogram chart to show the frequency or density distribution of continuous numerical data. " +
    "Supports three modes: " +
    "(1) Basic histogram showing raw frequency counts, " +
    "(2) Multi-distribution histogram for comparing multiple groups side-by-side with color encoding, " +
    "(3) Density histogram showing normalized probability density for statistical analysis. " +
    "Useful for observing data distribution patterns (normal, skewed), identifying concentration areas, detecting outliers, and comparing distributions. " +
    "Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const histogram = {
  schema,
  tool,
};