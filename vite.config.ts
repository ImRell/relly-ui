import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts']
    })
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RellyUI',
      fileName: () => 'relly-ui.es.js',
      formats: ['es']
    },
    sourcemap: true,
    minify: 'esbuild'
  }
});
