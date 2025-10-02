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

// Arc diagram data schema
const nodeData = z.object({
  id: z.string(),
  label: z.string().optional(),
});

const edgeData = z.object({
  source: z.string(),
  target: z.string(),
});

// Arc diagram input schema
const schema = {
  data: z
    .object({
      nodes: z
        .array(nodeData)
        .describe("Array of nodes in the arc diagram.")
        .nonempty({ message: "Nodes array cannot be empty." }),
      edges: z
        .array(edgeData)
        .describe("Array of edges connecting nodes.")
        .nonempty({ message: "Edges array cannot be empty." }),
    })
    .describe("Data for arc diagram with nodes and edges."),
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

// Arc diagram tool descriptor
const tool = {
  name: "generate_arc_diagram",
  description:
    "Generate an arc diagram to visualize relationships between nodes in a linear layout with curved edges. Useful for showing sequential processes with connections. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const arcDiagram = {
  schema,
  tool,
};
