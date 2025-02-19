/**
 * Modern resource prefetching system
 */

type ResourceType = 'script' | 'style' | 'image' | 'font' | 'document';
type FetchPriority = 'high' | 'low' | 'auto';

interface PrefetchOptions {
  type: ResourceType;
  priority?: FetchPriority;
  threshold?: number;
  timeout?: number;
  onError?: (error: Error) => void;
}

class ResourcePrefetcher {
  private static instance: ResourcePrefetcher;
  private prefetchedUrls: Set<string> = new Set();
  private observer: IntersectionObserver | null = null;
  private quicklinkInitialized = false;

  private constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        threshold: 0.1,
        rootMargin: '50px',
      });
    }
  }

  static getInstance(): ResourcePrefetcher {
    if (!ResourcePrefetcher.instance) {
      ResourcePrefetcher.instance = new ResourcePrefetcher();
    }

    return ResourcePrefetcher.instance;
  }

  private async handleIntersection(entries: IntersectionObserverEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const url = element.getAttribute('data-prefetch');

        if (url) {
          await this.prefetch(url, {
            type: (element.getAttribute('data-prefetch-type') as ResourceType) || 'document',
            priority: (element.getAttribute('data-prefetch-priority') as FetchPriority) || 'auto',
          });
        }
      }
    }
  }

  async prefetch(url: string, options: PrefetchOptions): Promise<void> {
    if (this.prefetchedUrls.has(url)) {
      return;
    }

    const { type = 'document', priority = 'auto', timeout = 5000, onError } = options;

    try {
      // Create appropriate link element based on resource type
      const link = document.createElement('link');
      link.rel = type === 'document' ? 'prefetch' : 'preload';
      link.as = type;
      link.href = url;

      if (priority !== 'auto') {
        link.setAttribute('fetchpriority', priority);
      }

      // Add support for modern loading attributes
      if (type === 'image') {
        link.setAttribute('imageSrcset', url);
        link.setAttribute('imageSizes', '100vw');
      }

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Prefetch timeout for ${url}`)), timeout);
      });

      // Race between prefetch and timeout
      await Promise.race([
        new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        }),
        timeoutPromise,
      ]);

      this.prefetchedUrls.add(url);
    } catch (error) {
      onError?.(error as Error);
      console.error(`Failed to prefetch ${url}:`, error);
    }
  }

  observeElement(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  /**
   * Initialize quicklink-style prefetching for visible links
   */
  initQuicklink(
    options: {
      throttle?: number;
      ignoreList?: string[];
    } = {},
  ): void {
    if (this.quicklinkInitialized) {
      return;
    }

    const { throttle = 2000, ignoreList = [] } = options;

    let prefetchTimer: NodeJS.Timeout;

    const prefetchVisible = () => {
      clearTimeout(prefetchTimer);
      prefetchTimer = setTimeout(() => {
        const links = document.querySelectorAll('a');

        links.forEach((link) => {
          const href = link.getAttribute('href');

          if (!href) {
            return;
          }

          // Skip if in ignore list
          if (ignoreList.some((pattern) => href.match(pattern))) {
            return;
          }

          // Skip if already prefetched
          if (this.prefetchedUrls.has(href)) {
            return;
          }

          // Skip if external link
          if (new URL(href, window.location.origin).origin !== window.location.origin) {
            return;
          }

          // Check if link is in viewport
          const rect = link.getBoundingClientRect();
          const isVisible =
            rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;

          if (isVisible) {
            this.prefetch(href, { type: 'document' });
          }
        });
      }, throttle);
    };

    // Listen for scroll and mousemove events
    window.addEventListener('scroll', prefetchVisible, { passive: true });
    window.addEventListener('mousemove', prefetchVisible, { passive: true });

    this.quicklinkInitialized = true;
  }

  reset(): void {
    this.prefetchedUrls.clear();

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const prefetcher = ResourcePrefetcher.getInstance();
