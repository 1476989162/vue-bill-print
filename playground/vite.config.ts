import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { resolve } from 'node:path';

// GitHub Pages serves the site under /vue-bill-print/
const isProd = process.env.NODE_ENV === 'production';
const base = isProd ? '/vue-bill-print/' : '/';

export default defineConfig({
  base,
  plugins: [vue()],
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
