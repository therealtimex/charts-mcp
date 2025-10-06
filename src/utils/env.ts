import process from "node:process";
import { getRendererPort } from "../renderer/server";

/**
 * Get the VIS_REQUEST_SERVER from environment variables.
 */
export function getVisRequestServer() {
  // Use actual renderer port if available, otherwise use configured/default port
  const actualPort = getRendererPort();
  const configuredPort = Number(process.env.RENDER_PORT) || 3210;
  const port = actualPort || configuredPort;
  return process.env.VIS_REQUEST_SERVER || `http://localhost:${port}/chart`;
}

/**
 * Get the MAP_REQUEST_SERVER from environment variables.
 * This should point to an OSM/Leaflet-based map renderer service.
 */
export function getMapRequestServer() {
  // Use actual renderer port if available, otherwise use configured/default port
  const actualPort = getRendererPort();
  const configuredPort = Number(process.env.RENDER_PORT) || 3210;
  const port = actualPort || configuredPort;
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
 * Get an explicit allowlist of chart types to expose.
 * Chart type names correspond to `src/charts/index.ts` export keys
 * (e.g., 'area-chart', 'district-map', 'path-map', 'pin-map').
 *
 * Env vars:
 * - ENABLED_CHART_TYPES: comma-separated list of chart type ids
 * - ALLOWED_CHART_TYPES: alias of ENABLED_CHART_TYPES
 *
 * Defaults to a minimal set while 2.0.x migrations complete.
 */
export function getEnabledChartTypes(): string[] {
  const val = process.env.ENABLED_CHART_TYPES || process.env.ALLOWED_CHART_TYPES || "";
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");
  const lower = val.trim().toLowerCase();
  // Special values meaning "allow all"
  if (lower === "*" || lower === "all" || lower === "any") {
    return [];
  }
  // Default: allow all (no restriction) so new tools are auto-discoverable.
  if (!val) return [];
  return val.split(",").map(normalize).filter(Boolean);
}

/**
 * Get the RENDER_MODE from environment variables.
 */
export function getRenderMode() {
  return process.env.RENDER_MODE || "html";
}

/**
 * Get the UI_RESOURCE_MODE from environment variables.
 */
export function getUIResourceMode() {
  return process.env.UI_RESOURCE_MODE || "auto";
}
