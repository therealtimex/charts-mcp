import { createUIResource } from "@mcp-ui/server";

// Size threshold for determining blob vs server mode (100KB)
const BLOB_SIZE_THRESHOLD = 100 * 1024;

export interface UIResourceOptions {
  uri: `ui://${string}`;
  html: string;
  title?: string;
  description?: string;
  mode?: "auto" | "blob" | "server";
  serverUrl?: string;
}

/**
 * Creates an MCP UI resource from HTML content
 * Automatically chooses between blob (inline) and server (URL) mode based on size
 */
export function createChartUIResource(options: UIResourceOptions) {
  const {
    uri,
    html,
    title,
    description,
    mode = "auto",
    serverUrl,
  } = options;

  const htmlSize = Buffer.byteLength(html, "utf8");
  const shouldUseBlob =
    mode === "blob" ||
    (mode === "auto" && htmlSize < BLOB_SIZE_THRESHOLD);

  if (shouldUseBlob) {
    // Blob mode: embed HTML directly
    return createUIResource({
      uri,
      content: {
        type: "rawHtml",
        htmlString: html,
      },
      encoding: "text",
      metadata: {
        title,
        description,
      },
    });
  }

  // Server mode: use external URL
  if (!serverUrl) {
    throw new Error(
      "Server URL is required when mode is 'server' or HTML exceeds size threshold",
    );
  }

  return createUIResource({
    uri,
    content: {
      type: "externalUrl",
      iframeUrl: serverUrl,
    },
    encoding: "text",
    metadata: {
      title,
      description,
    },
  });
}

/**
 * Checks if HTML size should use blob mode
 */
export function shouldUseBlob(html: string): boolean {
  const size = Buffer.byteLength(html, "utf8");
  return size < BLOB_SIZE_THRESHOLD;
}