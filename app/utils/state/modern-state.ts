/**
 * Modern State Management System with atomic updates and persistence
 */

import { ModernCache } from '~/utils/cache/modern-cache';
import { PerformanceMonitor } from '~/utils/performance/monitor';

type StateSubscriber<T> = (state: T) => void;
type StateSelector<T, R> = (state: T) => R;
type StateEffect<T> = (state: T) => void;
type StateMiddleware<T> = (state: T, action: string) => T;

interface CacheOptions {
  maxAge?: number;
  namespace?: string;
  priority?: 'high' | 'normal' | 'low';
  compression?: boolean;
}

export class ModernStateManager<T extends object> {
  private readonly _state: T;
  private readonly _subscribers: Set<StateSubscriber<T>>;
  private readonly _selectors: Map<string, StateSelector<T, any>>;
  private readonly _effects: Set<StateEffect<T>>;
  private readonly _middleware: StateMiddleware<T>[];
  private readonly _cache: ModernCache;
  private readonly _namespace: string;
  private readonly _persist: boolean;
  private readonly _history: T[];
  private _historyIndex: number;

  constructor(initialState: T, options: { namespace?: string; persist?: boolean } = {}) {
    this._state = { ...initialState };
    this._subscribers = new Set();
    this._selectors = new Map();
    this._effects = new Set();
    this._middleware = [];
    this._cache = ModernCache.getInstance();
    this._namespace = options.namespace ?? 'default';
    this._persist = options.persist ?? false;
    this._history = [{ ...initialState }];
    this._historyIndex = 0;

    if (this._persist) {
      this._loadPersistedState();
    }

    this._setupPerformanceMonitoring();
  }

  private async _loadPersistedState(): Promise<void> {
    const persistedState = await this._cache.get<T>(`state_${this._namespace}`, {
      maxAge: Infinity,
      namespace: 'state',
      priority: 'high',
    });

    if (persistedState) {
      Object.assign(this._state, persistedState);
      this._addToHistory(this._state);
    }
  }

  private _setupPerformanceMonitoring(): void {
    const monitor = PerformanceMonitor.getInstance();
    const metrics = monitor.getMetrics();

    if (!metrics.has('state_updates')) {
      (monitor as any).recordMetric('state_updates', 0);
    }

    if (!metrics.has('state_size')) {
      (monitor as any).recordMetric('state_size', 0);
    }
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach((sub) => sub(this._state));
  }

  private _notifySelectors(): void {
    this._selectors.forEach((sub) => sub(this._state));
  }

  private _runEffects(): void {
    this._effects.forEach((effect) => effect(this._state));
  }

  private async _persistState(): Promise<void> {
    if (this._persist) {
      await this._cache.set(`state_${this._namespace}`, this._state, {
        maxAge: Infinity,
        namespace: 'state',
        priority: 'high',
        compression: true,
      });
    }
  }

  private _addToHistory(state: T): void {
    this._history.push({ ...state });
    this._historyIndex = this._history.length - 1;
  }

  subscribe(subscriber: StateSubscriber<T>): () => void {
    this._subscribers.add(subscriber);
    return () => this._subscribers.delete(subscriber);
  }

  addSelector<R>(key: string, selector: StateSelector<T, R>): () => void {
    this._selectors.set(key, selector);
    return () => this._selectors.delete(key);
  }

  addEffect(effect: StateEffect<T>): () => void {
    this._effects.add(effect);
    return () => this._effects.delete(effect);
  }

  addMiddleware(middleware: StateMiddleware<T>): () => void {
    this._middleware.push(middleware);

    return () => {
      const index = this._middleware.indexOf(middleware);

      if (index > -1) {
        this._middleware.splice(index, 1);
      }
    };
  }

  getState(): T {
    return this._state;
  }

  setState(updater: Partial<T> | ((state: T) => T), _action?: string): void {
    const nextState = typeof updater === 'function' ? updater(this._state) : { ...this._state, ...updater };

    this._middleware.reduce((state, mw) => mw(state, _action ?? 'setState'), nextState);

    Object.assign(this._state, nextState);
    this._addToHistory(this._state);
    this._notifySubscribers();
    this._notifySelectors();
    this._runEffects();
    void this._persistState();

    const monitor = PerformanceMonitor.getInstance();
    const stateUpdates = monitor.getMetric('state_updates');

    if (stateUpdates) {
      stateUpdates.value++;
    }

    const stateSize = monitor.getMetric('state_size');

    if (stateSize) {
      stateSize.value = JSON.stringify(this._state).length;
    }
  }

  undo(): void {
    if (this._historyIndex > 0) {
      this._historyIndex--;
      Object.assign(this._state, this._history[this._historyIndex]);
      this._notifySubscribers();
      this._notifySelectors();
      this._runEffects();
      void this._persistState();
    }
  }

  redo(): void {
    if (this._historyIndex < this._history.length - 1) {
      this._historyIndex++;
      Object.assign(this._state, this._history[this._historyIndex]);
      this._notifySubscribers();
      this._notifySelectors();
      this._runEffects();
      void this._persistState();
    }
  }
}
