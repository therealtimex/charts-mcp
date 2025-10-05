import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as Charts from "../charts";
import { generateChartResult, generateMap } from "./generate";
import { getMapRequestServer } from "./env";
import { ValidateError } from "./validator";

// Chart type mapping
const CHART_TYPE_MAP = {
  generate_arc_diagram: "arc-diagram",
  generate_area_chart: "area",
  generate_bar_chart: "bar",
  generate_bi_directional_bar_chart: "bi-directional-bar",
  generate_boxplot_chart: "boxplot",
  generate_bubble_chart: "bubble-chart",
  generate_bubble_map: "bubble-map",
  generate_bullet_chart: "bullet",
  generate_chord_chart: "chord",
  generate_choropleth_map: "choropleth-map",
  generate_color_map: "color-map",
  generate_column_chart: "column",
  generate_compact_tree: "compact-tree",
  generate_concentric_graph: "concentric-graph",
  generate_contour_chart: "contour",
  generate_dendrogram: "dendrogram",
  generate_district_map: "district-map",
  generate_donut_chart: "donut-chart",
  generate_dual_axes_chart: "dual-axes",
  generate_fishbone_diagram: "fishbone-diagram",
  generate_flow_diagram: "flow-diagram",
  generate_funnel_chart: "funnel",
  generate_grid_graph: "grid-graph",
  generate_hierarchical_edge_bundling: "hierarchical-edge-bundling",
  generate_histogram_chart: "histogram",
  generate_hybrid_chart: "hybrid",
  generate_line_chart: "line",
  generate_liquid_chart: "liquid",
  generate_mind_map: "mind-map",
  generate_network_graph: "network-graph",
  generate_organization_chart: "organization-chart",
  generate_parallel_coordinates: "parallel-coordinates",
  generate_path_map: "path-map",
  generate_pie_chart: "pie",
  generate_pin_map: "pin-map",
  generate_radar_chart: "radar",
  generate_sankey_chart: "sankey",
  generate_scatter_chart: "scatter",
  generate_stream_graph: "stream-graph",
  generate_treemap_chart: "treemap",
  generate_venn_chart: "venn",
  generate_violin_chart: "violin",
  generate_word_cloud_chart: "word-cloud",
} as const;

/**
 * Call a tool to generate a chart based on the provided name and arguments.
 * @param tool The name of the tool to call, e.g., "generate_area_chart".
 * @param args The arguments for the tool, which should match the expected schema for the chart type.
 * @returns
 */
export async function callTool(tool: string, args: object = {}) {
  const chartType = CHART_TYPE_MAP[tool as keyof typeof CHART_TYPE_MAP];

  if (!chartType) {
    // Non-chart tools
    if (tool === "get_area_chart_guide") {
      const { areaGuide, readAreaGuide } = await import("../charts/area-guide.js");
      const result = z.object(areaGuide.schema).safeParse(args);
      if (!result.success) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid parameters: ${result.error.message}`);
      }
      const format = (result.data as any).format || "text";
      const text = readAreaGuide(format);
      return {
        content: [{ type: "text", text }],
        _meta: { description: "Area chart documentation guide", spec: { tool, format } },
      };
    }
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${tool}.`);
  }

  try {
    // Validate input using Zod before sending to API.
    // Select the appropriate schema based on the chart type.
    const schema = Charts[chartType].schema;

    if (schema) {
      // Use safeParse instead of parse and try-catch.
      const result = z.object(schema).safeParse(args);
      if (!result.success) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid parameters: ${result.error.message}`,
        );
      }
    }

    const isMapChartTool = [
      "generate_district_map",
      "generate_path_map",
      "generate_pin_map",
    ].includes(tool);

    if (isMapChartTool) {
      // For map charts, we use the generateMap function, and return the mcp result.
      const { metadata, ...result } = await generateMap(tool, args);
      return result;
    }

    // Generate chart result respecting format semantics:
    // - html: return MCP-UI resource (inline or server URL)
    // - html-url: return a URL string to an interactive HTML page
    // - png: return a URL string to a static PNG image
    const result = await generateChartResult(chartType, args as any);
    return {
      content: result.content,
      // Keep lightweight meta for clients that surface it
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _meta: {
        description:
          "Chart generation result. For format=html this is an MCP-UI resource; for html-url/png this is a URL.",
        spec: { type: chartType, ...args },
      },
    } as any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    if (error instanceof McpError) throw error;
    if (error instanceof ValidateError)
      throw new McpError(ErrorCode.InvalidParams, error.message);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate chart: ${error?.message || "Unknown error."}`,
    );
  }
}
