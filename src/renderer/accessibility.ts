/**
 * Accessibility Module
 * Provides ARIA support, keyboard navigation, and screen reader compatibility
 */

export interface AccessibilityConfig {
  enabled?: boolean;
  description?: string;
  keyboardNavigation?: boolean;
  announceData?: boolean;
  highContrast?: boolean;
  focusIndicators?: boolean;
  altText?: string;
}

/**
 * Generate accessibility enhancements for charts
 */
export function buildAccessibilityScript(config: AccessibilityConfig = {}): string {
  if (config.enabled === false) return '';

  const scripts: string[] = [];

  scripts.push(buildARIASupport(config));

  if (config.keyboardNavigation !== false) {
    scripts.push(buildKeyboardNavigation());
  }

  if (config.announceData !== false) {
    scripts.push(buildDataAnnouncements());
  }

  if (config.highContrast) {
    scripts.push(buildHighContrastMode());
  }

  if (config.focusIndicators !== false) {
    scripts.push(buildFocusIndicators());
  }

  return `<script>\n${scripts.join('\n\n')}\n</script>`;
}

/**
 * Build ARIA attributes and roles
 */
function buildARIASupport(config: AccessibilityConfig): string {
  return `
// ARIA Support
(function setupARIA() {
  const container = document.getElementById('container') || document.body.querySelector('svg, canvas, #graph');
  if (!container) return;

  // Set ARIA role
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', ${JSON.stringify(config.altText || config.description || 'Data visualization chart')});

  // Add description if provided
  ${config.description ? `
  const desc = document.createElement('desc');
  desc.textContent = ${JSON.stringify(config.description)};
  if (container.tagName === 'svg') {
    container.insertBefore(desc, container.firstChild);
  } else {
    const descDiv = document.createElement('div');
    descDiv.className = 'sr-only';
    descDiv.textContent = ${JSON.stringify(config.description)};
    container.parentNode.insertBefore(descDiv, container);
  }
  ` : ''}

  // Make container focusable
  container.setAttribute('tabindex', '0');

  // Add title element for SVG
  if (container.tagName === 'svg') {
    const title = document.querySelector('title');
    if (!title) {
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = ${JSON.stringify(config.altText || 'Chart visualization')};
      container.insertBefore(titleEl, container.firstChild);
    }
  }

  // Add screen reader only styles
  const style = document.createElement('style');
  style.textContent = \`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    [role="img"]:focus {
      outline: 2px solid #1890ff;
      outline-offset: 2px;
    }
  \`;
  document.head.appendChild(style);

  // Create data table for screen readers
  createAccessibleDataTable();
})();`;
}

/**
 * Build keyboard navigation support
 */
function buildKeyboardNavigation(): string {
  return `
// Keyboard Navigation
(function setupKeyboardNav() {
  let currentFocusIndex = -1;
  let focusableElements = [];

  function updateFocusableElements() {
    // For G2/SVG charts
    const svg = document.querySelector('svg');
    if (svg) {
      focusableElements = Array.from(svg.querySelectorAll('rect, circle, path, line, polygon')).filter(el => {
        // Filter out decorative elements
        const role = el.getAttribute('role');
        return role !== 'presentation' && el.getAttribute('aria-hidden') !== 'true';
      });
    }

    // For G6 graphs
    const graph = document.querySelector('#graph, #g6-container');
    if (graph) {
      focusableElements = Array.from(graph.querySelectorAll('[data-node-id], .node, .g6-node'));
    }

    // Make elements focusable
    focusableElements.forEach((el, i) => {
      el.setAttribute('tabindex', i === 0 ? '0' : '-1');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', getElementLabel(el, i));
    });
  }

  function getElementLabel(el, index) {
    // Try to extract meaningful label from element
    const dataPoint = el.__data__;
    if (dataPoint) {
      if (dataPoint.category && dataPoint.value) {
        return \`Data point \${index + 1}: \${dataPoint.category}, value \${dataPoint.value}\`;
      }
      if (dataPoint.name) {
        return \`\${dataPoint.name}\`;
      }
    }

    // Fallback
    return \`Chart element \${index + 1}\`;
  }

  function focusElement(index) {
    if (index < 0 || index >= focusableElements.length) return;

    focusableElements.forEach((el, i) => {
      el.setAttribute('tabindex', i === index ? '0' : '-1');
      if (i === index) {
        el.focus();
        highlightElement(el);
      } else {
        unhighlightElement(el);
      }
    });

    currentFocusIndex = index;
    announceElement(focusableElements[index], index);
  }

  function highlightElement(el) {
    const originalFill = el.getAttribute('fill') || el.style.fill;
    el.setAttribute('data-original-fill', originalFill);
    el.style.stroke = '#1890ff';
    el.style.strokeWidth = '3';
    el.style.filter = 'drop-shadow(0 0 4px rgba(24, 144, 255, 0.5))';
  }

  function unhighlightElement(el) {
    el.style.stroke = '';
    el.style.strokeWidth = '';
    el.style.filter = '';
  }

  function announceElement(el, index) {
    const announcement = el.getAttribute('aria-label') || \`Element \${index + 1}\`;
    announce(announcement);
  }

  // Keyboard event handler
  const container = document.getElementById('container') || document.body;
  container.addEventListener('keydown', (e) => {
    if (focusableElements.length === 0) {
      updateFocusableElements();
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusElement(Math.min(currentFocusIndex + 1, focusableElements.length - 1));
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusElement(Math.max(currentFocusIndex - 1, 0));
        break;

      case 'Home':
        e.preventDefault();
        focusElement(0);
        break;

      case 'End':
        e.preventDefault();
        focusElement(focusableElements.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentFocusIndex >= 0) {
          const el = focusableElements[currentFocusIndex];
          el.click();
          announce('Element activated');
        }
        break;

      case 'Escape':
        e.preventDefault();
        container.focus();
        currentFocusIndex = -1;
        focusableElements.forEach(unhighlightElement);
        break;
    }
  });

  // Initialize on chart render
  setTimeout(updateFocusableElements, 2000);

  // Update on chart changes
  const observer = new MutationObserver(updateFocusableElements);
  observer.observe(container, { childList: true, subtree: true });
})();`;
}

/**
 * Build data announcements for screen readers
 */
function buildDataAnnouncements(): string {
  return `
// Data Announcements
(function setupAnnouncements() {
  // Create live region for announcements
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);

  window.announce = function(message) {
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  };

  // Announce data summary on load
  setTimeout(() => {
    const summary = generateDataSummary();
    announce(summary);
  }, 2000);
})();

function generateDataSummary() {
  // Try to extract data from global scope
  if (typeof data !== 'undefined' && Array.isArray(data)) {
    const count = data.length;
    const hasValues = data.some(d => d && typeof d.value === 'number');

    if (hasValues) {
      const values = data.map(d => d.value).filter(v => typeof v === 'number');
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      return \`Chart with \${count} data points. Values range from \${min.toFixed(2)} to \${max.toFixed(2)}, with an average of \${avg.toFixed(2)}.\`;
    }

    return \`Chart with \${count} data points.\`;
  }

  return 'Chart visualization loaded.';
}

function createAccessibleDataTable() {
  if (typeof data === 'undefined' || !Array.isArray(data)) return;

  const table = document.createElement('table');
  table.className = 'sr-only';
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', 'Chart data table');

  // Determine columns from first data point
  const firstItem = data[0] || {};
  const columns = Object.keys(firstItem);

  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');
  data.forEach(item => {
    const row = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = String(item[col] ?? '');
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  // Add table to document
  const container = document.getElementById('container') || document.body;
  container.parentNode.insertBefore(table, container.nextSibling);
}`;
}

/**
 * Build high contrast mode support
 */
function buildHighContrastMode(): string {
  return `
// High Contrast Mode
(function setupHighContrast() {
  const style = document.createElement('style');
  style.textContent = \`
    @media (prefers-contrast: high) {
      svg, canvas {
        filter: contrast(1.5);
      }

      .g2-tooltip {
        border: 2px solid #000 !important;
      }

      text {
        font-weight: 600 !important;
        stroke: #fff !important;
        stroke-width: 2px !important;
        paint-order: stroke fill !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #1a1a1a !important;
        color: #fff !important;
      }

      #title {
        color: #fff !important;
      }

      svg, canvas {
        filter: invert(1) hue-rotate(180deg);
      }
    }
  \`;
  document.head.appendChild(style);

  // Detect and apply high contrast if user preference
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
  }
})();`;
}

/**
 * Build focus indicators
 */
function buildFocusIndicators(): string {
  return `
// Focus Indicators
(function setupFocusIndicators() {
  const style = document.createElement('style');
  style.textContent = \`
    :focus {
      outline: 3px solid #1890ff !important;
      outline-offset: 2px !important;
    }

    :focus:not(:focus-visible) {
      outline: none;
    }

    :focus-visible {
      outline: 3px solid #1890ff !important;
      outline-offset: 2px !important;
    }

    .focus-indicator {
      position: absolute;
      border: 3px solid #1890ff;
      border-radius: 4px;
      pointer-events: none;
      transition: all 0.2s ease;
      z-index: 1000;
    }
  \`;
  document.head.appendChild(style);

  // Create focus indicator element
  const indicator = document.createElement('div');
  indicator.className = 'focus-indicator';
  indicator.style.display = 'none';
  document.body.appendChild(indicator);

  // Update indicator position on focus
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (target.matches('rect, circle, path, .node, [role="button"]')) {
      const rect = target.getBoundingClientRect();
      indicator.style.display = 'block';
      indicator.style.left = (rect.left - 5) + 'px';
      indicator.style.top = (rect.top - 5) + 'px';
      indicator.style.width = (rect.width + 10) + 'px';
      indicator.style.height = (rect.height + 10) + 'px';
    }
  });

  document.addEventListener('focusout', () => {
    indicator.style.display = 'none';
  });
})();`;
}

/**
 * Generate accessibility report for a chart
 */
export function generateAccessibilityReport(html: string): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for ARIA attributes
  if (!html.includes('role=')) {
    issues.push('Missing ARIA role attributes');
    recommendations.push('Add role="img" to chart container');
  }

  if (!html.includes('aria-label')) {
    issues.push('Missing aria-label for screen readers');
    recommendations.push('Add descriptive aria-label to chart');
  }

  // Check for keyboard navigation
  if (!html.includes('tabindex')) {
    issues.push('Chart is not keyboard accessible');
    recommendations.push('Add tabindex and keyboard event handlers');
  }

  // Check for alt text
  if (!html.includes('alt=') && !html.includes('aria-label')) {
    issues.push('Missing alternative text');
    recommendations.push('Provide alt text or aria-label for the chart');
  }

  // Check for color contrast
  if (!html.includes('high-contrast') && !html.includes('prefers-contrast')) {
    recommendations.push('Consider adding high contrast mode support');
  }

  // Check for focus indicators
  if (!html.includes(':focus')) {
    recommendations.push('Add visible focus indicators for keyboard navigation');
  }

  // Calculate score (0-100)
  const totalChecks = 6;
  const passedChecks = totalChecks - issues.length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    score,
    issues,
    recommendations
  };
}

/**
 * Inject accessibility enhancements into existing chart HTML
 */
export function injectAccessibility(html: string, config: AccessibilityConfig = {}): string {
  const script = buildAccessibilityScript(config);

  // Inject before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}\n</body>`);
  } else if (html.includes('</html>')) {
    return html.replace('</html>', `${script}\n</html>`);
  } else {
    return html + script;
  }
}
