# Project Structure Reference

Quick reference for the charts-mcp project organization.

## Directory Tree

```
charts-mcp/
│
├── 📁 .claude/                   # Claude Code configuration
│   └── settings.local.json
│
├── 📁 __tests__/                 # Test files
│
├── 📁 .github/                   # GitHub workflows and config
│
├── 📁 build/                     # Build output (git-ignored)
│
├── 📁 docs/                      # 📚 All documentation
│   ├── 7phase-plan.json                  # Master implementation plan
│   ├── phase6-advanced-features.md       # Phase 6 complete docs
│   ├── test-results-phase3.md            # Historical test results
│   ├── CLEANUP-SUMMARY.md                # Cleanup documentation
│   └── PROJECT-STRUCTURE.md              # This file
│
├── 📁 examples/                  # 📊 Example chart specifications
│   ├── README.md                         # Examples documentation
│   ├── charts/                           # All chart examples
│   │   ├── bar.basic.json               # Basic examples
│   │   ├── line.basic.json
│   │   ├── pie.basic.json
│   │   ├── hybrid.advanced.json         # Advanced Phase 6 examples
│   │   ├── bar.interactive.json
│   │   ├── line.accessible.json
│   │   └── ...
│   └── maps/                             # Map visualizations
│
├── 📁 scripts/                   # Build and utility scripts
│   ├── README.md
│   ├── render-examples.ts
│   └── start-renderer.ts
│
├── 📁 src/                       # 💻 Source code
│   ├── renderer/                         # Chart rendering engine
│   │   ├── builders/
│   │   │   ├── base.ts                  # Base chart builder
│   │   │   └── hybrid.ts                # Hybrid G2+G6 builder
│   │   ├── accessibility.ts             # ARIA & a11y features
│   │   ├── export.ts                    # SVG/PDF export
│   │   ├── interactivity.ts             # Interactive features
│   │   ├── chart.ts                     # Chart HTML builder
│   │   ├── chart-dispatcher.ts          # Chart routing
│   │   ├── init-registry.ts             # Registry initialization
│   │   └── registry.ts                  # Chart type registry
│   ├── schemas/                          # Zod validation schemas
│   ├── tools/                            # MCP tool definitions
│   └── utils/                            # Utility functions
│
├── 📁 test-outputs/              # 🧪 Test outputs (git-ignored)
│   ├── general/                          # General test outputs
│   ├── phase4/                           # Phase 4 test outputs
│   ├── phase5-g6/                        # Phase 5 G6 test outputs
│   ├── html/                             # HTML format tests
│   ├── html-url/                         # HTML URL format tests
│   └── png/                              # PNG export tests
│
├── 📄 .gitignore                 # Git ignore rules
├── 📄 package.json               # Project metadata & dependencies
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 README.md                  # Main project README
├── 📄 LICENSE                    # MIT License
├── 📄 PHASE6-SUMMARY.md          # Phase 6 implementation summary
└── 📄 AGENTS.md                  # Agent configurations
```

---

## Key Directories Explained

### `/docs` - Documentation Hub 📚
**Purpose**: All project documentation
**Contents**:
- Implementation plans (7phase-plan.json)
- Feature documentation (phase6-advanced-features.md)
- Test results and summaries
- Project structure and cleanup docs

**When to Use**: Adding project-level documentation

---

### `/examples` - Chart Examples 📊
**Purpose**: Example chart specifications
**Structure**:
- `charts/` - All chart examples (basic + advanced)
  - `*.basic.json` - Basic examples
  - `*.advanced.json` - Advanced examples
  - `*.interactive.json` - Interactive features
  - `*.accessible.json` - Accessibility examples
- `maps/` - Geographic visualizations

**File Format**: JSON specification files
**Usage**: Reference for creating new charts

---

### `/src` - Source Code 💻
**Purpose**: All TypeScript source code

**Key Modules**:
- `renderer/` - Chart rendering logic
  - `builders/` - Chart builder classes
  - `accessibility.ts` - WCAG compliance features
  - `export.ts` - SVG/PDF/PNG export
  - `interactivity.ts` - Tooltips, drill-down, filters
  - `chart-dispatcher.ts` - Routes requests to builders
  - `registry.ts` - Chart type registry

**When to Modify**: Implementing new features or chart types

---

### `/test-outputs` - Test Outputs 🧪
**Purpose**: Generated test files and renders
**Git Status**: Ignored (not committed)

**Structure**:
- `general/` - General test outputs
- `phase4/` - Phase 4 specific tests
- `phase5-g6/` - Phase 5 G6 tests
- `html/`, `png/` - Format-specific outputs

**When to Use**: Running tests and rendering examples

---

### `/scripts` - Build Scripts ⚙️
**Purpose**: Build and utility scripts
**Contents**:
- `render-examples.ts` - Render example charts
- `start-renderer.ts` - Start renderer service

**Usage**: Build automation and testing

---

## File Naming Conventions

### Examples
```
{chart-type}.{variant}.json

Examples:
- bar.basic.json
- line.advanced.json
- pie.custom.json
```

### Test Outputs
```
{chart-type}-{variant}.{format}

Examples:
- bar-basic.html
- line-advanced.png
- hybrid-test.pdf
```

### Documentation
```
{purpose}-{topic}.md

Examples:
- phase6-advanced-features.md
- test-results-phase3.md
- CLEANUP-SUMMARY.md
```

### Source Code
```
{module-name}.ts

Examples:
- chart-dispatcher.ts
- accessibility.ts
- export.ts
```

---

## Import Paths

### From Root
```typescript
import { ChartDispatcher } from './src/renderer/chart-dispatcher';
import { HybridChartBuilder } from './src/renderer/builders/hybrid';
```

### Within src/renderer
```typescript
import { ChartBuilder } from './builders/base';
import { ChartRegistry } from './registry';
```

### Relative Imports
```typescript
// From src/renderer/builders/hybrid.ts
import { ChartBuilder, ChartSpec } from './base';

// From src/tools/create-chart.ts
import { ChartDispatcher } from '../renderer/chart-dispatcher';
```

---

## Common Tasks

### Add New Chart Type
1. Define schema in `src/schemas/`
2. Create builder in `src/renderer/builders/`
3. Register in `src/renderer/init-registry.ts`
4. Add example in `examples/charts/`
5. Test with `npm run render-examples`

### Add Phase Feature
1. Create module in `src/renderer/`
2. Add TypeScript types
3. Write documentation in `docs/`
4. Create examples in `examples/phase{N}/`
5. Update phase plan in `docs/7phase-plan.json`

### Add Documentation
1. Create .md file in `docs/`
2. Follow naming convention
3. Update related indexes
4. Cross-reference other docs

### Run Tests
```bash
# Render all examples
npm run render-examples

# Outputs go to test-outputs/
# Check test-outputs/general/ for results
```

---

## Git Workflow

### Tracked Files
✅ Source code (`src/`)
✅ Examples (`examples/`)
✅ Documentation (`docs/`)
✅ Configuration files
✅ Package files

### Ignored Files
❌ `node_modules/`
❌ `build/`, `dist/`, `lib/`
❌ `test-outputs/` (all subdirectories)
❌ `test-*.html`
❌ `.DS_Store`, `.vscode/`

### Before Commit
```bash
# Check for loose test files
find . -maxdepth 1 -name "test-*.html"

# Verify nothing in test-outputs is staged
git status | grep test-outputs

# Clean up if needed
git reset test-outputs/
```

---

## NPM Scripts

```bash
# Development
npm run dev              # Development mode
npm run build            # Build project
npm run test             # Run tests

# Rendering
npm run render-examples  # Render example charts

# Quality
npm run lint             # Lint code
npm run format           # Format code
npm run type-check       # TypeScript check
```

---

## Package Organization

### Dependencies
- `@antv/g2` - G2 v5 charting library
- `@antv/g6` - G6 v5 graph visualization
- `puppeteer` - Headless browser for export
- `zod` - Schema validation

### Dev Dependencies
- `typescript` - TypeScript compiler
- `@biomejs/biome` - Linter/formatter
- Testing utilities

---

## Module Boundaries

### Public API
- `src/tools/` - MCP tools (external interface)
- `src/renderer/chart-dispatcher.ts` - Dispatch API

### Internal Modules
- `src/renderer/builders/` - Chart builders
- `src/renderer/registry.ts` - Chart registry
- `src/schemas/` - Validation schemas

### Utility Modules
- `src/utils/` - Shared utilities
- `src/renderer/accessibility.ts` - A11y helpers
- `src/renderer/export.ts` - Export helpers
- `src/renderer/interactivity.ts` - Interaction helpers

---

## Quick Reference

| Task | Location | Command |
|------|----------|---------|
| Add chart type | `src/renderer/builders/` | Create builder class |
| Add example | `examples/charts/` | Create .json file |
| View docs | `docs/` | Read .md files |
| Run tests | Root | `npm run render-examples` |
| Check outputs | `test-outputs/` | Browse subdirectories |
| Update phase plan | `docs/7phase-plan.json` | Edit JSON |

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [Examples Guide](../examples/README.md) - Examples documentation
- [Phase 6 Features](./phase6-advanced-features.md) - Advanced features
- [Cleanup Summary](./CLEANUP-SUMMARY.md) - Recent cleanup
- [7-Phase Plan](./7phase-plan.json) - Implementation roadmap

---

## Maintenance

### Keep Clean
- Remove test outputs regularly
- Update documentation when adding features
- Follow naming conventions
- Keep root directory minimal

### Before Release
- Update version in package.json
- Update CHANGELOG (if exists)
- Run all tests
- Clean test-outputs
- Verify documentation is current

---

**Last Updated**: 2025-10-01
**Structure Version**: 2.0 (Post-Phase 6 Cleanup)
