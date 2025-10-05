/**
 * Advanced Interactivity Module
 * Provides drill-down, filtering, tooltips, and dynamic interactions
 */

export interface InteractivityConfig {
  tooltip?: boolean | TooltipConfig;
  drillDown?: boolean | DrillDownConfig;
  filter?: boolean | FilterConfig;
  zoom?: boolean | ZoomConfig;
  brush?: boolean | BrushConfig;
  legend?: boolean | LegendConfig;
}

export interface TooltipConfig {
  enabled: boolean;
  shared?: boolean;
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  formatter?: string; // JavaScript function as string
  customContent?: string; // Custom HTML template
}

export interface DrillDownConfig {
  enabled: boolean;
  levels?: number;
  breadcrumb?: boolean;
  onDrill?: string; // JavaScript function as string
}

export interface FilterConfig {
  enabled: boolean;
  type?: 'range' | 'category' | 'search';
  position?: 'top' | 'bottom' | 'left' | 'right';
  fields?: string[];
}

export interface ZoomConfig {
  enabled: boolean;
  type?: 'scroll' | 'slider' | 'pinch';
  direction?: 'x' | 'y' | 'both';
}

export interface BrushConfig {
  enabled: boolean;
  type?: 'x' | 'y' | 'rect' | 'polygon';
  action?: 'filter' | 'highlight';
}

export interface LegendConfig {
  enabled: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  interactive?: boolean;
}

/**
 * Generate interactivity scripts for G2 charts
 */
export function buildG2Interactivity(config: InteractivityConfig): string {
  const scripts: string[] = [];

  // Tooltip
  if (config.tooltip) {
    const tooltipConfig = typeof config.tooltip === 'object' ? config.tooltip : { enabled: true };
    scripts.push(buildG2Tooltip(tooltipConfig));
  }

  // Drill-down
  if (config.drillDown) {
    const drillDownConfig = typeof config.drillDown === 'object' ? config.drillDown : { enabled: true };
    scripts.push(buildG2DrillDown(drillDownConfig));
  }

  // Filter
  if (config.filter) {
    const filterConfig = typeof config.filter === 'object' ? config.filter : { enabled: true };
    scripts.push(buildG2Filter(filterConfig));
  }

  // Zoom
  if (config.zoom) {
    const zoomConfig = typeof config.zoom === 'object' ? config.zoom : { enabled: true };
    scripts.push(buildG2Zoom(zoomConfig));
  }

  // Brush
  if (config.brush) {
    const brushConfig = typeof config.brush === 'object' ? config.brush : { enabled: true };
    scripts.push(buildG2Brush(brushConfig));
  }

  // Legend
  if (config.legend) {
    const legendConfig = typeof config.legend === 'object' ? config.legend : { enabled: true };
    scripts.push(buildG2Legend(legendConfig));
  }

  return scripts.join('\n\n');
}

function buildG2Tooltip(config: TooltipConfig): string {
  if (!config.enabled) return '';

  const position = config.position || 'auto';
  const shared = config.shared !== false;

  return `
// Enhanced Tooltip
chart.interaction('tooltip', true);
chart.tooltip({
  shared: ${shared},
  position: '${position}',
  ${config.customContent ? `customContent: (title, items) => {
    ${config.customContent}
  },` : ''}
  ${config.formatter ? `itemTpl: ${config.formatter},` : ''}
  showTitle: true,
  showMarkers: true,
  domStyles: {
    'g2-tooltip': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      borderRadius: '4px',
      padding: '12px',
      fontSize: '14px'
    }
  }
});`;
}

function buildG2DrillDown(config: DrillDownConfig): string {
  if (!config.enabled) return '';

  return `
// Drill-down functionality
let drillDownLevel = 0;
const drillDownStack = [];
const maxLevel = ${config.levels || 3};

${config.breadcrumb ? `
// Breadcrumb navigation
const breadcrumb = document.createElement('div');
breadcrumb.id = 'breadcrumb';
breadcrumb.style.cssText = 'padding: 8px; font-size: 14px; color: #666;';
document.body.insertBefore(breadcrumb, document.getElementById('container'));

function updateBreadcrumb() {
  breadcrumb.innerHTML = drillDownStack.map((item, i) =>
    \`<span style="cursor: pointer; color: #1890ff;" data-level="\${i}">\${item.name}</span>\`
  ).join(' > ');

  breadcrumb.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', (e) => {
      const targetLevel = parseInt(e.target.dataset.level);
      drillUp(targetLevel);
    });
  });
}
` : ''}

chart.on('element:click', (evt) => {
  if (drillDownLevel >= maxLevel) return;

  const data = evt.data?.data;
  if (!data) return;

  // Store current state
  drillDownStack.push({
    level: drillDownLevel,
    data: chart.getData(),
    name: data.category || data.name || 'Level ' + drillDownLevel
  });

  drillDownLevel++;

  ${config.onDrill ? `
  // Custom drill-down logic
  const drillDownData = (${config.onDrill})(data, drillDownLevel);
  chart.changeData(drillDownData);
  ` : `
  // Default drill-down: filter by clicked category
  const filteredData = originalData.filter(d => d.category === data.category);
  chart.changeData(filteredData);
  `}

  ${config.breadcrumb ? 'updateBreadcrumb();' : ''}
});

function drillUp(targetLevel) {
  if (targetLevel === undefined) targetLevel = drillDownLevel - 1;
  if (targetLevel < 0 || drillDownStack.length === 0) return;

  const state = drillDownStack[targetLevel];
  chart.changeData(state.data);
  drillDownLevel = targetLevel;
  drillDownStack.length = targetLevel;

  ${config.breadcrumb ? 'updateBreadcrumb();' : ''}
}`;
}

function buildG2Filter(config: FilterConfig): string {
  if (!config.enabled) return '';

  const position = config.position || 'top';
  const type = config.type || 'category';

  return `
// Filter controls
const filterContainer = document.createElement('div');
filterContainer.id = 'filter-container';
filterContainer.style.cssText = 'padding: 12px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;';

${type === 'range' ? `
// Range filter
const rangeLabel = document.createElement('label');
rangeLabel.textContent = 'Filter Range: ';
rangeLabel.style.marginRight = '8px';

const rangeMin = document.createElement('input');
rangeMin.type = 'number';
rangeMin.placeholder = 'Min';
rangeMin.style.cssText = 'width: 80px; padding: 4px; margin-right: 8px;';

const rangeMax = document.createElement('input');
rangeMax.type = 'number';
rangeMax.placeholder = 'Max';
rangeMax.style.cssText = 'width: 80px; padding: 4px; margin-right: 8px;';

const applyBtn = document.createElement('button');
applyBtn.textContent = 'Apply';
applyBtn.style.cssText = 'padding: 4px 12px; cursor: pointer;';

filterContainer.appendChild(rangeLabel);
filterContainer.appendChild(rangeMin);
filterContainer.appendChild(rangeMax);
filterContainer.appendChild(applyBtn);

applyBtn.addEventListener('click', () => {
  const min = parseFloat(rangeMin.value);
  const max = parseFloat(rangeMax.value);
  const filteredData = originalData.filter(d => {
    const value = d.value;
    return (!isNaN(min) ? value >= min : true) && (!isNaN(max) ? value <= max : true);
  });
  chart.changeData(filteredData);
});
` : type === 'search' ? `
// Search filter
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search...';
searchInput.style.cssText = 'width: 200px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;';

filterContainer.appendChild(searchInput);

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  if (!query) {
    chart.changeData(originalData);
    return;
  }
  const filteredData = originalData.filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(query))
  );
  chart.changeData(filteredData);
});
` : `
// Category filter
const categories = [...new Set(originalData.map(d => d.category))];
const select = document.createElement('select');
select.style.cssText = 'padding: 6px; border: 1px solid #ddd; border-radius: 4px;';

const allOption = document.createElement('option');
allOption.value = '';
allOption.textContent = 'All Categories';
select.appendChild(allOption);

categories.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat;
  option.textContent = cat;
  select.appendChild(option);
});

filterContainer.appendChild(select);

select.addEventListener('change', (e) => {
  const category = e.target.value;
  if (!category) {
    chart.changeData(originalData);
    return;
  }
  const filteredData = originalData.filter(d => d.category === category);
  chart.changeData(filteredData);
});
`}

const container = document.getElementById('container');
container.parentNode.insertBefore(filterContainer, container);`;
}

function buildG2Zoom(config: ZoomConfig): string {
  if (!config.enabled) return '';

  const type = config.type || 'scroll';
  const direction = config.direction || 'x';

  return `
// Zoom functionality
chart.interaction('${type}-zoom', true);
${type === 'slider' ? `
chart.option('slider', {
  x: ${direction === 'x' || direction === 'both' ? 'true' : 'false'},
  y: ${direction === 'y' || direction === 'both' ? 'true' : 'false'}
});
` : ''}`;
}

function buildG2Brush(config: BrushConfig): string {
  if (!config.enabled) return '';

  const type = config.type || 'x';
  const action = config.action || 'filter';

  return `
// Brush selection
chart.interaction('brush-${type}', true);
chart.on('brush:end', (evt) => {
  const { selection } = evt;
  if (!selection) return;

  ${action === 'filter' ? `
  // Filter data based on brush selection
  const filteredData = originalData.filter(d => {
    // Implement filtering logic based on selection bounds
    return true; // Placeholder
  });
  chart.changeData(filteredData);
  ` : `
  // Highlight selected elements
  chart.getElements().forEach(element => {
    const bbox = element.getBBox();
    const isSelected = checkIntersection(bbox, selection);
    element.setState('selected', isSelected);
  });
  `}
});`;
}

function buildG2Legend(config: LegendConfig): string {
  if (!config.enabled) return '';

  const position = config.position || 'top';
  const interactive = config.interactive !== false;

  return `
// Interactive legend
chart.legend({
  position: '${position}',
  ${interactive ? `
  itemName: {
    style: {
      cursor: 'pointer'
    }
  }
  ` : ''}
});

${interactive ? `
chart.on('legend-item:click', (evt) => {
  const { name } = evt;
  // Toggle visibility of data series
  const elements = chart.getElements();
  elements.forEach(element => {
    const data = element.getData();
    if (data.category === name || data.group === name) {
      const visible = !element.getStates().includes('inactive');
      element.setState('inactive', visible);
    }
  });
});
` : ''}`;
}

/**
 * Generate interactivity scripts for G6 graphs
 */
export function buildG6Interactivity(config: InteractivityConfig): string {
  const scripts: string[] = [];

  if (config.tooltip) {
    scripts.push(buildG6Tooltip(config.tooltip));
  }

  if (config.drillDown) {
    scripts.push(buildG6DrillDown(config.drillDown));
  }

  return scripts.join('\n\n');
}

function buildG6Tooltip(config: boolean | TooltipConfig): string {
  const tooltipConfig = typeof config === 'object' ? config : { enabled: true };
  if (!tooltipConfig.enabled) return '';

  return `
// G6 Tooltip
graph.on('node:mouseenter', (evt) => {
  const node = evt.item;
  const model = node.getModel();

  const tooltip = document.createElement('div');
  tooltip.id = 'g6-tooltip';
  tooltip.style.cssText = \`
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    left: \${evt.canvasX + 10}px;
    top: \${evt.canvasY + 10}px;
  \`;

  tooltip.innerHTML = \`
    <strong>\${model.label || model.id}</strong>
    \${model.value ? '<br/>Value: ' + model.value : ''}
    \${model.category ? '<br/>Category: ' + model.category : ''}
  \`;

  document.body.appendChild(tooltip);
});

graph.on('node:mouseleave', () => {
  const tooltip = document.getElementById('g6-tooltip');
  if (tooltip) tooltip.remove();
});`;
}

function buildG6DrillDown(config: boolean | DrillDownConfig): string {
  const drillConfig = typeof config === 'object' ? config : { enabled: true };
  if (!drillConfig.enabled) return '';

  return `
// G6 Drill-down (expand/collapse nodes)
graph.on('node:dblclick', (evt) => {
  const node = evt.item;
  const model = node.getModel();

  if (model.children && model.children.length > 0) {
    const collapsed = model.collapsed || false;
    model.collapsed = !collapsed;

    if (collapsed) {
      // Expand: add child nodes
      const newNodes = model.children.map((child, i) => ({
        id: \`\${model.id}-child-\${i}\`,
        label: child.name || child.label,
        ...child
      }));
      const newEdges = newNodes.map(n => ({
        source: model.id,
        target: n.id
      }));

      graph.addData({ nodes: newNodes, edges: newEdges });
      graph.layout();
    } else {
      // Collapse: remove child nodes
      const childIds = model.children.map((_, i) => \`\${model.id}-child-\${i}\`);
      childIds.forEach(id => graph.removeData('node', id));
      graph.layout();
    }
  }
});`;
}
