import { z } from "zod";
import { zodToJsonSchema as zodToJsonSchemaOriginal } from "zod-to-json-schema";

// TODO: use zod v4 JSON to schema to replace zod-to-json-schema when v4 is stable
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const zodToJsonSchema = (schema: Record<string, z.ZodType<any>>) => {
  const FormatSchema = z
    .enum(["html", "png"]) // allow interactive HTML or static PNG
    .default("html")
    .optional()
    .describe('Output format: "png" or "html" (default).');
  const merged = {
    ...schema,
    ...(schema.format ? {} : { format: FormatSchema }),
  } as Record<string, z.ZodType<any>>;
  return zodToJsonSchemaOriginal(z.object(merged), {
    rejectedAdditionalProperties: undefined,
    $refStrategy: "none",
  });
};
