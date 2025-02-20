/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Modern Cache Management System with SWR (Stale-While-Revalidate) support
 */

interface CacheOptions {
  maxAge: number;
  staleWhileRevalidate?: number;
  namespace?: string;
  compression?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  size: number;
}

export class ModernCache {
  private static _instance: ModernCache;
  private _cache: Map<string, CacheEntry<any>> = new Map();
  private _maxSize: number;
  private _currentSize: number = 0;
  private _compressionWorker?: Worker;

  private constructor(maxSizeMB: number = 50) {
    this._maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    this._initCompressionWorker();
  }

  static getInstance(): ModernCache {
    if (!ModernCache._instance) {
      ModernCache._instance = new ModernCache();
    }

    return ModernCache._instance;
  }

  private _initCompressionWorker() {
    if (typeof Worker !== 'undefined') {
      this._compressionWorker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              `
          importScripts('https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js');
          
          self.onmessage = function(e) {
            const { action, data } = e.data;
            let result;
            
            if (action === 'compress') {
              result = LZString.compress(JSON.stringify(data));
            } else if (action === 'decompress') {
              result = JSON.parse(LZString.decompress(data));
            }
            
            self.postMessage({ result });
          };
        `,
            ],
            { type: 'text/javascript' },
          ),
        ),
      );
    }
  }

  private async _compress(data: any): Promise<string> {
    if (!this._compressionWorker) {
      return JSON.stringify(data);
    }

    return new Promise((resolve) => {
      this._compressionWorker!.onmessage = (e) => resolve(e.data.result);
      this._compressionWorker!.postMessage({ action: 'compress', data });
    });
  }

  private async _decompress(data: string): Promise<any> {
    if (!this._compressionWorker) {
      return JSON.parse(data);
    }

    return new Promise((resolve) => {
      this._compressionWorker!.onmessage = (e) => resolve(e.data.result);
      this._compressionWorker!.postMessage({ action: 'decompress', data });
    });
  }

  private _getKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private _updateMetrics(entry: CacheEntry<any>): void {
    entry.lastAccessed = Date.now();
    entry.accessCount++;
  }

  private _pruneCache(): void {
    if (this._currentSize <= this._maxSize) {
      return;
    }

    const entries = Array.from(this._cache.entries()).sort((a, b) => {
      // Consider both access frequency and recency
      const scoreA = a[1].accessCount * Math.log(Date.now() - a[1].lastAccessed);
      const scoreB = b[1].accessCount * Math.log(Date.now() - b[1].lastAccessed);

      return scoreA - scoreB;
    });

    while (this._currentSize > this._maxSize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this._currentSize -= entry.size;
      this._cache.delete(key);
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions): Promise<void> {
    const fullKey = this._getKey(key, options.namespace);
    const compressed = options.compression ? await this._compress(value) : JSON.stringify(value);

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      size: compressed.length,
    };

    this._currentSize += entry.size;
    this._cache.set(fullKey, entry);
    this._pruneCache();

    // Store in IndexedDB for persistence if available
    if (typeof indexedDB !== 'undefined' && options.priority === 'high') {
      const request = indexedDB.open('modern-cache', 1);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction('cache', 'readwrite');
        const store = tx.objectStore('cache');
        store.put({ key: fullKey, entry, compressed });
      };
    }
  }

  async get<T>(key: string, options: CacheOptions): Promise<T | null> {
    const fullKey = this._getKey(key, options.namespace);
    const entry = this._cache.get(fullKey) as CacheEntry<T>;

    if (!entry) {
      // Try to load from IndexedDB
      if (typeof indexedDB !== 'undefined') {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('modern-cache', 1);
          request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
          request.onerror = () => reject();
        });

        const tx = db.transaction('cache', 'readonly');
        const store = tx.objectStore('cache');
        const savedEntry = await new Promise<CacheEntry<T>>((resolve) => {
          store.get(fullKey).onsuccess = (event) => resolve((event.target as IDBRequest).result);
        });

        if (savedEntry) {
          this._cache.set(fullKey, savedEntry);
          return savedEntry.value;
        }
      }

      return null;
    }

    const age = Date.now() - entry.timestamp;
    this._updateMetrics(entry);

    if (age < options.maxAge) {
      return entry.value;
    }

    if (age < options.maxAge + (options.staleWhileRevalidate || 0)) {
      // Return stale value and trigger background refresh
      setTimeout(() => this.revalidate(key, options), 0);
      return entry.value;
    }

    return null;
  }

  private async revalidate(_key: string, _options: CacheOptions): Promise<void> {
    /*
     * Implementation would depend on your data fetching logic
     * This is where you'd re-fetch the data and update the cache
     */
  }

  clear(namespace?: string): void {
    if (namespace) {
      const prefix = `${namespace}:`;

      for (const key of this._cache.keys()) {
        if (key.startsWith(prefix)) {
          const entry = this._cache.get(key)!;
          this._currentSize -= entry.size;
          this._cache.delete(key);
        }
      }
    } else {
      this._cache.clear();
      this._currentSize = 0;
    }
  }

  async warmup(_keys: string[], _options: CacheOptions): Promise<void> {
    /*
     * Implement cache warming logic
     * This would pre-fetch and cache frequently accessed data
     */
  }

  getStats(): {
    size: number;
    maxSize: number;
    entries: number;
    hitRate: number;
  } {
    return {
      size: this._currentSize,
      maxSize: this._maxSize,
      entries: this._cache.size,
      hitRate: 0, // Implement hit rate tracking
    };
  }
}
