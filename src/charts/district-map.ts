import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import { FormatSchema, MapHeightSchema, MapTitleSchema, MapWidthSchema } from "./base";

const DistrictNameSchema = z
  .string()
  .describe(
    'Keywords for the name of an administrative region (e.g., country, state, province, city, district, or county). The name should be specific and include descriptive context, for example, "San Francisco, California" is better than "San Francisco", "Tokyo, Japan" is better than "Tokyo". Avoid vague names.',
  );

const StyleSchema = z
  .object({
    fillColor: z
      .string()
      .optional()
      .describe("Fill color, rgb or rgba format."),
  })
  .optional()
  .describe("Style settings.");

const SubDistrictSchema = z.object({
  name: DistrictNameSchema,
  dataValue: z
    .string()
    .optional()
    .describe("Data value, numeric string or enumeration string."),
  style: StyleSchema,
});

const schema = {
  title: MapTitleSchema,
  data: z
    .object({
      name: DistrictNameSchema,
      style: StyleSchema,
      colors: z
        .array(z.string())
        .default([
          "#1783FF",
          "#00C9C9",
          "#F0884D",
          "#D580FF",
          "#7863FF",
          "#60C42D",
          "#BD8F24",
          "#FF80CA",
          "#2491B3",
          "#17C76F",
        ])
        .optional()
        .describe("Data color list, in rgb or rgba format."),
      dataType: z
        .enum(["number", "enum"])
        .optional()
        .describe("The type of the data value, numeric or enumeration type"),
      dataLabel: z.string().optional().describe('Data label, such as "GDP"'),
      dataValue: z
        .string()
        .optional()
        .describe("Data value, numeric string or enumeration string."),
      dataValueUnit: z
        .string()
        .optional()
        .describe('Data unit, such as "万亿"'),
      showAllSubdistricts: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to display all subdistricts."),
      subdistricts: z
        .array(SubDistrictSchema)
        .optional()
        .describe(
          "Sub-administrative regions are used to display the regional composition or regional distribution of related data.",
        ),
    })
    .describe(
      'Administrative division data, lower-level administrative divisions are optional. There are usually two scenarios: one is to simply display the regional composition, only `fillColor` needs to be configured, and all administrative divisions are consistent, representing that all blocks are connected as one; the other is the regional data distribution scenario, first determine the `dataType`, `dataValueUnit` and `dataLabel` configurations, `dataValue` should be a meaningful value and consistent with the meaning of dataType, and then determine the style configuration. The `fillColor` configuration represents the default fill color for areas without data. Lower-level administrative divisions do not need `fillColor` configuration, and their fill colors are determined by the `colors` configuration (If `dataType` is "number", only one base color (warm color) is needed in the list to calculate the continuous data mapping color band; if `dataType` is "enum", the number of color values in the list is equal to the number of enumeration values (contrast colors)). If `subdistricts` has a value, `showAllSubdistricts` must be set to true. For example, {"title": "陕西省地级市分布图", "data": {"name": "陕西省", "showAllSubdistricts": true, "dataLabel": "城市", "dataType": "enum", "colors": ["#4ECDC4", "#A5D8FF"], "subdistricts": [{"name": "西安市", "dataValue": "省会"}, {"name": "宝鸡市", "dataValue": "地级市"}, {"name": "咸阳市", "dataValue": "地级市"}, {"name": "铜川市", "dataValue": "地级市"}, {"name": "渭南市", "dataValue": "地级市"}, {"name": "延安市", "dataValue": "地级市"}, {"name": "榆林市", "dataValue": "地级市"}, {"name": "汉中市", "dataValue": "地级市"}, {"name": "安康市", "dataValue": "地级市"}, {"name": "商洛市", "dataValue": "地级市"}]}, "width": 1000, "height": 1000}.',
    ),
  width: MapWidthSchema,
  height: MapHeightSchema,
  format: FormatSchema,
};

// https://modelcontextprotocol.io/specification/2025-03-26/server/tools#listing-tools
const tool = {
  name: "generate_district_map",
  description:
    "Generates regional distribution maps, which are usually used to show the administrative divisions and coverage of a dataset. It is not suitable for showing the distribution of specific locations, such as urban administrative divisions, GDP distribution maps of provinces and cities across the country, etc. Returns an interactive MCP-UI resource by default (format='html') that renders directly in compatible clients, a URL to an interactive HTML page (format='html-url'), or a static PNG image URL (format='png') for reports and documents.",
  inputSchema: zodToJsonSchema(schema),
};

export const districtMap = {
  schema,
  tool,
};
