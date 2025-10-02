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

// Recursive tree node schema
const treeNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(treeNodeSchema).optional(),
  })
);

// Dendrogram input schema
const schema = {
  data: treeNodeSchema.describe(
    "Hierarchical tree data for dendrogram, such as, { name: 'Root', children: [{ name: 'Child1', children: [{ name: 'Leaf1' }] }] }.",
  ),
  direction: z
    .enum(["LR", "RL", "TB", "BT"])
    .optional()
    .default("LR")
    .describe(
      "Layout direction for the dendrogram: 'LR' (left to right), 'RL' (right to left), 'TB' (top to bottom), 'BT' (bottom to top). Default is 'LR'.",
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
  format: FormatSchema,
};

// Dendrogram tool descriptor
const tool = {
  name: "generate_dendrogram",
  description:
    "Generate a dendrogram to visualize hierarchical tree structures. Useful for showing taxonomies, classification systems, organizational hierarchies, and phylogenetic relationships. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const dendrogram = {
  schema,
  tool,
};
