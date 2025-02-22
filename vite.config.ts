import { vitePlugin as remixPlugin } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [
    remixPlugin({
      serverModuleFormat: 'esm',
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    nodePolyfills({
      include: ['path', 'buffer', 'process'],
    }),
    UnoCSS(),
    tsconfigPaths(),
  ],
  build: {
    target: 'esnext',
    minify: true,
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    devSourcemap: true,
  },
  ssr: {
    noExternal: ['react-toastify'],
  },
});
