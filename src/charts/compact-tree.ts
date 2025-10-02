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

// Compact tree input schema
const schema = {
  data: treeNodeSchema.describe(
    "Hierarchical tree data for compact tree layout, such as, { name: 'Root', children: [{ name: 'Child1', children: [{ name: 'Leaf1' }] }] }.",
  ),
  direction: z
    .enum(["LR", "RL", "TB", "BT"])
    .optional()
    .default("TB")
    .describe(
      "Layout direction for the tree: 'LR' (left to right), 'RL' (right to left), 'TB' (top to bottom), 'BT' (bottom to top). Default is 'TB'.",
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

// Compact tree tool descriptor
const tool = {
  name: "generate_compact_tree",
  description:
    "Generate a compact tree layout to visualize hierarchical structures in a space-efficient manner. Ideal for file systems, organizational charts, and any tree-structured data where space optimization is important. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const compactTree = {
  schema,
  tool,
};
