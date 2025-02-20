/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { PerformanceMonitor } from '~/utils/performance/monitor';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorLog {
  error: Error;
  errorInfo: ErrorInfo;
  timestamp: number;
  userAgent: string;
  performanceMetrics: Record<string, any>;
  componentTree: string;
}

class ErrorLogger {
  private static _instance: ErrorLogger;
  private _logs: ErrorLog[] = [];
  private _maxLogs: number = 100;

  private constructor() {
    this._setupPeriodicUpload();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger._instance) {
      ErrorLogger._instance = new ErrorLogger();
    }

    return ErrorLogger._instance;
  }

  private async getPerformanceMetrics(): Promise<Record<string, any>> {
    const monitor = PerformanceMonitor.getInstance();
    return Object.fromEntries(Array.from(monitor.getMetrics().entries()).map(([key, value]) => [key, value]));
  }

  private _setupPeriodicUpload(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => this.uploadLogs(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  private async uploadLogs(): Promise<void> {
    if (this._logs.length === 0) {
      return;
    }

    try {
      /*
       * Implementation would depend on your error tracking service
       * Example using a hypothetical error tracking API
       */
      /*
       *await fetch('/api/error-logs', {
       *  method: 'POST',
       *  headers: { 'Content-Type': 'application/json' },
       *  body: JSON.stringify(this.logs)
       *});
       */
      this._logs = [];
    } catch (error) {
      console.error('Failed to upload error logs:', error);
    }
  }

  async logError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const log: ErrorLog = {
      error,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      performanceMetrics: await this.getPerformanceMetrics(),
      componentTree: errorInfo.componentStack,
    };

    this._logs.push(log);

    if (this._logs.length > this._maxLogs) {
      this._logs.shift();
    }

    // Upload immediately in development
    if (process.env.NODE_ENV === 'development') {
      await this.uploadLogs();
    }
  }
}

export class ModernErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private _logger: ErrorLogger = ErrorLogger.getInstance();
  private _recoveryAttempts: number = 0;
  private _maxRecoveryAttempts: number = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this._logger = ErrorLogger.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    this._logger.logError(error, errorInfo);
  }

  private async attemptRecovery(): Promise<void> {
    if (this._recoveryAttempts >= this._maxRecoveryAttempts) {
      return;
    }

    this._recoveryAttempts++;

    try {
      // Clear any cached state that might be causing the error
      localStorage.removeItem('app-state');
      sessionStorage.clear();

      // Clear any problematic IndexedDB data
      if (typeof indexedDB !== 'undefined') {
        const databases = await indexedDB.databases();
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }

      // Reset error state
      this.setState({ hasError: false, error: null });
    } catch (error) {
      console.error('Recovery attempt failed:', error);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          {this.props.fallback || (
            <div className="error-boundary__content">
              <h2>Something went wrong</h2>
              <p>{this.state.error?.message}</p>
              {this._recoveryAttempts < this._maxRecoveryAttempts && (
                <button onClick={() => this.attemptRecovery()} className="error-boundary__retry">
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
