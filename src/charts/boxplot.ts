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

const data = z.object({
  category: z
    .string()
    .describe("Category of the data point, such as '分类一'."),
  value: z.number().describe("Value of the data point, such as 10."),
  group: z
    .string()
    .optional()
    .describe(
      "Optional group for the data point, used for grouping in the boxplot.",
    ),
});

const schema = {
  data: z
    .array(data)
    .describe(
      "Data for boxplot chart, such as, [{ category: '分类一', value: 10 }] or [{ category: '分类二', value: 20, group: '组别一' }].",
    )
    .nonempty({ message: "Boxplot chart data cannot be empty." }),
  horizontal: z
    .boolean()
    .optional()
    .describe(
      "Whether to display the boxplot horizontally. When true, transposes the coordinate system for better readability with long category labels.",
    ),
  showOutliers: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to show outlier points. Set to false to hide outliers and focus only on the overall data distribution.",
    ),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      texture: TextureSchema,
      boxFill: z
        .string()
        .optional()
        .describe("Fill color for the box, such as '#1890ff'."),
      boxFillOpacity: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe(
          "Fill opacity for the box, ranging from 0 (transparent) to 1 (opaque).",
        ),
      pointStroke: z
        .string()
        .optional()
        .describe("Stroke color for outlier points, such as '#f5222d'."),
      pointR: z
        .number()
        .optional()
        .describe("Radius of outlier points, such as 3."),
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

const tool = {
  name: "generate_boxplot_chart",
  description:
    "Generate a boxplot chart to show data for statistical summaries among different categories, such as, comparing the distribution of data points across categories. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const boxplot = {
  schema,
  tool,
};
