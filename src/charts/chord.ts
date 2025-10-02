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

// Chord diagram data schema
const data = z.object({
  source: z.string(),
  target: z.string(),
  value: z.number(),
});

// Chord diagram node schema
const node = z.object({
  id: z.string().describe("Unique identifier for the node."),
  label: z.string().optional().describe("Display label for the node."),
});

// Chord diagram input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for chord diagram showing flows between entities, such as, [{ source: 'North', target: 'South', value: 15 }, { source: 'South', target: 'North', value: 8 }].",
    )
    .nonempty({ message: "Chord diagram data cannot be empty." }),
  nodes: z
    .array(node)
    .optional()
    .describe(
      "Optional: A separate dataset for defining nodes. If not provided, nodes will be inferred from the data links. Useful for ensuring specific node ordering or including nodes with no connections.",
    ),
  scale: z
    .object({
      color: z
        .object({
          domain: z
            .array(z.string())
            .optional()
            .describe(
              "Explicitly set the order of nodes around the circle. This determines which nodes appear and in what sequence.",
            ),
          range: PaletteSchema.describe(
            "Define the color palette for the nodes.",
          ),
        })
        .optional()
        .describe("Color scale configuration."),
    })
    .optional()
    .describe(
      "Advanced scale configuration. Prefer scale.color.range over style.palette for better control.",
    ),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema.describe(
        "Color palette for the chart. Note: Prefer using scale.color.range for more control.",
      ),
      texture: TextureSchema,
      labelFontSize: z.number().optional().describe("Font size for labels."),
      labelFill: z.string().optional().describe("Color for label text."),
      linkFillOpacity: z.number().optional().describe("Opacity for link fills."),
      nodeWidthRatio: z.number().optional().describe("Width ratio for nodes."),
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  tooltip: z
    .object({
      items: z.array(z.object({
        field: z.string(),
        name: z.string(),
      })).optional().describe("Tooltip items configuration."),
    })
    .optional()
    .describe("Tooltip configuration."),
  interaction: z
    .array(z.object({
      type: z.string(),
      background: z.boolean().optional(),
    }))
    .optional()
    .describe("Interaction configuration."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  format: FormatSchema,
};

// Chord diagram tool descriptor
const tool = {
  name: "generate_chord",
  description:
    "Generate a chord diagram to visualize flows and relationships between entities in a circular layout. Ideal for showing migration patterns, trade flows, or any inter-entity relationships. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const chord = {
  schema,
  tool,
};
