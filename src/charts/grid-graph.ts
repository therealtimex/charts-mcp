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

// Grid graph data schema
const nodeData = z.object({
  id: z.string(),
  label: z.string().optional(),
});

const edgeData = z.object({
  source: z.string(),
  target: z.string(),
});

// Grid graph input schema
const schema = {
  data: z
    .object({
      nodes: z
        .array(nodeData)
        .describe("Array of nodes in the grid graph.")
        .nonempty({ message: "Nodes array cannot be empty." }),
      edges: z
        .array(edgeData)
        .describe("Array of edges connecting nodes.")
        .optional(),
    })
    .describe("Data for grid graph with nodes and edges."),
  cols: z
    .number()
    .optional()
    .default(3)
    .describe("Number of columns in the grid layout. Default is 3."),
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

// Grid graph tool descriptor
const tool = {
  name: "generate_grid_graph",
  description:
    "Generate a grid layout graph with nodes arranged in a regular grid pattern. Useful for visualizing task boards, process flows, and structured layouts where items need to be organized in rows and columns. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const gridGraph = {
  schema,
  tool,
};
