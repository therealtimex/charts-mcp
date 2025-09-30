import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  FormatSchema,
  MapHeightSchema,
  MapTitleSchema,
  MapWidthSchema,
  POIsSchema,
} from "./base";

const schema = {
  title: MapTitleSchema,
  data: z
    .array(
      z.object({ data: POIsSchema }).describe("The route and places along it."),
    )
    .nonempty("At least one route is required.")
    .describe(
      'Routes, each group represents all POIs along a route. For example, [{ "data": ["西安钟楼", "西安大唐不夜城", "西安大雁塔"] }, { "data": ["西安曲江池公园", "西安回民街"] }]',
    ),
  width: MapWidthSchema,
  height: MapHeightSchema,
  format: FormatSchema,
};

// https://modelcontextprotocol.io/specification/2025-03-26/server/tools#listing-tools
const tool = {
  name: "generate_path_map",
  description:
    "Generate a route map to display the user's planned route, such as travel guide routes. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const pathMap = {
  schema,
  tool,
};
