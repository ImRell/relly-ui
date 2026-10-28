import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/cdn.ts'),
      name: 'RellyUI',
      fileName: (format) => `relly-ui.${format}.js`,
      formats: ['iife', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'relly-ui.css';
          }
          return assetInfo.name || 'assets/[name]-[hash][extname]';
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  }
});
