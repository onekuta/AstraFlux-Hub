import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/probe-sdk-entry.js'),
      name: 'SparkLinkSDKBundle',
      fileName: () => 'sparklink-sdk-bundle.js',
      formats: ['es'],
    },
    outDir: path.resolve(__dirname, '../PCB信息枚举探针/核心源码/sdk'),
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
