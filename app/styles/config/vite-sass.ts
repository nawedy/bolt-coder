import { ModernSassManager } from './sass-config';
import { modernSassFunctions } from './sass-functions';
import path from 'path';

/**
 * Create a modern Sass configuration for Vite
 */
export function createModernSassConfig(isDev: boolean) {
  const manager = new ModernSassManager({
    basePath: path.resolve(process.cwd(), 'app/styles'),
    style: isDev ? 'expanded' : 'compressed',
    sourceMap: isDev,
    functions: modernSassFunctions as unknown as Record<string, (...args: unknown[]) => unknown>,
  });

  return {
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev ? '[name]__[local]' : '[name]__[local]___[hash:base64:5]',
      },
      ...manager.getViteConfig(),
    },
  };
}
