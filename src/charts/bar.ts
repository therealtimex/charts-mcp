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

// Bar chart data schema
const data = z.object({
  category: z.string(),
  value: z.number(),
  group: z.string().optional(),
});

// Advanced axis configuration schemas
const LabelAutoEllipsisSchema = z
  .object({
    suffix: z.string().optional().describe("Suffix to append when ellipsis is applied, e.g., '..'"),
    minLength: z.number().optional().describe("Minimum length before ellipsis is applied"),
    maxLength: z.number().optional().describe("Maximum length before ellipsis is applied"),
  })
  .optional()
  .describe("Configuration for automatic label ellipsis when text is too long.");

const LabelAutoWrapSchema = z
  .object({
    wordWrapWidth: z.number().optional().describe("Width at which to wrap text"),
    maxLines: z.number().optional().describe("Maximum number of lines to display"),
    recoverWhenFailed: z.boolean().optional().describe("Revert to original if wrapping fails"),
  })
  .optional()
  .describe("Configuration for automatic label text wrapping.");

const LabelAutoRotateSchema = z
  .object({
    optionalAngles: z.array(z.number()).optional().describe("Array of angles to attempt, e.g., [0, 45, 90]"),
    recoverWhenFailed: z.boolean().optional().describe("Revert to default angle if rotation fails"),
  })
  .optional()
  .describe("Configuration for automatic label rotation to prevent overlap.");

const LabelAutoHideSchema = z
  .object({
    keepHeader: z.boolean().optional().describe("Keep the first tick label visible"),
    keepTail: z.boolean().optional().describe("Keep the last tick label visible"),
  })
  .optional()
  .describe("Configuration for automatic label hiding to prevent overlap.");

const AxisConfigSchema = z
  .object({
    labelAutoEllipsis: LabelAutoEllipsisSchema,
    labelAutoWrap: LabelAutoWrapSchema,
    labelAutoRotate: LabelAutoRotateSchema,
    labelAutoHide: LabelAutoHideSchema,
    labelFontSize: z.number().optional().describe("Font size for axis labels"),
    size: z.number().optional().describe("Size of the axis area (required for some label auto features)"),
  })
  .optional()
  .describe("Advanced configuration for axis labels and layout.");

const InteractionSchema = z
  .object({
    type: z.enum(["elementHighlight"]).describe("Type of interaction to enable"),
    background: z.boolean().optional().describe("Enable background highlighting"),
    region: z.boolean().optional().describe("Enable region highlighting"),
  })
  .optional()
  .describe("Interaction configuration for the chart.");

// Bar chart input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for bar chart, such as, [{ category: '分类一', value: 10 }, { category: '分类二', value: 20 }], when grouping or stacking is needed for bar, the data should contain a `group` field, such as, when [{ category: '北京', value: 825, group: '油车' }, { category: '北京', value: 1000, group: '电车' }].",
    )
    .nonempty({ message: "Bar chart data cannot be empty." }),
  orientation:
    z
      .enum(["horizontal", "vertical"])
      .optional()
      .default("horizontal")
      .describe(
        "Orientation of the bar chart. 'horizontal' displays bars horizontally (recommended for many categories), 'vertical' displays bars vertically (column chart).",
      ),
  group:
    z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Whether grouping is enabled. When enabled, bar charts require a 'group' field in the data. When `group` is true, `stack` should be false.",
      ),
  stack:
    z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "Whether stacking is enabled. When enabled, bar charts require a 'group' field in the data. When `stack` is true, `group` should be false.",
      ),
  axisConfig: AxisConfigSchema,
  interaction: InteractionSchema,
  style:
    z
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

// Bar chart tool descriptor
const tool = {
  name: "generate_bar_chart",
  description:
    "Generate a bar chart (horizontal or vertical) to show numerical comparisons among different categories. Supports orientation options (horizontal for many categories, vertical for fewer categories), advanced axis label configuration (auto-ellipsis, auto-wrap, auto-rotate, auto-hide), and interactions (element highlighting). Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const bar = {
  schema,
  tool,
};