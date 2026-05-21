import dayjs from 'dayjs';
import { resolve } from 'path';
import { cyan } from 'picocolors';
import { readPackageJSON } from 'pkg-types';
import type { UserConfig } from 'vite';
import { loadEnv, mergeConfig } from 'vite';
import { OUTPUT_DIR } from './constants';
import { configVitePlugins } from './plugins';
import type { PresetType } from './presets';
import { createPreset } from './presets';
import { resolveProxy, wrapperEnv } from './utils';
import { terser } from 'rollup-plugin-terser';

export * from './constants';

export { MonoRepoResolverPlugin } from './plugins';

/**
 * Create vite config
 * @param command 构建命令
 * @param mode 构建模式x
 * @param cwd 当前工作目录
 * @param param3 预设值
 * @returns
 */
export async function createViteConfig(
  command: 'build' | 'serve',
  mode: string,
  cwd: string,
  { preset }: { preset: PresetType }
): Promise<UserConfig> {
  const root = cwd;
  const env = loadEnv(mode, root);
  console.info(`\n${cyan('开始构建Vite配置...')}\n`);
  console.info(`  - ${cyan('Vite根目录：' + root)}\n`);
  const { dependencies, devDependencies, name, version } = await readPackageJSON(cwd);
  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env);
  const {
    VITE_PUBLIC_PATH,
    VITE_PROXY,
    VITE_USE_MOCK,
    VITE_DROP_CONSOLE,
    VITE_USE_HTTPS,
  } = viteEnv;
  const commonConfig: UserConfig = {
    root,
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: [
        { find: '@', replacement: `${resolve(root, 'src')}` },
        { find: 'vue-i18n', replacement: 'vue-i18n/dist/vue-i18n.cjs.js' },
        { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' },
      ]
    },
    define: {
      __VITE_USE_MOCK__: VITE_USE_MOCK,
      // Suppress vue-i18-next warning
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify({
        pkg: { dependencies, devDependencies, name, version },
        lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }),
    },
    server: {
      https: VITE_USE_HTTPS,
      port: 3000,
      host: true,
      proxy: !VITE_USE_HTTPS ? {
        ...resolveProxy(VITE_PROXY),
        "/country/100000_country_boundary.json": {
          target: "https://geo.datav.aliyun.com",
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace("/country/100000_country_boundary.json", '/areas_v3/bound/100000.json');
          },
        },
        "/country/100000_country_province.json": {
          target: "https://geo.datav.aliyun.com",
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace("/country/100000_country_province.json", '/areas_v3/bound/100000_full.json');
          },
        }
      } : undefined,
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      outDir: OUTPUT_DIR,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2048,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'pinia', 'vue-router'],
            mockjs: ['mockjs'],
            lodash: ['lodash-es'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['dayjs/locale/en', 'dayjs/locale/zh-cn', '@iconify/iconify'],
      // exclude: ['vue-demi'],
    },
    plugins: await configVitePlugins(root, viteEnv, command === 'build'),
  };

  return mergeConfig(commonConfig, await createPreset(preset)());
}

export { createUnocssConfig } from './plugins/unocss';
