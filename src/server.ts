import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
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
      },
    },
  );

  setupToolHandlers(server);
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
