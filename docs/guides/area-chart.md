# Area Chart JSON Guide (G2 v5)

This guide shows how to prepare JSON for the `generate_area_chart` tool. It covers accepted data shapes, encodings, transforms, styles, composition, and test commands.

## Envelope (JSON‑RPC)

Use tools/call with arguments:

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "generate_area_chart", "arguments": { ... } }
}
```

## Data Shapes

- Basic: `[{ x, y, group? }]`
- Legacy: `[{ time, value, group? }]`
- G2 alias: `[{ year, value, group? }]`
- Range: `[{ x, low, high }]`
- Fetch: `{ type: "fetch", value: "https://..." }`
- Arbitrary (when `encode` provides mapping): e.g. `[{ date, close }]` with `encode: { x: "(d)=>new Date(d.date)", y: "close" }`

## Encodings

- Auto‑detect: x from `x|time|date`, y from `['low','high']|y|value`
- Custom: strings or function‑like strings, e.g. `"(d) => new Date(d.date)"`
- Channels: `x`, `y` (string or [low, high]), `color`, `series`, `shape`, `size` (children)

## Transforms

- Mark‑level: `stackY` (`orderBy`, `offset`, `reverse`, `y`), `normalizeY`, `diffY`
- Data‑level: `fold` (`fields`, `key`, `value`), `map` (`callback` as string)
- Order matters (e.g., `fold` then `diffY`)

## Style

- `fill`, `fillOpacity`, `stroke`, `strokeOpacity`, `lineWidth`, `gradient` ("x" or "y")
- Missing data connectors (G2 area): `style.connect`, `style.connectFill`, `style.connectFillOpacity`

## Scale & Axis

- `scale.color.range` or `scale.color.palette` (named or array)
- `axis` options: `{ x: { title, labelFormatter }, y: { title, labelFormatter } }`

## Composition (children)

- Each child: `{ type: "area|line|point", encode?, style?, tooltip?, transform?, data? }`
- Child data: `{ value: [...] }` or `{ type: "fetch", value: "https://..." }` or `{ transform: [...] }`
- Child tooltip: `false` or object; supports function strings in `title` and `items`

## Examples

### Area + Line (year/value)

```
{
  "title": "Area + Line",
  "data": [
    { "year": "1991", "value": 15468 },
    { "year": "1992", "value": 16100 }
  ],
  "shape": "area",
  "style": { "fillOpacity": 0.2 },
  "axis": { "y": { "labelFormatter": "~s", "title": false } },
  "children": [
    { "type": "line", "encode": { "x": "year", "y": "value", "shape": "line" } }
  ],
  "format": "html-url"
}
```

### Band Chart (range + gradient)

```
{
  "title": "Band Chart (G2)",
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/temperatures3.json" },
  "encode": {
    "x": "(d) => new Date(d.date)",
    "y": ["low", "high"],
    "color": "(d) => d.high - d.low",
    "series": "() => undefined"
  },
  "scale": { "color": { "palette": "reds" } },
  "style": { "gradient": "x" },
  "axis": { "x": { "title": "date" } },
  "format": "html-url"
}
```

### Diff Area + Line (fold + diffY)

```
{
  "title": "Diff Area with Line",
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/temperature-compare.json" },
  "encode": { "x": "(d) => new Date(d.year)", "y": "revenue", "series": "format", "color": "group" },
  "transform": [
    { "type": "fold", "fields": ["New York", "San Francisco"], "key": "city", "value": "temperature" },
    { "type": "diffY" }
  ],
  "shape": "hvh",
  "children": [
    {
      "type": "line",
      "encode": { "x": "(d) => new Date(d.year)", "y": "revenue", "series": "format", "shape": "smooth", "color": "group" },
      "style": { "stroke": "white" },
      "tooltip": false,
      "transform": [{ "type": "stackY", "orderBy": "maxIndex", "reverse": true, "y": "y1" }]
    }
  ],
  "format": "html-url"
}
```

### Temperature Band + Averages Overlay

```
{
  "title": "Temperature Band with Averages",
  "data": {
    "value": [{ "time": 1246406400000, "temperature": [14.3, 27.7] }],
    "transform": [
      { "type": "map", "callback": "(d) => ({ time: d.time, low: d.temperature[0], high: d.temperature[1] })" }
    ]
  },
  "children": [
    {
      "type": "area",
      "encode": { "x": "(d) => new Date(d.time).toLocaleDateString()", "y": ["low","high"], "shape": "area" },
      "style": { "fillOpacity": 0.3, "fill": "#64b5f6" },
      "tooltip": { "items": ["(d) => ({ name: '温度区间', value: `${d.low}-${d.high}` })"] }
    },
    {
      "type": "line",
      "data": { "value": [{ "time": 1246406400000, "temperature": 21.5 }] },
      "encode": { "x": "(d) => new Date(d.time).toLocaleDateString()", "y": "temperature", "shape": "line" },
      "style": { "lineWidth": 2 },
      "tooltip": { "title": false, "items": ["(d) => ({ name: '平均温度', value: d.temperature })"] }
    },
    {
      "type": "point",
      "data": { "value": [{ "time": 1246406400000, "temperature": 21.5 }] },
      "encode": { "x": "(d) => new Date(d.time).toLocaleDateString()", "y": "temperature", "shape": "point", "size": 4 },
      "tooltip": false
    }
  ],
  "format": "html-url"
}
```

### Missing Data (connect gaps)

```
{
  "title": "Area with Missing Data Connected",
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/aapl.json" },
  "encode": {
    "x": "(d) => new Date(d.date)",
    "y": "(d) => (new Date(d.date).getUTCMonth() <= 3 ? NaN : d.close)"
  },
  "style": {
    "connect": true,
    "connectFill": "grey",
    "connectFillOpacity": 0.15,
    "fill": "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
    "opacity": 0.9,
    "stroke": "yellow"
  },
  "format": "html-url"
}
```

## Test Commands

- Streamable HTTP:
```
node build/index.js -t streamable -p 3001
curl -s -X POST http://localhost:3001/mcp -H "Content-Type: application/json" --data-binary @request.json
```

- STDIO (framed):
```
node -e 'const fs=require("fs");const m=fs.readFileSync("request.json","utf8").trim();process.stdout.write(`Content-Length: ${Buffer.byteLength(m,"utf8")}\r\n\r\n${m}`);' | node build/index.js
```
