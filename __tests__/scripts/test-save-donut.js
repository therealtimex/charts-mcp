#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');
const fs = require('fs');

async function saveDonutHtml() {
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
    format: 'html'
  });
  
  const html = result.content[0].spec.html;
  const filename = 'donut-chart.html';
  fs.writeFileSync(filename, html);
  console.log('✅ Donut chart saved to:', filename);
  console.log('📊 Open it in a browser to view the interactive chart');
}

saveDonutHtml().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
