import * as sass from 'sass';
import path from 'path';

type SassFunction = (args: sass.Value[]) => sass.Value;

export interface ModernSassConfig {
  /** Base path for resolving imports */
  basePath: string;

  /** Output style */
  style: 'expanded' | 'compressed';

  /** Enable source maps */
  sourceMap: boolean;

  /** Custom functions */
  functions?: Record<string, SassFunction>;

  /** Additional data to prepend */
  additionalData?: string;
}

export class ModernSassManager {
  private _config: ModernSassConfig;

  constructor(config: ModernSassConfig) {
    this._config = {
      ...config,
      additionalData: config.additionalData ?? '',
      functions: config.functions ?? {},
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
   * Get Vite configuration
   */
  getViteConfig() {
    return {
      preprocessorOptions: {
        scss: {
          functions: this._config.functions,
          importers: [
            {
              findFileUrl: (url: string) => {
                const resolvedPath = this.resolveModulePath(url);

                if (resolvedPath) {
                  return new URL(`file://${resolvedPath}`);
                }

                return null;
              },
            },
          ],
          additionalData: '@use "@/styles/variables" as *;',
          style: this._config.style,
          sourceMap: this._config.sourceMap,
        },
      },
    };
  }

  getConfig(): ModernSassConfig {
    return {
      ...this._config,
      additionalData: this._config.additionalData,
    };
  }
}
