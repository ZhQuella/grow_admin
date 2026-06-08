import { defineProject } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
export default defineProject({
  plugins: [
    Vue(),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    alias: {
      '#': './src'
    }
  }
})