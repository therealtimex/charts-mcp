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

// Parallel coordinates input schema
const schema = {
  dimensions: z
    .array(z.string())
    .describe(
      "Array of dimension names to display as parallel axes, such as, ['mpg', 'cylinders', 'displacement', 'horsepower', 'weight'].",
    )
    .nonempty({ message: "Dimensions array cannot be empty." }),
  data: z
    .array(z.record(z.union([z.string(), z.number()])))
    .describe(
      "Data for parallel coordinates plot. Each object should contain values for all dimensions plus a name field, such as, [{ name: 'Car A', mpg: 18, cylinders: 8, displacement: 307, horsepower: 130, weight: 3504 }].",
    )
    .nonempty({ message: "Parallel coordinates data cannot be empty." }),
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

// Parallel coordinates tool descriptor
const tool = {
  name: "generate_parallel_coordinates",
  description:
    "Generate a parallel coordinates plot to visualize multivariate data. Useful for comparing multiple variables across different data points, finding patterns, and identifying outliers in high-dimensional datasets. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const parallelCoordinates = {
  schema,
  tool,
};
