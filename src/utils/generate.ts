import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { getMapRequestServer, getServiceIdentifier, getVisRequestServer, getRenderMode, getUIResourceMode } from "./env";
import { buildChartHtml } from "../renderer/chart";
import { createChartUIResource } from "./uiResource";
import { ChartDispatcher } from "../renderer/chart-dispatcher";
import "../renderer/init-registry"; // Initialize the chart registry

/**
 * Generate a chart URL using the provided configuration.
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<string>} The generated chart URL.
 * @throws {Error} If the chart generation fails.
 */
export async function generateChartUrl(
  type: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  const url = getVisRequestServer();

  const response = await axios.post(
    url,
    {
      type,
      ...options,
      source: "charts-mcp",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { success, errorMessage, resultObj } = response.data;

  if (!success) {
    throw new Error(errorMessage);
  }

  return resultObj;
}

/**
 * Generate a chart with UI resource support
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<ResponseResult>} The generated chart result
 */
export async function generateChartResult(
  type: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<ResponseResult> {
  const format = options.format || "html";
  const renderMode = getRenderMode();
  const uiResourceMode = getUIResourceMode();

  // PNG format always returns URL
  if (format === "png") {
    const url = await generateChartUrl(type, { ...options, format: "png" });
    return {
      metadata: { type, options },
      content: [
        {
          type: "text",
          text: url,
        },
      ],
    };
  }

  // HTML URL format returns URL to interactive HTML page
  if (format === "html-url") {
    const url = await generateChartUrl(type, { ...options, format: "html" });
    return {
      metadata: { type, options },
      content: [
        {
          type: "text",
          text: url,
        },
      ],
    };
  }

  // Legacy URL mode (environment variable override)
  if (renderMode === "url") {
    const url = await generateChartUrl(type, options);
    return {
      metadata: { type, options },
      content: [
        {
          type: "text",
          text: url,
        },
      ],
    };
  }

  // MCP-UI resource mode (HTML format)
  // Try using the new G2 v5 dispatcher first, fallback to direct renderer
  let html: string;
  try {
    if (ChartDispatcher.isSupported(type)) {
      const result = await ChartDispatcher.dispatch(type, { type, ...options });
      html = result.html;
    } else {
      // Fallback to direct G2/G6 renderer
      html = await buildChartHtml(type, options);
    }
  } catch (error) {
    // If dispatcher fails, fallback to direct renderer
    console.error(`G2 v5 dispatcher failed for ${type}, falling back to direct renderer:`, error);
    html = await buildChartHtml(type, options);
  }

  const chartTitle = options.title || `${type} Chart`;
  const uri = `ui://charts-mcp/${type}/${Date.now()}` as `ui://${string}`;

  // Check if we need server URL for large charts
  let serverUrl: string | undefined;
  if (uiResourceMode === "server" || (uiResourceMode === "auto" && html.length > 100 * 1024)) {
    serverUrl = await generateChartUrl(type, { ...options, format: "html" });
  }

  const uiResource = createChartUIResource({
    uri,
    html,
    title: chartTitle,
    description: `Interactive ${type} chart`,
    mode: uiResourceMode,
    serverUrl,
  });

  return {
    metadata: { type, options },
    content: [uiResource as any],
  };
}

type ResponseResult = {
  metadata: unknown;
  /**
   * @docs https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result
   */
  content: CallToolResult["content"];
  isError?: CallToolResult["isError"];
};

/**
 * Generate a map
 * @param tool - The tool name
 * @param input - The input
 * @returns
 */
export async function generateMap(
  tool: string,
  input: unknown,
): Promise<ResponseResult> {
  const url = getMapRequestServer();

  if (!url) {
    throw new Error(
      "MAP_REQUEST_SERVER is not set. Configure it to an OSM/Leaflet-compatible map rendering service.",
    );
  }

  const response = await axios.post(
    url,
    {
      serviceId: getServiceIdentifier(),
      tool,
      input,
      source: "charts-mcp",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const { success, errorMessage, resultObj } = response.data;

  if (!success) {
    throw new Error(errorMessage);
  }

  const urlStr = String(resultObj);

  return {
    metadata: { tool, input },
    content: [
      {
        type: "text",
        text: urlStr,
      },
    ],
    // Provide additional meta in the result
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - carry custom meta for clients that display it
    _meta: {
      description:
        "Map generation result URL. Open to view the rendered map (PNG or HTML depending on format).",
      tool,
      input,
      url: urlStr,
    },
  };
}