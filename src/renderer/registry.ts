/**
 * Chart Registry System
 * Centralized registry for all chart types and their builders
 */

import type { ChartBuilder, ChartSpec } from './builders/base';
import type { ZodSchema } from 'zod';

export interface ChartDefinition {
  type: string;
  renderer: 'g2' | 'g6' | 'hybrid' | 'custom';
  category: 'statistical' | 'graph' | 'map' | 'hybrid' | 'custom';
  builder: ChartBuilder;
  schema: ZodSchema<any>;
  description?: string;
}

export class ChartRegistry {
  private static charts = new Map<string, ChartDefinition>();

  /**
   * Register a chart type
   */
  static register(definition: ChartDefinition): void {
    this.charts.set(definition.type, definition);
  }

  /**
   * Get a chart definition by type
   */
  static get(type: string): ChartDefinition | undefined {
    return this.charts.get(type);
  }

  /**
   * Check if a chart type is registered
   */
  static has(type: string): boolean {
    return this.charts.has(type);
  }

  /**
   * Get all registered chart types
   */
  static getAll(): ChartDefinition[] {
    return Array.from(this.charts.values());
  }

  /**
   * Get charts by category
   */
  static getByCategory(category: ChartDefinition['category']): ChartDefinition[] {
    return this.getAll().filter(def => def.category === category);
  }

  /**
   * Get charts by renderer
   */
  static getByRenderer(renderer: ChartDefinition['renderer']): ChartDefinition[] {
    return this.getAll().filter(def => def.renderer === renderer);
  }

  /**
   * Get all chart types as array
   */
  static getTypes(): string[] {
    return Array.from(this.charts.keys());
  }

  /**
   * Unregister a chart type (for testing)
   */
  static unregister(type: string): boolean {
    return this.charts.delete(type);
  }

  /**
   * Clear all registrations (for testing)
   */
  static clear(): void {
    this.charts.clear();
  }

  /**
   * Get registry size
   */
  static size(): number {
    return this.charts.size;
  }
}
