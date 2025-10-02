import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  TextureSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Contour plot data schema
const data = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// Contour plot input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for contour plot with x, y coordinates and z values, such as, [{ x: 0, y: 0, z: 10 }, { x: 0, y: 1, z: 12 }]. Z values represent the intensity or magnitude at each point.",
    )
    .nonempty({ message: "Contour plot data cannot be empty." }),
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
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Contour plot tool descriptor
const tool = {
  name: "generate_contour_plot",
  description:
    "Generate a contour plot to visualize three-dimensional data on a two-dimensional plane. Useful for showing temperature distributions, elevation maps, density plots, or any continuous spatial data. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const contour = {
  schema,
  tool,
};
