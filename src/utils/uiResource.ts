// MCP‑UI resource shape, per docs/mcpui/protocol-details.md
export type UIResource = {
  type: "resource";
  resource: {
    uri: string; // ui://charts-mcp/<type>/<id>
    mimeType: "text/html" | "text/uri-list" | "application/vnd.mcp-ui.remote-dom";
    text?: string; // HTML string or URI list text
    blob?: string; // optional base64 content (unused here)
  };
};

type CreateChartUIResourceOptions = {
  uri: `ui://${string}`;
  html: string;
  title: string;
  description: string;
  mode: string;
  serverUrl?: string;
};

export function createChartUIResource({
  uri,
  html,
  title,
  description,
  mode,
  serverUrl,
}: CreateChartUIResourceOptions): UIResource {
  // If we have a serverUrl (either mode==='server' or auto-switch due to size),
  // return a URI list resource pointing at the hosted page.
  if (serverUrl) {
    return {
      type: "resource",
      resource: {
        uri,
        mimeType: "text/uri-list",
        text: serverUrl,
      },
    };
  }

  // Inline HTML content
  return {
    type: "resource",
    resource: {
      uri,
      mimeType: "text/html",
      text: html,
    },
  };
}
