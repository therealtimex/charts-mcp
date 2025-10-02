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

// Concentric graph data schema
const nodeData = z.object({
  id: z.string(),
  label: z.string().optional(),
});

const edgeData = z.object({
  source: z.string(),
  target: z.string(),
});

// Concentric graph input schema
const schema = {
  data: z
    .object({
      nodes: z
        .array(nodeData)
        .describe("Array of nodes in the concentric graph.")
        .nonempty({ message: "Nodes array cannot be empty." }),
      edges: z
        .array(edgeData)
        .describe("Array of edges connecting nodes.")
        .nonempty({ message: "Edges array cannot be empty." }),
    })
    .describe("Data for concentric graph with nodes and edges."),
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

// Concentric graph tool descriptor
const tool = {
  name: "generate_concentric_graph",
  description:
    "Generate a concentric graph layout with nodes arranged in concentric circles. Useful for visualizing network structures, social networks, and relationships with a radial organization. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const concentricGraph = {
  schema,
  tool,
};
