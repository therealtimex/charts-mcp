import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import { validatedNodeEdgeDataSchema } from "../utils/validator";
import {
  EdgeSchema,
  FormatSchema,
  HeightSchema,
  NodeSchema,
  TextureSchema,
  ThemeSchema,
  WidthSchema,
} from "./base";

// Network graph input schema
const schema = {
  data: z
    .object({
      nodes: z
        .array(NodeSchema)
        .nonempty({ message: "At least one node is required." }),
      edges: z.array(EdgeSchema),
    })
    .describe(
      "Data for network graph chart, such as, { nodes: [{ name: 'node1' }, { name: 'node2' }], edges: [{ source: 'node1', target: 'node2', name: 'edge1' }] }",
    )
    .refine(validatedNodeEdgeDataSchema, {
      message: "Invalid parameters",
      path: ["data", "edges"],
    }),
  style: z
    .object({
      texture: TextureSchema,
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  format: FormatSchema,
};

// Network graph tool descriptor
const tool = {
  name: "generate_network_graph",
  description:
    "Generate a network graph chart to show relationships (edges) between entities (nodes), such as, relationships between people in social networks. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const networkGraph = {
  schema,
  tool,
};
