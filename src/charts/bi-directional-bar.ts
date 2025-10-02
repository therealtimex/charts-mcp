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

// Bi-directional bar chart data schema
const data = z.object({
  category: z.string().describe("Category label (e.g., 'Group0', 'Dept 0')"),
  value: z.number().describe("Numeric value"),
  type: z.string().describe("Type indicator for positive/negative distinction (e.g., 'completed', 'uncompleted', 'positive', 'negative')"),
  group: z.string().optional().describe("Optional grouping field for color distinction"),
});

// Bi-directional bar chart input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for bi-directional bar chart. Each data point should have 'category', 'value', and 'type' fields. The 'type' field distinguishes positive vs negative values. Example: [{ category: 'Group0', value: 37, type: 'completed', group: 'Dept 0' }, { category: 'Group0', value: 9, type: 'uncompleted', group: 'Dept 0' }]",
    )
    .nonempty({ message: "Bi-directional bar chart data cannot be empty." }),
  orientation: z
    .enum(["horizontal", "vertical"])
    .optional()
    .default("horizontal")
    .describe(
      "Orientation of the bar chart. 'horizontal' displays bars horizontally (recommended), 'vertical' displays bars vertically.",
    ),
  positiveTypes: z
    .array(z.string())
    .optional()
    .describe(
      "Array of 'type' values that represent positive values (e.g., ['Agree', 'Strongly agree']). These will be shown as positive bars on the right/top side.",
    ),
  negativeTypes: z
    .array(z.string())
    .optional()
    .describe(
      "Array of 'type' values that represent negative values (e.g., ['Disagree', 'Strongly disagree']). These will be shown as negative bars on the left/bottom side.",
    ),
  neutralType: z
    .string()
    .optional()
    .describe(
      "The 'type' value that represents neutral/middle values (e.g., 'Neither agree nor disagree'). This value will be split equally across both sides of the axis (half negative, half positive).",
    ),
  positiveType: z
    .string()
    .optional()
    .describe(
      "DEPRECATED: Use positiveTypes instead. The 'type' value that represents positive values (e.g., 'completed', 'positive'). If not specified, will use the first unique type value found in data.",
    ),
  negativeType: z
    .string()
    .optional()
    .describe(
      "DEPRECATED: Use negativeTypes instead. The 'type' value that represents negative values (e.g., 'uncompleted', 'negative'). If not specified, will use the second unique type value found in data.",
    ),
  hollowNegative: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to display negative values with hollow/outline style instead of filled. Default is true.",
    ),
  stack: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to stack multiple groups. When enabled, creates a stacked bi-directional bar chart.",
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
  format: FormatSchema,
};

// Bi-directional bar chart tool descriptor
const tool = {
  name: "generate_bi_directional_bar_chart",
  description:
    "Generate a bi-directional bar chart (also known as positive-negative bar chart) to show numerical comparisons with both positive and negative values. Ideal for comparing completed vs uncompleted, agree vs disagree, or any opposing categories. Supports stacking for multiple agreement levels and hollow/solid styling to distinguish positive from negative. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const biDirectionalBar = {
  schema,
  tool,
};
