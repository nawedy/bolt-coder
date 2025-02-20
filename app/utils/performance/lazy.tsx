/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { Suspense, forwardRef } from 'react';
import type { ComponentType } from 'react';
import { PerformanceMonitor } from './monitor';

interface LazyOptions {
  fallback?: React.ReactNode;
  timeout?: number;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
  preload?: boolean;
  threshold?: number;
}

interface LazyComponentProps {
  children?: React.ReactNode;
}

/**
 * Modern lazy loading wrapper with performance monitoring
 */
export function createLazyComponent<T extends LazyComponentProps>(
  factory: () => Promise<{ default: ComponentType<T> }>,
  options: LazyOptions = {},
) {
  const { fallback = null, timeout = 10000, onError, onTimeout, preload = false, threshold = 0.1 } = options;

  const LazyComponent = React.lazy(() => {
    const startTime = performance.now();

    return Promise.race<{ default: ComponentType<T> }>([
      factory().then((module: { default: ComponentType<T> }) => {
        const loadTime = performance.now() - startTime;
        console.debug(`[Lazy] Component loaded in ${loadTime}ms`);
        PerformanceMonitor.getInstance().getMetric('lazy-load')?.value;

        return module;
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error(`Lazy load timeout after ${timeout}ms`);
          onTimeout?.();
          reject(error);
        }, timeout);
      }),
    ]).catch((error) => {
      onError?.(error);
      throw error;
    });
  });

  if (preload) {
    const preloadComponent = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = factory.toString().match(/import\(['"](.+)['"]\)/)?.[1] ?? '';
      document.head.appendChild(link);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > threshold) {
              preloadComponent();
              observer.disconnect();
            }
          });
        },
        { threshold },
      );

      // Observe the document body for now, you might want to observe specific elements
      observer.observe(document.body);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      setTimeout(preloadComponent, 1000);
    }
  }

  return forwardRef<any, T>((props, ref) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
}

/**
 * Modern route-based code splitting
 */
export function createLazyRoute(factory: () => Promise<any>, options: LazyOptions = {}) {
  return createLazyComponent(factory, {
    fallback: <RouteLoadingFallback />,
    timeout: 15000,
    preload: true,
    ...options,
  });
}

/**
 * Modern image lazy loading
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  onLoad,
  onError,
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src ?? '';
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      },
    );

    observer.observe(imgRef.current);

    // eslint-disable-next-line consistent-return
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isLoaded ? 'loaded' : ''}`}
      onLoad={(e) => {
        setIsLoaded(true);
        onLoad?.(e);
      }}
      onError={onError}
      loading="lazy"
    />
  );
}

function RouteLoadingFallback() {
  return (
    <div className="route-loading">
      <div className="route-loading-indicator" />
    </div>
  );
}
