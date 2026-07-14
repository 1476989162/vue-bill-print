import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueBillPrint',
      fileName: 'vue-bill-print',
    },
    rollupOptions: {
      external: ['vue', 'jsbarcode', 'qrcode'],
      output: {
        globals: {
          vue: 'Vue',
          jsbarcode: 'JsBarcode',
          qrcode: 'QRCode',
        },
        assetFileNames: 'vue-bill-print.[ext]',
      },
    },
  },
});
