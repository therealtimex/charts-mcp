import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  BackgroundColorSchema,
  FormatSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Stream graph data schema
const data = z.object({
  time: z.string(),
  category: z.string(),
  value: z.number(),
});

// Stream graph input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for stream graph showing values over time for different categories, such as, [{ time: '2018', category: 'Rock', value: 45 }, { time: '2018', category: 'Pop', value: 38 }].",
    )
    .nonempty({ message: "Stream graph data cannot be empty." }),
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
  format: FormatSchema,
};

// Stream graph tool descriptor
const tool = {
  name: "generate_stream_graph",
  description:
    "Generate a stream graph (or theme river) to visualize changes in data over time for multiple categories. The flowing, organic shapes make it ideal for showing trends, patterns, and the relative proportions of different categories over time. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const streamGraph = {
  schema,
  tool,
};
