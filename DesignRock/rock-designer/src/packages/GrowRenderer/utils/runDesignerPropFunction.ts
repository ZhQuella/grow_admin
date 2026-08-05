/** 将设计器中的函数 prop 源码编译为运行时可调用函数 */

import { decodeFunctionPropValue } from '../../GrowDesigner/static/functionPropCodec'
import { getFunctionPropParamMeta } from '../../GrowDesigner/static/functionPropParams'
import type { DesignerRuntimeRefs } from './runtimeRefs'

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

const buildParamPrelude = (
  params: string[],
  objectArgs: boolean,
): string => {
  if (!params.length) return ''
  if (objectArgs) {
    return `const { ${params.join(', ')} } = (args[0] && typeof args[0] === 'object') ? args[0] : {};`
  }
  return params
    .map((param, index) => `const ${param} = args[${index}];`)
    .join('\n')
}

/**
 * 将函数体编译为可传入组件的 prop 回调。
 * 函数体内可使用文档参数名，以及 state、refs。
 */
export const compileDesignerPropFunction = (
  codeOrEncoded: string,
  state: Record<string, unknown>,
  options?: {
    name?: string
    modelKey?: string
    params?: string[]
    objectArgs?: boolean
    refs?: DesignerRuntimeRefs
  },
): ((...args: unknown[]) => unknown) | undefined => {
  const decoded = decodeFunctionPropValue(codeOrEncoded)
  const body = decoded.code.trim()
  if (!body) return undefined

  const rawName = String(options?.name || options?.modelKey || 'handler').trim()
  const fnName = SAFE_NAME_RE.test(rawName.replace(/-/g, '_'))
    ? rawName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, '')
    : 'handler'

  const registry = getFunctionPropParamMeta(String(options?.modelKey || ''))
  const params = (
    options?.params ??
    (decoded.params.length ? decoded.params : undefined) ??
    registry.params
  ).filter((item) => SAFE_NAME_RE.test(item))

  const objectArgs =
    options?.objectArgs ??
    (decoded.params.length > 0 || decoded.objectArgs
      ? decoded.objectArgs
      : Boolean(registry.objectArgs))

  const prelude = buildParamPrelude(params, objectArgs)
  const refs = options?.refs || {}

  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'args',
      'state',
      'refs',
      `"use strict";\n${prelude}\n${body}`,
    )
    return (...args: unknown[]) => runner(args, state, refs)
  } catch (error) {
    console.error(`[GrowPropFunction:${fnName}]`, error)
    return undefined
  }
}
