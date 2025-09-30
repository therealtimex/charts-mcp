import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  FormatSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Word cloud data schema
const data = z.object({
  text: z.string(),
  value: z.number(),
});

// Word cloud input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for word cloud chart, it should be an array of objects, each object contains a `text` field and a `value` field, such as, [{ value: 4.272, text: '形成' }].",
    )
    .nonempty({ message: "Word cloud chart data cannot be empty." }),
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
  format: FormatSchema,
};

// Word cloud tool descriptor
const tool = {
  name: "generate_word_cloud_chart",
  description:
    "Generate a word cloud chart to show word frequency or weight through text size variation, such as, analyzing common words in social media, reviews, or feedback. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const wordCloud = {
  schema,
  tool,
};
