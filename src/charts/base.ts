import { z } from "zod";

// Define Zod schemas for base configuration properties
export const ThemeSchema = z
  .enum(["default", "academy", "dark"])
  .optional()
  .default("default")
  .describe("Set the theme for the chart, optional, default is 'default'.");

export const BackgroundColorSchema = z
  .string()
  .optional()
  .describe("Background color of the chart, such as, '#fff'.");

export const PaletteSchema = z
  .array(z.string())
  .optional()
  .describe("Color palette for the chart, it is a collection of colors.");

export const TextureSchema = z
  .enum(["default", "rough"])
  .optional()
  .default("default")
  .describe(
    "Set the texture for the chart, optional, default is 'default'. 'rough' refers to hand-drawn style.",
  );

export const WidthSchema = z
  .number()
  .optional()
  .default(600)
  .describe("Set the width of chart, default is 600.");

export const HeightSchema = z
  .number()
  .optional()
  .default(400)
  .describe("Set the height of chart, default is 400.");

export const TitleSchema = z
  .string()
  .optional()
  .default("")
  .describe("Set the title of chart.");

export const AxisXTitleSchema = z
  .string()
  .optional()
  .default("")
  .describe("Set the x-axis title of chart.");

export const AxisYTitleSchema = z
  .string()
  .optional()
  .default("")
  .describe("Set the y-axis title of chart.");

export const FormatSchema = z
  .enum(["html", "html-url", "png"])
  .optional()
  .default("html")
  .describe("Output format: 'html' returns an interactive MCP-UI resource (default), 'html-url' returns a URL to an interactive HTML page, 'png' returns a static image URL. MCP-UI resources render directly in compatible clients for better interactivity.");

export const NodeSchema = z.object({
  name: z.string(),
});

export const EdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  name: z.string().optional().default(""),
});

// --- The following are only available for Map charts ---

export const MapTitleSchema = z
  .string()
  .describe(
    "The map title should not exceed 16 characters. The content should be consistent with the information the map wants to convey and should be accurate, rich, creative, and attractive.",
  );

export const MapWidthSchema = z
  .number()
  .optional()
  .default(1600)
  .describe("Set the width of map, default is 1600.");

export const MapHeightSchema = z
  .number()
  .optional()
  .default(1000)
  .describe("Set the height of map, default is 1000.");

export const POIsSchema = z
  .array(z.string())
  .nonempty("At least one POI name is required.")
  .describe(
    'A list of keywords for the names of points of interest (POIs). These POIs usually contain a group of places with similar locations, so the names should be descriptive and include context to distinguish them, such as "Eiffel Tower, Paris" is better than "Eiffel Tower", "Golden Gate Bridge, San Francisco" is better than "Golden Gate Bridge". Be specific when a location name may appear in multiple areas. The tool will use these keywords to search for specific POIs and query their detailed data, such as latitude and longitude, location photos, etc. For example, ["Statue of Liberty, New York", "Times Square, New York", "Central Park, New York"].',
  );
