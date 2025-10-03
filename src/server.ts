import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as Charts from "./charts/index";
import {
  startHTTPStreamableServer,
  startSSEMcpServer,
  startStdioMcpServer,
} from "./services";
import { callTool } from "./utils/callTool";
import { getDisabledTools } from "./utils/env";
import { startRendererServer } from "./renderer/server";

/**
 * Creates and configures an MCP server for chart generation.
 */
export async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: "charts-mcp",
      version: "0.8.x",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  setupToolHandlers(server);
  setupResourceHandlers(server);
  setupPromptHandlers(server);
  // Start built-in renderer proxy so returned URLs can be local
  await startRendererServer();

  server.onerror = (error) => console.error("[MCP Error]", error);
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  return server;
}

/**
 * Gets enabled tools based on environment variables.
 */
function getEnabledTools() {
  const disabledTools = getDisabledTools();
  const allCharts = Object.values(Charts).map((module) => module.tool);

  if (disabledTools.length === 0) {
    return allCharts;
  }

  return allCharts.filter((tool) => !disabledTools.includes(tool.name));
}

/**
 * Sets up tool handlers for the MCP server.
 */
function setupToolHandlers(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getEnabledTools(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await callTool(request.params.name, request.params.arguments);
  });
}

function setupResourceHandlers(server: Server): void {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          name: "Area Chart Guide",
          uri: "doc://charts/area",
          title: "Area Chart JSON Guide",
          description: "How to prepare JSON for the area chart tool.",
          mimeType: "text/markdown",
        },
      ],
    } as any;
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    // doc templates: doc://charts/{type}
    if (uri.startsWith("doc://charts/")) {
      const type = uri.split("/")[2];
      if (type === "area") {
        const { readAreaGuide } = await import("./charts/area-guide.js");
        const text = readAreaGuide("text");
        return { contents: [{ uri, text, mimeType: "text/markdown" }] } as any;
      }
      const text = `No guide available for chart type: ${type}`;
      return { contents: [{ uri, text, mimeType: "text/plain" }] } as any;
    }
    // schema templates: schema://charts/{type}
    if (uri.startsWith("schema://charts/")) {
      const type = uri.split("/")[2];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyCharts: any = Charts as any;
        const mod = anyCharts?.[type];
        if (mod?.tool?.inputSchema) {
          const text = JSON.stringify(mod.tool.inputSchema, null, 2);
          return { contents: [{ uri, text, mimeType: "application/json" }] } as any;
        }
        const text = JSON.stringify({ error: `No schema available for chart type: ${type}` }, null, 2);
        return { contents: [{ uri, text, mimeType: "application/json" }] } as any;
      } catch (_e) {
        const text = JSON.stringify({ error: `Failed to load schema for ${type}` }, null, 2);
        return { contents: [{ uri, text, mimeType: "application/json" }] } as any;
      }
    }
    // examples templates: examples://charts/{type}/{variant}
    if (uri.startsWith("examples://charts/")) {
      const parts = uri.split("/");
      const type = parts[2];
      const variant = parts[3] || "basic";
      const fs = await import("node:fs");
      const path = await import("node:path");
      const file = path.resolve("examples/charts", `${type}.${variant}.json`);
      if (fs.existsSync(file)) {
        const text = fs.readFileSync(file, "utf8");
        return { contents: [{ uri, text, mimeType: "application/json" }] } as any;
      }
      const text = JSON.stringify({ error: `Example not found for ${type}/${variant}` }, null, 2);
      return { contents: [{ uri, text, mimeType: "application/json" }] } as any;
    }
    throw new Error("Unknown resource URI");
  });

  // Resource Templates listing (static)
  server.setRequestHandler(ListResourceTemplatesRequestSchema as any, async () => {
    return {
      resourceTemplates: [
        {
          name: "chart-doc",
          title: "Chart Guide",
          uriTemplate: "doc://charts/{type}",
          description: "Documentation for chart JSON specs by type",
          mimeType: "text/markdown",
        },
        {
          name: "chart-schema",
          title: "Chart Tool Schema",
          uriTemplate: "schema://charts/{type}",
          description: "Input schema (JSON) for a chart tool by type",
          mimeType: "application/json",
        },
        {
          name: "chart-example",
          title: "Chart Example",
          uriTemplate: "examples://charts/{type}/{variant}",
          description: "Example JSON payloads for chart tools",
          mimeType: "application/json",
        },
      ],
    } as any;
  });
}

function setupPromptHandlers(server: Server): void {
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: "area-chart-basic",
          description: "Basic area chart with year/value and area + line composition",
          arguments: [],
        },
        {
          name: "area-chart-band",
          description: "Band (range) area chart with gradient and palette",
          arguments: [],
        },
        {
          name: "area-chart-diff",
          description: "Diff area using fold + diffY with line overlay",
          arguments: [],
        },
        {
          name: "area-chart-date-close",
          description: "Area chart with date/close encodings using function-like x",
          arguments: [],
        },
      ],
    } as any;
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const name = request.params.name;
    const prompts: Record<string, { description: string; messages: any[] }> = {
      "area-chart-basic": {
        description: "Basic area + line template",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                "Use tools/call generate_area_chart with arguments matching this JSON template:\n\n" +
                JSON.stringify(
                  {
                    title: "Area + Line",
                    data: [
                      { year: "1991", value: 15468 },
                      { year: "1992", value: 16100 },
                    ],
                    shape: "area",
                    style: { fillOpacity: 0.2 },
                    axis: { y: { labelFormatter: "~s", title: false } },
                    children: [
                      { type: "line", encode: { x: "year", y: "value", shape: "line" } },
                    ],
                    format: "html-url",
                  },
                  null,
                  2,
                ),
            },
          },
        ],
      },
      "area-chart-band": {
        description: "Band area with gradient",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: JSON.stringify(
                {
                  title: "Band Chart (G2)",
                  data: {
                    type: "fetch",
                    value: "https://assets.antv.antgroup.com/g2/temperatures3.json",
                  },
                  encode: {
                    x: "(d) => new Date(d.date)",
                    y: ["low", "high"],
                    color: "(d) => d.high - d.low",
                    series: "() => undefined",
                  },
                  scale: { color: { palette: "reds" } },
                  style: { gradient: "x" },
                  axis: { x: { title: "date" } },
                  format: "html-url",
                },
                null,
                2,
              ),
            },
          },
        ],
      },
      "area-chart-diff": {
        description: "Diff area with line overlay",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: JSON.stringify(
                {
                  title: "Diff Area with Line",
                  data: {
                    type: "fetch",
                    value: "https://assets.antv.antgroup.com/g2/temperature-compare.json",
                  },
                  encode: {
                    x: "(d) => new Date(d.year)",
                    y: "revenue",
                    series: "format",
                    color: "group",
                  },
                  transform: [
                    {
                      type: "fold",
                      fields: ["New York", "San Francisco"],
                      key: "city",
                      value: "temperature",
                    },
                    { type: "diffY" },
                  ],
                  shape: "hvh",
                  children: [
                    {
                      type: "line",
                      encode: {
                        x: "(d) => new Date(d.year)",
                        y: "revenue",
                        series: "format",
                        shape: "smooth",
                        color: "group",
                      },
                      style: { stroke: "white" },
                      tooltip: false,
                      transform: [
                        { type: "stackY", orderBy: "maxIndex", reverse: true, y: "y1" },
                      ],
                    },
                  ],
                  format: "html-url",
                },
                null,
                2,
              ),
            },
          },
        ],
      },
      "area-chart-date-close": {
        description: "Date/Close with function x-encoding",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: JSON.stringify(
                {
                  title: "Area (Date/Close)",
                  data: [
                    { date: "2007-04-23T00:00:00.000Z", close: 93.24 },
                    { date: "2007-04-24T00:00:00.000Z", close: 95.35 },
                  ],
                  encode: { x: "(d) => new Date(d.date)", y: "close" },
                  shape: "hvh",
                  format: "html-url",
                },
                null,
                2,
              ),
            },
          },
        ],
      },
    };

    const p = prompts[name];
    if (!p) throw new Error("Unknown prompt");
    return p as any;
  });
}

/**
 * Runs the server with stdio transport.
 */
export async function runStdioServer(): Promise<void> {
  const server = await createServer();
  await startStdioMcpServer(server);
}

/**
 * Runs the server with SSE transport.
 */
export async function runSSEServer(
  endpoint = "/sse",
  port = 1122,
): Promise<void> {
  const server = await createServer();
  await startSSEMcpServer(server, endpoint, port);
}

/**
 * Runs the server with HTTP streamable transport.
 */
export async function runHTTPStreamableServer(
  endpoint = "/mcp",
  port = 1122,
): Promise<void> {
  await startHTTPStreamableServer(createServer, endpoint, port);
}
