import { modernSassFunctions } from './sass-functions';

/**
 * Create a modern Sass configuration for Vite
 */
export function createModernSassConfig(isDev: boolean) {
  return {
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev ? '[name]__[local]' : '[name]__[local]___[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          includePaths: ['app/styles'],
          functions: modernSassFunctions,
        },
      },
    },
  };
}
