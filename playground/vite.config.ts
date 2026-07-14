import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      'vue-bill-print': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5177,
    open: true,
  },
});
