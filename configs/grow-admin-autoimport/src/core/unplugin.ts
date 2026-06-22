import { createUnplugin } from 'unplugin'
import type { Options } from '#/types'
import { createFilter } from '@rollup/pluginutils'
import { shouldTransform } from './utils'

export default createUnplugin<Options | undefined>((options = {}) => {
  const filter = createFilter(
    options.include || [/\.vue$/, /\.vue\?vue/, /\.vue\?v=/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  )
  return {
    name: '@grow-admin-plugins/unplugin-auto-import',
    transformInclude(id) {
      return filter(id)
    },
    async transform(code, id) {
      // console.log('Randy rrrrr', id, code);
      // return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`)
      if (!shouldTransform(code))
        return null
      try {
        // const result = await ctx.transform(code, id)
        // ctx.generateDeclaration()
        // return result
        return null
      }
      catch (e) {
        this.error(e)
      }
    },
  }
})