import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import purgeIcons from 'vite-plugin-purge-icons'
import { configHtmlPlugin } from './html'
import { configMockPlugin } from './mock'
import { configCompressPlugin } from './compress'
import { configVisualizerConfig } from './visualizer'
import { configImageminPlugin } from './imagemin'
import { configSvgIconsPlugin } from './svg-icons'
import { configUnocssPlugin } from './unocss'
import { createConfigPlugin } from './config'
import { configHttpPlugin } from './https'
import configMonoRepoResolverPlugin from './monorepo'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import { createUnplugin } from 'unplugin'
import autoimport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Inspect from 'vite-plugin-inspect'
import { terser } from 'rollup-plugin-terser';

// 此处引用的是打包后的插件
// import WmqAutoImport from '@grow-admin-plugins/unplugin-auto-import/vite'
// 需要调试插件类型的可以用下面的引用
import WmqAutoImport from '@grow-admin-plugins/unplugin-auto-import/src/vite'

export const MonoRepoResolverPlugin = configMonoRepoResolverPlugin

export async function configVitePlugins(
  root: string,
  viteEnv: ViteEnv,
  isBuild: boolean,
) {
  const {
    VITE_USE_IMAGEMIN,
    VITE_USE_MOCK,
    VITE_UNOCSS_TYPE = 'plugin',
    VITE_LEGACY,
    VITE_BUILD_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
  } = viteEnv

  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // handle .vue files
    vue(),
    // have to
    vueJsx(),
  ]

  // @vitejs/plugin-legacy
  VITE_LEGACY && isBuild && vitePlugins.push(legacy())

  // vite-plugin-html
  vitePlugins.push(await configHtmlPlugin(root, viteEnv, isBuild))

  // unocss
  VITE_UNOCSS_TYPE === 'plugin' && vitePlugins.push(configUnocssPlugin())

  vitePlugins.push(createConfigPlugin())

  // vite-plugin-svg-icons
  vitePlugins.push(configSvgIconsPlugin(isBuild))

  // vite-plugin-mock
  VITE_USE_MOCK && vitePlugins.push(configMockPlugin(isBuild))

  // vite-plugin-purge-icons
  vitePlugins.push(purgeIcons())

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig())

  // http2
  vitePlugins.push(configHttpPlugin(viteEnv))
  // monacoEditorPlugin
  vitePlugins.push(monacoEditorPlugin({}))
  // MonorepoSupport
  vitePlugins.push(configMonoRepoResolverPlugin())

  vitePlugins.push(terser({ numWorkers: 8 }) as PluginOption)

  // The following plugins only work in the production environment
  if (isBuild) {
    // vite-plugin-imagemin
    VITE_USE_IMAGEMIN && vitePlugins.push(configImageminPlugin())

    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin(
        VITE_BUILD_COMPRESS,
        VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
      ),
    )
  }
  vitePlugins.push(Inspect())
  vitePlugins.push(WmqAutoImport())

  return vitePlugins
}
