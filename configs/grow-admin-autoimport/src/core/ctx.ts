import type { Options, ResolvedOptions } from '../types'
import { slash, throttle, toArray } from '@antfu/utils'
import { createFilter } from '@rollup/pluginutils'


export class Context {
  options: ResolvedOptions
  constructor(
    private rawOptions: Options,
  ) {
    this.options = resolveOptions(rawOptions, this.root)
    this.generateDeclaration = throttle(500, this._generateDeclaration.bind(this), { noLeading: false })
    this.setTransformer(this.options.transformer)
  }
}