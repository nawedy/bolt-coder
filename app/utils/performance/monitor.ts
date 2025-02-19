/**
 * Modern Performance Monitoring System
 */

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceThresholds {
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
};

export class PerformanceMonitor {
  private static _instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();
  private thresholds: PerformanceThresholds;

  private constructor(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
    this._initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor._instance) {
      PerformanceMonitor._instance = new PerformanceMonitor();
    }

    return PerformanceMonitor._instance;
  }

  private _initializeObservers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // First Contentful Paint
    this.observePaint('first-contentful-paint', 'fcp');

    // Largest Contentful Paint
    this._observeLCP();

    // First Input Delay
    this._observeFID();

    // Cumulative Layout Shift
    this._observeCLS();

    // Time to First Byte
    this._measureTTFB();
  }

  private observePaint(entryType: string, metricName: string): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      if (entries.length > 0) {
        const value = entries[0].startTime;
        this._recordMetric(metricName, value);
      }
    });

    observer.observe({ entryTypes: [entryType] });
  }

  private _observeLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this._recordMetric('lcp', lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private _observeFID(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          this._recordMetric('fid', fidEntry.processingStart - fidEntry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  private _observeCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as LayoutShift;

        if (!layoutEntry.hadRecentInput) {
          clsValue += (entry as any).value;
          this._recordMetric('cls', clsValue);
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private _measureTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      this._recordMetric('ttfb', navigation.responseStart - navigation.requestStart);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[name as keyof PerformanceThresholds];

    if (!threshold) {
      return 'needs-improvement';
    }

    if (value <= threshold.good) {
      return 'good';
    }

    if (value <= threshold.poor) {
      return 'needs-improvement';
    }

    return 'poor';
  }

  private _recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: this.getRating(name, value),
    };

    this.metrics.set(name, metric);
    this._notifyObservers(metric);
  }

  subscribe(callback: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private _notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach((observer) => observer(metric));
  }

  getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }
}
