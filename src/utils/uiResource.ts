export type UIResource = {
  type: "ui";
  name: string;
  uri: `ui://${string}`;
  fallback?: {
    type: "text";
    text: string;
  };
  spec: {
    title: string;
    description: string;
    html?: string;
    htmlUrl?: string;
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
  if (mode === "server" && serverUrl) {
    return {
      type: "ui",
      name: title,
      uri,
      fallback: {
        type: "text",
        text: serverUrl,
      },
      spec: {
        title,
        description,
        htmlUrl: serverUrl,
      },
    };
  }

  return {
    type: "ui",
    name: title,
    uri,
    spec: {
      title,
      description,
      html,
    },
  };
}
