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
- Data‑level: `fold` (`fields`, `key`, `value`), `map` (`callback` as string), `filter` (`callback` as string returning boolean)
- Order matters (e.g., `fold` then `diffY`)

### Example: Filter transform

```
{
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/stocks.json" },
  "transform": [ { "type": "filter", "callback": "(d) => d.symbol === 'GOOG'" } ]
}
```

## Style

- `fill`, `fillOpacity`, `stroke`, `strokeOpacity`, `lineWidth`, `gradient` ("x" or "y")
- Missing data connectors (G2 area): `style.connect`, `style.connectFill`, `style.connectFillOpacity`

## Scale & Axis

- `scale.color.range` or `scale.color.palette` (named or array)
- `axis` options: `{ x: { title, labelFormatter }, y: { title, labelFormatter } }`

## Tooltip

- Top-level mark tooltip: `tooltip: true|false|{ channel, valueFormatter, title, items }`
- Channel formatting: e.g., `{ channel: 'y', valueFormatter: '.2f' }` or `{ channel: 'y0', valueFormatter: '.0%' }`
- Child mark tooltips accept the same shape.

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

### Stacked + Channel-Formatted Tooltip

```
{
  "title": "Stacked Area with Tooltip Formatting",
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/unemployment-by-industry.json" },
  "encode": { "x": "(d) => new Date(d.date)", "y": "unemployed", "color": "industry", "series": "format" },
  "transform": [{ "type": "stackY", "orderBy": "maxIndex", "reverse": true }],
  "tooltip": { "channel": "y", "valueFormatter": ".2f" },
  "children": [
    {
      "type": "line",
      "encode": { "x": "(d) => new Date(d.date)", "y": "unemployed", "color": "industry", "series": "format", "shape": "smooth" },
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

### Gradient Area + Line Overlay

```
{
  "title": "Gradient Area (GOOG)",
  "data": { "type": "fetch", "value": "https://assets.antv.antgroup.com/g2/stocks.json" },
  "transform": [ { "type": "filter", "callback": "(d) => d.symbol === 'GOOG'" } ],
  "encode": { "x": "(d) => new Date(d.date)", "y": "price" },
  "style": { "fill": "linear-gradient(-90deg, white 0%, darkgreen 100%)" },
  "children": [
    { "type": "line", "encode": { "x": "(d) => new Date(d.date)", "y": "price" }, "style": { "stroke": "darkgreen", "lineWidth": 2 }, "tooltip": false }
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

## One-line zsh commands for examples

### examples/charts/area/area_01_basic.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Area + Line","data":[{"year":"1991","value":15468},{"year":"1992","value":16100},{"year":"1993","value":15900},{"year":"1994","value":17409},{"year":"1995","value":17000},{"year":"1996","value":31056},{"year":"1997","value":31982},{"year":"1998","value":32040},{"year":"1999","value":33233}],"shape":"area","style":{"fillOpacity":0.2},"axis":{"y":{"labelFormatter":"~s","title":false}},"children":[{"type":"line","encode":{"x":"year","y":"value","shape":"line"}}],"format":"html-url"}}}'


### examples/charts/area/area_02_step.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Step Area Chart","data":[{"year":"1991","value":15468},{"year":"1992","value":16100},{"year":"1993","value":15900},{"year":"1994","value":17409},{"year":"1995","value":17000},{"year":"1996","value":31056},{"year":"1997","value":31982},{"year":"1998","value":32040},{"year":"1999","value":33233}],"encode":{"x":"year","y":"value"},"transform":[],"scale":{},"axis":{"y":{"labelFormatter":"~s"}},"shape":"hvh","style":{"fillOpacity":0.4},"children":[{"type":"line","encode":{"x":"year","y":"value","shape":"hvh"}}],"format":"html-url"}}}'


### examples/charts/area/area_03_remote.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"AAPL Close Prices","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/aapl.json"},"encode":{"x":"(d) => new Date(d.date)","y":"close"},"format":"html-url"}}}'

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Area Chart","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/aapl.json"},"encode":{"x":"(d) => new Date(d.date)","y":"close"},"transform":[],"scale":{},"axis":{},"shape":"area","style":{},"children":[],"format":"html-url"}}}'

### examples/charts/area/area_04_missing.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Missing Data Area Chart","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/aapl.json"},"encode":{"x":"(d) => new Date(d.date)","y":"(d) => (new Date(d.date).getUTCMonth() <= 3 ? NaN : d.close)"},"style":{"connect":true,"connectFill":"grey","connectFillOpacity":0.15,"fill":"l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff","opacity":0.9,"stroke":"yellow"},"transform":[],"scale":{},"axis":{},"shape":"area","children":[],"format":"html-url"}}}'

### examples/charts/area/area_05_negative.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"North vs South Area Chart","data":[{"year":"1996","north":322,"south":162},{"year":"1997","north":324,"south":90},{"year":"1998","north":329,"south":50},{"year":"1999","north":342,"south":77},{"year":"2000","north":348,"south":35},{"year":"2001","north":334,"south":-45},{"year":"2002","north":325,"south":-88},{"year":"2003","north":316,"south":-120},{"year":"2004","north":318,"south":-156},{"year":"2005","north":330,"south":-123},{"year":"2006","north":355,"south":-88},{"year":"2007","north":366,"south":-66},{"year":"2008","north":337,"south":-45},{"year":"2009","north":352,"south":-29},{"year":"2010","north":377,"south":-45},{"year":"2011","north":383,"south":-88},{"year":"2012","north":344,"south":-132},{"year":"2013","north":366,"south":-146},{"year":"2014","north":389,"south":-169},{"year":"2015","north":334,"south":-184}],"transform":[{"type":"fold","fields":["north","south"],"key":"type","value":"value"}],"encode":{"x":"year","y":"value","color":"type"},"shape":"area","style":{"fillOpacity":0.3},"children":[{"type":"line","encode":{"x":"year","y":"value","color":"type","shape":"line"},"style":{"strokeWidth":2},"tooltip":false}],"format":"html-url"}}}'


### examples/charts/area/area_06_stacked.json

### examples/charts/area/area_07_percentage.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Percentage Area","data":[{"country":"Asia","year":"1750","value":502},{"country":"Asia","year":"1800","value":635},{"country":"Asia","year":"1850","value":809},{"country":"Asia","year":"1900","value":947},{"country":"Asia","year":"1950","value":1402},{"country":"Asia","year":"1999","value":3634},{"country":"Asia","year":"2050","value":5268},{"country":"Africa","year":"1750","value":106},{"country":"Africa","year":"1800","value":107},{"country":"Africa","year":"1850","value":111},{"country":"Africa","year":"1900","value":133},{"country":"Africa","year":"1950","value":221},{"country":"Africa","year":"1999","value":767},{"country":"Africa","year":"2050","value":1766},{"country":"Europe","year":"1750","value":163},{"country":"Europe","year":"1800","value":203},{"country":"Europe","year":"1850","value":276},{"country":"Europe","year":"1900","value":408},{"country":"Europe","year":"1950","value":547},{"country":"Europe","year":"1999","value":729},{"country":"Europe","year":"2050","value":628}],"chartType":"percentage","encode":{"x":"year","y":"value","color":"country"},"axis":{"x":{"title":false},"y":{"title":false,"labelFormatter":".0%"}},"style":{"fillOpacity":0.3},"children":[{"type":"line","encode":{"x":"year","y":"value","color":"country"},"tooltip":false}],"format":"html-url"}}}'


### examples/charts/area/area_08_gradient.json
- Terminal 1:
node build/index.js -t streamable -p 3001

- Terminal 2:
curl -s -X POST http://localhost:3001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data-binary '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Gradient Area (GOOG)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/stocks.json"},"transform":[{"type":"filter","callback":"(d) => d.symbol === \"GOOG\""}],"encode":{"x":"(d) => new Date(d.date)","y":"price"},"style":{"fill":"linear-gradient(-90deg, white 0%, darkgreen 100%)"},"children":[{"type":"line","encode":{"x":"(d) => new Date(d.date)","y":"price"},"style":{"stroke":"darkgreen","lineWidth":2},"tooltip":false}],"format":"html-url"}}}'

### examples/charts/area/area_09_smooth_stacked.json

### examples/charts/area/area_10_stripe.json

- Terminal 1:
node build/index.js -t streamable -p 3001

- Terminal 2:
curl -s -X POST http://localhost:3001/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    --data-raw '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Unemployment by Industry (Stripe)","data":{"type":"fetch","value":"https://gw.alipayobjects.com/os/bmw-prod/e58c9758-0a09-4527-aa90-fbf175b45925.json"},"encode":{"x":"(d) => new Date(d.date)","y":"unemployed","color":"industry"},"transform":[{"type":"stackY","orderBy":"value"}],"shape":"smooth","scale":{"x":{"utc":true}},"axis":{"x":{"title":"Date"},"y":    {"labelFormatter":"~s"}},"format":"html-url"}}}'

### examples/charts/area/area_11_maxindex.json

- Terminal 1:
node build/index.js -t streamable -p 3001

- Terminal 2:
curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data-binary '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Normalized Area (MaxIndex)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/unemployment-by-industry.json"},"encode":{"x":"(d) => new Date(d.date)","y":"unemployed","color":"industry"},"transform":[{"type":"stackY","orderBy":"maxIndex"},{"type":"normalizeY"}],"axis":{"y":{"labelFormatter":".0%"}},"shape":"smooth","format":"html-url"}}}'

### examples/charts/area/area_12_maxindex_reverse_line.json

curl -s -X POST http://localhost:3001/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" --data-binary '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Area (MaxIndex + Reverse) + Line","data":{"type":"fetch","value":"https://gw.alipayobjects.com/os/bmw-prod/f38a8ad0-6e1f-4bb3-894c-7db50781fdec.json"},"encode":{"x":"(d) => new Date(d.year)","y":"revenue","series":"format","color":"group"},"transform":[{"type":"stackY","orderBy":"maxIndex","reverse":true}],"axis":{"y":{"labelFormatter":"~s"}},"tooltip":{"channel":"y","valueFormatter":".2f"},"shape":"smooth","children":[{"type":"line","encode":{"x":"(d) => new Date(d.year)","y":"revenue","series":"format","color":"group","shape":"smooth"},"style":{"stroke":"white"},"tooltip":false,"transform":[{"type":"stackY","orderBy":"maxIndex","reverse":true,"y":"y1"}]}],"format":"html-url"}}}'

### examples/charts/area/area_13_pop_nomarlized.json

### examples/charts/area/area_15_diff.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Diff Area with Line","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperature-compare.json"},"encode":{"x":"(d) => new Date(d.date)","y":"temperature","color":"city"},"transform":[{"type":"fold","fields":["New York","San Francisco"],"key":"city","value":"temperature"},{"type":"diffY"}],"shape":"hvh","axis":{"y":{"labelFormatter":"~s"}},"children":[{"type":"line","encode":{"x":"(d) => new Date(d.date)","y":"San Francisco","shape":"hvh"},"style":{"stroke":"#000"},"tooltip":false}],"format":"html-url"}}}'


### examples/charts/area/area_16_band.json

node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Band Chart (G2)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperatures3.json"},"encode":{"x":"(d) => new Date(d.date)","y":["low","high"],"color":"(d) => d.high - d.low","series":"() => undefined"},"scale":{"color":{"palette":"reds"}},"style":{"gradient":"x"},"axis":{"x":{"title":"date"}},"format":"html-url"}}}'

### examples/charts/area/area_18_range_spline.json

curl -s -X POST http://localhost:3001/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data-raw '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":
  {"title":"Range Spline Area + Line + Marker","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/range-spline-area.json"},"transform":[{"type":"map","callback":"(d) => ({ x: d[0], low: d[1],high: d[2], v2: d[3], v3: d[4] })"}],"encode":{"x":"x","y":["low","high"]},"shape":"smooth","style":{"fillOpacity":0.65,"fill":"#64b5f6","lineWidth":1},"axis":{"y":{"title":false}},"scale":{"x":  {"type":"linear","tickCount":10}},"children":[{"type":"point","encode":{"x":"x","y":"v2","size":2,"shape":"point"}},{"type":"line","encode":{"x":"x","y":"v3","shape":"smooth"},"style":{"stroke":"#FF6B3B"}}],"format":"html-url"}}}'

  ### examples/charts/area/area_19_rank_trend.json

  curl -s -X POST http://localhost:3001/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data-raw '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Rank Trend Area","data":[{"month":"January","rank":200},{"month":"February","rank":160},{"month":"March","rank":100},{"month":"April","rank":80},{"month":"May","rank":99},{"month":"June","rank":36},{"month":"July","rank":40},{"month":"August","rank":20},{"month":"September","rank":12},{"month":"October","rank":15},{"month":"November","rank":6},{"month":"December","rank":1}],"encode":{"x":"month","y":"(d) => 200 -d.rank"},"shape":"smooth","style":{"fill":"l(270) 0:#ffffff 0.9:#7ec2f3 1:#1890ff","fillOpacity":0.2},"axis":{"y":{"labelFormatter":"~s"}},"tooltip":false,"children":[{"type":"line","encode":{"x":"month","y":"(d) => 200 -d.rank","shape":"smooth"},"style":{"lineWidth":2},"tooltip":{"title":"(d) => d.month","items":["(d) => ({ name:\"Rank\", value: 200 - d.rank })"]}}],"format":"html-url"}}}'