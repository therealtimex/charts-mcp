#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');
const { startRendererServer } = require('../../build/renderer/server.js');

async function testDonutHtmlUrl() {
  // Start the renderer server first
  startRendererServer(3210);
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = await callTool('generate_donut_chart', {
    data: [
      { category: 'Sports', value: 27500 },
      { category: 'Strategy', value: 11500 },
      { category: 'Action', value: 6000 },
      { category: 'Shooter', value: 3500 },
      { category: 'Other', value: 1500 }
    ],
    innerRadius: 0.5,
    width: 600,
    height: 400,
    title: 'Game Sales by Genre',
    format: 'html-url'
  });
  
  console.log('\nGenerated HTML URL:');
  console.log(result.content[0].text);
  
  process.exit(0);
}

testDonutHtmlUrl().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
