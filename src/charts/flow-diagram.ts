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

// Flow diagram input schema
const schema = {
  data: z
    .object({
      nodes: z
        .array(NodeSchema)
        .nonempty({ message: "At least one node is required." }),
      edges: z.array(EdgeSchema),
    })
    .describe(
      "Data for flow diagram chart, such as, { nodes: [{ name: 'node1' }, { name: 'node2' }], edges: [{ source: 'node1', target: 'node2', name: 'edge1' }] }.",
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

// Flow diagram tool descriptor
const tool = {
  name: "generate_flow_diagram",
  description:
    "Generate a flow diagram chart to show the steps and decision points of a process or system, such as, scenarios requiring linear process presentation. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const flowDiagram = {
  schema,
  tool,
};
