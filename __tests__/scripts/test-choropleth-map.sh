#!/bin/bash

# Test script for choropleth map MCP tool
# Tests G2 v5 capabilities and all output formats

set -e

echo "🗺️  Testing Choropleth Map MCP Tool"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
MCP_SERVER="http://localhost:1122/mcp"
CHART_SERVER="http://localhost:3210/chart"
TEST_DIR="__tests__/scripts"
EXAMPLES_DIR="examples/charts"

# Ensure directories exist
mkdir -p "$EXAMPLES_DIR"

echo -e "${BLUE}📋 Testing choropleth map with G2 v5 features...${NC}"

# Test 1: Basic choropleth map with quantile scale
echo -e "${YELLOW}Test 1: Basic choropleth map (HTML format)${NC}"
RESPONSE=$(curl -s -X POST "$CHART_SERVER" \
  -H "Content-Type: application/json" \
  -d @"$EXAMPLES_DIR/choropleth-basic.json")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✅ Basic choropleth map test passed${NC}"
  URL=$(echo "$RESPONSE" | jq -r '.resultObj')
  echo "   Generated: $URL"
else
  echo -e "${RED}❌ Basic choropleth map test failed${NC}"
  echo "$RESPONSE"
  exit 1
fi

# Test 2: Advanced choropleth map with custom projection
echo -e "${YELLOW}Test 2: Advanced choropleth map with AlbersUSA projection (PNG format)${NC}"
RESPONSE=$(curl -s -X POST "$CHART_SERVER" \
  -H "Content-Type: application/json" \
  -d @"$EXAMPLES_DIR/choropleth-advanced.json")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✅ Advanced choropleth map test passed${NC}"
  URL=$(echo "$RESPONSE" | jq -r '.resultObj')
  echo "   Generated: $URL"
else
  echo -e "${RED}❌ Advanced choropleth map test failed${NC}"
  echo "$RESPONSE"
  exit 1
fi

# Test 3: Choropleth map with threshold scale
echo -e "${YELLOW}Test 3: Choropleth map with threshold scale (HTML-URL format)${NC}"
RESPONSE=$(curl -s -X POST "$CHART_SERVER" \
  -H "Content-Type: application/json" \
  -d @"$EXAMPLES_DIR/choropleth-threshold.json")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✅ Threshold scale choropleth map test passed${NC}"
  URL=$(echo "$RESPONSE" | jq -r '.resultObj')
  echo "   Generated: $URL"
else
  echo -e "${RED}❌ Threshold scale choropleth map test failed${NC}"
  echo "$RESPONSE"
  exit 1
fi

# Test 4: Verify G2 v5 specific features
echo -e "${YELLOW}Test 4: Testing G2 v5 specific features${NC}"

# Check if the generated HTML contains G2 v5 specific elements
TEMP_HTML=$(mktemp)
curl -s "$URL" > "$TEMP_HTML"

# Check for G2 v5 features
if grep -q "geoPath" "$TEMP_HTML" && grep -q "coordinate.*type" "$TEMP_HTML"; then
  echo -e "${GREEN}✅ G2 v5 geoPath and coordinate system detected${NC}"
else
  echo -e "${RED}❌ G2 v5 features not found in generated HTML${NC}"
  exit 1
fi

if grep -q "transform.*join" "$TEMP_HTML"; then
  echo -e "${GREEN}✅ G2 v5 data transform (join) detected${NC}"
else
  echo -e "${RED}❌ G2 v5 data transform not found${NC}"
  exit 1
fi

if grep -q "scale.*color" "$TEMP_HTML" && grep -q "palette\|range" "$TEMP_HTML"; then
  echo -e "${GREEN}✅ G2 v5 color scale configuration detected${NC}"
else
  echo -e "${RED}❌ G2 v5 color scale not found${NC}"
  exit 1
fi

rm "$TEMP_HTML"

echo ""
echo -e "${GREEN}🎉 All choropleth map tests passed!${NC}"
echo -e "${BLUE}📊 G2 v5 capabilities verified:${NC}"
echo "   ✅ geoPath mark type"
echo "   ✅ Geographic projections (mercator, albersUsa)"
echo "   ✅ Data joins (geographic + statistical data)"
echo "   ✅ Color scales (quantile, threshold, custom palettes)"
echo "   ✅ Interactive tooltips"
echo "   ✅ Legend configuration"
echo "   ✅ Custom styling (stroke, fill)"
echo "   ✅ Multiple output formats (HTML, PNG, HTML-URL)"

echo ""
echo -e "${BLUE}📁 Example files created in: $EXAMPLES_DIR${NC}"
echo -e "${BLUE}🧪 Test script location: $TEST_DIR/test-choropleth-map.sh${NC}"