/** 将设计器中的函数 prop 源码编译为运行时可调用函数 */

import { decodeFunctionPropValue } from '../../GrowDesigner/static/functionPropCodec'
import { getFunctionPropParams } from '../../GrowDesigner/static/functionPropParams'

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

/**
 * 将函数体编译为可传入组件的 prop 回调。
 * 函数体内可使用文档参数名，以及 state。
 */
export const compileDesignerPropFunction = (
  codeOrEncoded: string,
  state: Record<string, unknown>,
  options?: {
    name?: string
    modelKey?: string
    params?: string[]
  },
): ((...args: unknown[]) => unknown) | undefined => {
  const decoded = decodeFunctionPropValue(codeOrEncoded)
  const body = decoded.code.trim()
  if (!body) return undefined

  const rawName = String(options?.name || options?.modelKey || 'handler').trim()
  const fnName = SAFE_NAME_RE.test(rawName.replace(/-/g, '_'))
    ? rawName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, '')
    : 'handler'

  const params = (
    options?.params ||
    decoded.params ||
    getFunctionPropParams(String(options?.modelKey || ''))
  ).filter((item) => SAFE_NAME_RE.test(item))

  const prelude = params
    .map((param, index) => `const ${param} = args[${index}];`)
    .join('\n')

  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'args',
      'state',
      `"use strict";\n${prelude}\n${body}`,
    )
    return (...args: unknown[]) => runner(args, state)
  } catch (error) {
    console.error(`[GrowPropFunction:${fnName}]`, error)
    return undefined
  }
}
