import type { Logger } from 'sass';

import path from 'path';

interface LoggerWarnOptions {
  deprecation: boolean;
}

export interface ModernSassConfig {
  /** Base path for resolving imports */
  basePath: string;

  /** Output style */
  style: 'expanded' | 'compressed';

  /** Enable source maps */
  sourceMap: boolean;

  /** Custom functions */
  functions?: Record<string, (...args: unknown[]) => unknown>;

  /** Additional data to prepend */
  additionalData?: string;
}

export class ModernSassManager {
  private _config: ModernSassConfig;
  private _logger?: Logger;

  constructor(config: ModernSassConfig) {
    this._config = {
      ...config,
      additionalData: config.additionalData ?? '',
    };
    this._logger = {
      debug: (_message: string) => {
        // Debug messages are ignored
      },
      warn: (message: string, _options: LoggerWarnOptions = { deprecation: false }) => {
        if (!message.includes('legacy-js-api')) {
          console.warn(message);
        }
      },
    };
  }

  /**
   * Resolve module path for imports
   */
  resolveModulePath(url: string): string | null {
    if (url.startsWith('@/')) {
      return path.resolve(this._config.basePath, url.slice(2));
    }

    return null;
  }

  /**
   * Get Sass options for compilation
   */
  getSassOptions() {
    return {
      style: this._config.style,
      sourceMap: this._config.sourceMap,
      logger: this._logger,
      functions: this._config.functions,
      importers: [
        {
          findFileUrl: (url: string) => {
            const resolved = this.resolveModulePath(url);
            return resolved ? new URL(`file://${resolved}`) : null;
          },
        },
      ],
    };
  }

  /**
   * Get Vite CSS config
   */
  getViteConfig() {
    return {
      includePaths: [this._config.basePath],
      additionalData: '@use "@/styles/variables" as *;',
      style: this._config.style,
      sourceMap: this._config.sourceMap,
      logger: this._logger,
      functions: this._config.functions,
    };
  }

  getConfig(): ModernSassConfig {
    return {
      ...this._config,
      additionalData: this._config.additionalData,
    };
  }
}
