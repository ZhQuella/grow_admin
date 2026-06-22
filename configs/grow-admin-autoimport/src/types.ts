import { FilterPattern } from "@rollup/pluginutils"
import type { Awaitable } from '@antfu/utils'

export interface Options {
  /**
   * RegExp or glob to match files to be transformed
   */
  include?: FilterPattern

  /**
   * RegExp or glob to match files to NOT be transformed
   */
  exclude?: FilterPattern
}

export type SideEffectsInfo = (ImportInfo | string)[] | ImportInfo | string | undefined
export type ComponentResolveResult = Awaitable<string | ComponentInfo | null | undefined | void>
export type ComponentResolverFunction = (name: string) => ComponentResolveResult

export interface ImportInfo {
  as?: string
  name?: string
  from: string
}

export interface ComponentInfo extends ImportInfo {
  sideEffects?: SideEffectsInfo
}

export interface ComponentResolverObject {
  type: 'component' | 'directive'
  resolve: ComponentResolverFunction
}

export type ResolvedOptions = Omit<
  Required<Options>,
  'resolvers' | 'extensions' | 'dirs' | 'globalComponentsDeclaration'
> & {
  resolvers: ComponentResolverObject[]
  extensions: string[]
  dirs: string[]
  resolvedDirs: string[]
  globs: string[]
  dts: string | false
  root: string
}
