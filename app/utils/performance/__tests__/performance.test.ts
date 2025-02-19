import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerformanceMonitor } from '~/utils/performance/monitor';
import { prefetcher } from '~/utils/performance/prefetch';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation((_callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
global.IntersectionObserver = mockIntersectionObserver;

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    // Reset singleton instance
    (PerformanceMonitor as any).instance = null;
    monitor = PerformanceMonitor.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = PerformanceMonitor.getInstance();
    const instance2 = PerformanceMonitor.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should record and retrieve metrics', () => {
    const callback = vi.fn();
    monitor.subscribe(callback);

    // Simulate FCP metric
    const performanceObserverCallback = mockIntersectionObserver.mock.calls[0][0];
    performanceObserverCallback({
      getEntries: () => [
        {
          entryType: 'first-contentful-paint',
          startTime: 1000,
        },
      ],
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fcp',
        value: 1000,
      }),
    );
  });

  it('should correctly rate performance metrics', () => {
    const metric = monitor.getMetric('fcp');
    expect(metric?.rating).toBeDefined();
    expect(['good', 'needs-improvement', 'poor']).toContain(metric?.rating);
  });
});

describe('ResourcePrefetcher', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    prefetcher.reset();
  });

  it('should prefetch resources', async () => {
    const url = 'https://example.com/script.js';
    await prefetcher.prefetch(url, { type: 'script' });

    const link = document.head.querySelector('link');
    expect(link).toBeTruthy();
    expect(link?.rel).toBe('preload');
    expect(link?.as).toBe('script');
    expect(link?.href).toContain(url);
  });

  it('should not prefetch the same resource twice', async () => {
    const url = 'https://example.com/style.css';
    await prefetcher.prefetch(url, { type: 'style' });
    await prefetcher.prefetch(url, { type: 'style' });

    const links = document.head.querySelectorAll('link');
    expect(links.length).toBe(1);
  });

  it('should handle prefetch errors', async () => {
    const onError = vi.fn();
    const badUrl = 'https://invalid-url';

    await prefetcher.prefetch(badUrl, {
      type: 'image',
      onError,
    });

    expect(onError).toHaveBeenCalled();
  });

  it('should respect fetch priority', async () => {
    await prefetcher.prefetch('https://example.com/high.js', {
      type: 'script',
      priority: 'high',
    });

    const link = document.head.querySelector('link');
    expect(link?.getAttribute('fetchpriority')).toBe('high');
  });
});
