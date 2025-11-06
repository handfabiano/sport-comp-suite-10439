/**
 * Performance Monitoring
 * Tracks Web Vitals and custom performance metrics
 */

import { useEffect } from 'react';

/**
 * Web Vitals Metrics
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Custom Performance Metric
 */
export interface CustomMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
}

/**
 * Performance Monitor Service
 */
class PerformanceMonitor {
  private metrics: Map<string, CustomMetric> = new Map();
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return;

    // Observe Long Tasks (tasks that block main thread for >50ms)
    this.observeLongTasks();

    // Observe Resource Loading
    this.observeResourceTiming();

    if (!this.isProduction) {
      console.log('[Performance] Monitoring initialized');
    }
  }

  /**
   * Track Web Vitals
   */
  trackWebVitals(metric: WebVitalsMetric) {
    if (!this.isProduction) {
      console.log('[Performance] Web Vital:', metric);
      return;
    }

    // Send to analytics/monitoring service
    // Example: analytics.track('Web Vital', metric);
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms') {
    const metric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    };

    this.metrics.set(name, metric);

    if (!this.isProduction) {
      console.log('[Performance] Custom Metric:', metric);
    }
  }

  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.trackMetric(name, duration, 'ms');

    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.trackMetric(name, duration, 'ms');

    return result;
  }

  /**
   * Mark performance entry
   */
  mark(name: string) {
    performance.mark(name);
  }

  /**
   * Measure between two marks
   */
  measureBetween(name: string, startMark: string, endMark: string) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name, 'measure')[0];

    if (measure) {
      this.trackMetric(name, measure.duration, 'ms');
    }
  }

  /**
   * Get all custom metrics
   */
  getMetrics(): CustomMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Observe Long Tasks
   */
  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('long-task', entry.duration, 'ms');
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long Task API not supported
    }
  }

  /**
   * Observe Resource Timing
   */
  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;

        // Track slow resources (>1s)
        if (resource.duration > 1000) {
          this.trackMetric(`resource-${resource.name}`, resource.duration, 'ms');
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Get memory usage (Chrome only)
   */
  getMemoryUsage(): { used: number; total: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      };
    }
    return null;
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook to measure component render time
 */
export function usePerformance(componentName: string) {
  useEffect(() => {
    const mountTime = performance.now();

    return () => {
      const unmountTime = performance.now();
      const lifetime = unmountTime - mountTime;
      performanceMonitor.trackMetric(`${componentName}-lifetime`, lifetime);
    };
  }, [componentName]);
}

/**
 * React Hook for Web Vitals monitoring
 */
export function useWebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to reduce bundle size
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(performanceMonitor.trackWebVitals.bind(performanceMonitor));
      onFCP(performanceMonitor.trackWebVitals.bind(performanceMonitor));
      onLCP(performanceMonitor.trackWebVitals.bind(performanceMonitor));
      onTTFB(performanceMonitor.trackWebVitals.bind(performanceMonitor));
      if (onINP) {
        onINP(performanceMonitor.trackWebVitals.bind(performanceMonitor));
      }
    });
  }, []);
}

/**
 * Performance decorator for class methods
 */
export function Performance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const duration = performance.now() - start;

    performanceMonitor.trackMetric(`${target.constructor.name}.${propertyKey}`, duration);

    return result;
  };

  return descriptor;
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize() {
  if (!import.meta.env.PROD) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const scripts = resources.filter((r) => r.name.endsWith('.js'));
    const styles = resources.filter((r) => r.name.endsWith('.css'));

    const totalScriptSize = scripts.reduce((acc, s) => acc + (s.transferSize || 0), 0);
    const totalStyleSize = styles.reduce((acc, s) => acc + (s.transferSize || 0), 0);

    console.table({
      'JavaScript': `${(totalScriptSize / 1024).toFixed(2)} KB`,
      'CSS': `${(totalStyleSize / 1024).toFixed(2)} KB`,
      'Total': `${((totalScriptSize + totalStyleSize) / 1024).toFixed(2)} KB`,
      'Scripts Count': scripts.length,
      'Styles Count': styles.length,
    });
  }
}
