#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');

async function testChoroplethMapHtmlUrl() {
  console.log('Testing choropleth map with html-url format...');
  
  const testData = {
    data: [
      { id: "CA", value: 39538223, name: "California" },
      { id: "TX", value: 29145505, name: "Texas" },
      { id: "FL", value: 21538187, name: "Florida" },
      { id: "NY", value: 20201249, name: "New York" },
      { id: "PA", value: 13002700, name: "Pennsylvania" }
    ],
    geoData: [
      {
        type: "Feature",
        id: "CA",
        geometry: {
          type: "Polygon",
          coordinates: [[[-124.4, 32.5], [-124.4, 42.0], [-114.1, 42.0], [-114.1, 32.5], [-124.4, 32.5]]]
        },
        properties: { name: "California" }
      },
      {
        type: "Feature", 
        id: "TX",
        geometry: {
          type: "Polygon",
          coordinates: [[[-106.6, 25.8], [-106.6, 36.5], [-93.5, 36.5], [-93.5, 25.8], [-106.6, 25.8]]]
        },
        properties: { name: "Texas" }
      },
      {
        type: "Feature", 
        id: "FL",
        geometry: {
          type: "Polygon",
          coordinates: [[[-87.6, 24.5], [-87.6, 31.0], [-80.0, 31.0], [-80.0, 24.5], [-87.6, 24.5]]]
        },
        properties: { name: "Florida" }
      },
      {
        type: "Feature", 
        id: "NY",
        geometry: {
          type: "Polygon",
          coordinates: [[[-79.8, 40.5], [-79.8, 45.0], [-71.9, 45.0], [-71.9, 40.5], [-79.8, 40.5]]]
        },
        properties: { name: "New York" }
      },
      {
        type: "Feature", 
        id: "PA",
        geometry: {
          type: "Polygon",
          coordinates: [[[-80.5, 39.7], [-80.5, 42.3], [-74.7, 42.3], [-74.7, 39.7], [-80.5, 39.7]]]
        },
        properties: { name: "Pennsylvania" }
      }
    ],
    colorScale: {
      type: "quantile",
      palette: "blues"
    },
    projection: {
      type: "mercator"
    },
    width: 900,
    height: 600,
    title: "US State Population (Interactive)",
    format: "html-url",
    legend: {
      color: true
    },
    tooltip: {
      items: [
        {
          name: "Population",
          field: "value",
          valueFormatter: "(value) => value.toLocaleString()"
        }
      ]
    }
  };

  try {
    const result = await callTool('generate_choropleth_map', testData);
    console.log('✅ Choropleth map HTML-URL generated!');
    console.log('HTML URL:', result.content[0].text);
    return result.content[0].text;
  } catch (error) {
    console.error('❌ Failed to generate HTML-URL:');
    console.error(error.message);
    return null;
  }
}

testChoroplethMapHtmlUrl().then(url => {
  if (url) {
    console.log('\n🌐 Interactive choropleth map available at:');
    console.log(url);
  }
  process.exit(url ? 0 : 1);
});