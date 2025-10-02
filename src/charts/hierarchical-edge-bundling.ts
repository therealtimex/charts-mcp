import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Recursive tree node schema with edges
const treeNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(treeNodeSchema).optional(),
  })
);

const edgeData = z.object({
  source: z.string(),
  target: z.string(),
});

// Hierarchical edge bundling input schema
const schema = {
  data: z
    .object({
      name: z.string(),
      children: z.array(treeNodeSchema).optional(),
      edges: z
        .array(edgeData)
        .optional()
        .describe(
          "Array of edges connecting nodes across the hierarchy. Source and target should reference node names.",
        ),
    })
    .describe(
      "Hierarchical tree data with cross-hierarchy edges, such as, { name: 'Root', children: [{ name: 'A', children: [{ name: 'A1' }] }], edges: [{ source: 'A1', target: 'B1' }] }.",
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
};

// Hierarchical edge bundling tool descriptor
const tool = {
  name: "generate_hierarchical_edge_bundling",
  description:
    "Generate a hierarchical edge bundling diagram to visualize connections within hierarchical data. This layout bundles edges together to reduce visual clutter, making it ideal for showing dependencies, imports, or relationships in complex hierarchical systems like package dependencies or module relationships. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const hierarchicalEdgeBundling = {
  schema,
  tool,
};
