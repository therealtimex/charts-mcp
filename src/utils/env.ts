import process from "node:process";

/**
 * Get the VIS_REQUEST_SERVER from environment variables.
 */
export function getVisRequestServer() {
  const port = Number(process.env.RENDER_PORT) || 3210;
  return process.env.VIS_REQUEST_SERVER || `http://localhost:${port}/chart`;
}

/**
 * Get the MAP_REQUEST_SERVER from environment variables.
 * This should point to an OSM/Leaflet-based map renderer service.
 */
export function getMapRequestServer() {
  const port = Number(process.env.RENDER_PORT) || 3210;
  return process.env.MAP_REQUEST_SERVER || `http://localhost:${port}/map`;
}

/**
 * Get the `SERVICE_ID` from environment variables.
 */
export function getServiceIdentifier() {
  return process.env.SERVICE_ID;
}

/**
 * Get the list of disabled tools from environment variables.
 */
export function getDisabledTools(): string[] {
  const disabledTools = process.env.DISABLED_TOOLS;
  if (!disabledTools || disabledTools === "undefined") {
    return [];
  }
  return disabledTools.split(",");
}

/**
 * Get the render mode: "url" (legacy), "ui-resource" (MCP-UI), or "auto"
 * Default is "ui-resource" for better UX
 */
export function getRenderMode(): "url" | "ui-resource" | "auto" {
  const mode = process.env.RENDER_MODE?.toLowerCase();
  if (mode === "url" || mode === "ui-resource" || mode === "auto") {
    return mode;
  }
  return "ui-resource"; // Default to MCP-UI mode
}

/**
 * Get the UI resource mode: "auto", "blob", or "server"
 * Default is "auto" which uses size-based detection
 */
export function getUIResourceMode(): "auto" | "blob" | "server" {
  const mode = process.env.UI_RESOURCE_MODE?.toLowerCase();
  if (mode === "blob" || mode === "server" || mode === "auto") {
    return mode;
  }
  return "auto";
}
