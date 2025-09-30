import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import { type TreeDataType, validatedTreeDataSchema } from "../utils/validator";
import { FormatSchema, HeightSchema, TextureSchema, ThemeSchema, WidthSchema } from "./base";

// Fishbone node schema
// The recursive schema is not supported by gemini, and other clients, so we use a non-recursive schema which can represent a tree structure with a fixed depth.
// Ref: https://github.com/antvis/mcp-server-chart/issues/155
// Ref: https://github.com/antvis/mcp-server-chart/issues/132
export const FishboneNodeSchema: z.ZodType<TreeDataType> = z.object({
  name: z.string(),
  children: z
    .array(
      z.object({
        name: z.string(),
        children: z
          .array(
            z.object({
              name: z.string(),
              children: z
                .array(
                  z.object({
                    name: z.string(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

// Fishbone diagram input schema
const schema = {
  data: FishboneNodeSchema.describe(
    "Data for fishbone diagram chart which is a hierarchical structure, such as, { name: 'main topic', children: [{ name: 'topic 1', children: [{ name: 'subtopic 1-1' }] }] }, and the maximum depth is 3.",
  ).refine(validatedTreeDataSchema, {
    message: "Invalid parameters: node name is not unique.",
    path: ["data"],
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

// Fishbone diagram tool descriptor
const tool = {
  name: "generate_fishbone_diagram",
  description:
    "Generate a fishbone diagram chart to uses a fish skeleton, like structure to display the causes or effects of a core problem, with the problem as the fish head and the causes/effects as the fish bones. It suits problems that can be split into multiple related factors. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const fishboneDiagram = {
  schema,
  tool,
};
