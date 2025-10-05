https://chatgpt.com/share/68df8e8d-fd80-8002-9615-9388c763dd02


`zsh` is interpreting the unquoted `[low,high]` as a glob pattern, and there’s another issue: `< {...}` tries to read **from a file named literally that JSON**, not from the JSON text. Use one of these:

### Easiest (here-string in zsh)

```sh
node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Band Chart (G2)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperatures3.json"},"encode":{"x":"(d) => new Date(d.date)","y":["low","high"],"color":"(d) => d.high - d.low","series":"() => undefined"},"scale":{"color":{"palette":"reds"}},"style":{"gradient":"x"},"axis":{"x":{"title":"date"}},"format":"html-url"}}}'
```

### Or pipe:

```sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Band Chart (G2)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperatures3.json"},"encode":{"x":"(d) => new Date(d.date)","y":["low","high"],"color":"(d) => d.high - d.low","series":"() => undefined"},"scale":{"color":{"palette":"reds"}},"style":{"gradient":"x"},"axis":{"x":{"title":"date"}},"format":"html-url"}}}' | node build/index.js
```

### Or via a file:

```sh
cat > request.json <<'JSON'
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Band Chart (G2)","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperatures3.json"},"encode":{"x":"(d) => new Date(d.date)","y":["low","high"],"color":"(d) => d.high - d.low","series":"() => undefined"},"scale":{"color":{"palette":"reds"}},"style":{"gradient":"x"},"axis":{"x":{"title":"date"}},"format":"html-url"}}}
JSON
node build/index.js < request.json
```

> Tip: always wrap the JSON in **single quotes** in the shell so `[]`, `*`, and `?` don’t get expanded.



Here’s the **single-line JSON-RPC object** version of what you posted:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Diff Area with Line","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperature-compare.json"},"encode":{"x":"(d) => new Date(d.date)","y":"temperature","color":"city"},"transform":[{"type":"fold","fields":["New York","San Francisco"],"key":"city","value":"temperature"},{"type":"diffY"}],"shape":"hvh","axis":{"y":{"labelFormatter":"~s"}},"children":[{"type":"line","encode":{"x":"(d) => new Date(d.date)","y":"San Francisco","shape":"hvh"},"style":{"stroke":"#000"},"tooltip":false}],"format":"html-url"}}}
```

zsh-safe ways to pass it to `node`:

**Here-string (recommended):**

```sh
node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Diff Area with Line","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperature-compare.json"},"encode":{"x":"(d) => new Date(d.date)","y":"temperature","color":"city"},"transform":[{"type":"fold","fields":["New York","San Francisco"],"key":"city","value":"temperature"},{"type":"diffY"}],"shape":"hvh","axis":{"y":{"labelFormatter":"~s"}},"children":[{"type":"line","encode":{"x":"(d) => new Date(d.date)","y":"San Francisco","shape":"hvh"},"style":{"stroke":"#000"},"tooltip":false}],"format":"html-url"}}}'
```

**Or via a file:**

```sh
cat > request.json <<'JSON'
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"Diff Area with Line","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/temperature-compare.json"},"encode":{"x":"(d) => new Date(d.date)","y":"temperature","color":"city"},"transform":[{"type":"fold","fields":["New York","San Francisco"],"key":"city","value":"temperature"},{"type":"diffY"}],"shape":"hvh","axis":{"y":{"labelFormatter":"~s"}},"children":[{"type":"line","encode":{"x":"(d) => new Date(d.date)","y":"San Francisco","shape":"hvh"},"style":{"stroke":"#000"},"tooltip":false}],"format":"html-url"}}}
JSON
node build/index.js < request.json
```



node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_area_chart","arguments":{"title":"AAPL Close Prices","data":{"type":"fetch","value":"https://assets.antv.antgroup.com/g2/aapl.json"},"encode":{"x":"(d) => new Date(d.date)","y":"close"},"format":"html-url"}}}'


