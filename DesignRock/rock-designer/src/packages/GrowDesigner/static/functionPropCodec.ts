/** 函数 prop 存储编解码（code + params，避免同名 prop 形参冲突） */

export type EncodedFunctionProp = {
  __fn: 1
  code: string
  params?: string[]
  /** 从 args[0] 解构具名参数（如表格 span-method） */
  objectArgs?: boolean
}

export const encodeFunctionPropValue = (
  code: string,
  params: string[] = [],
  options?: { objectArgs?: boolean },
): string => {
  const body = String(code ?? '')
  const list = (params || []).map((item) => String(item || '').trim()).filter(Boolean)
  const objectArgs = Boolean(options?.objectArgs)
  if (!list.length && !objectArgs) return body
  const payload: EncodedFunctionProp = { __fn: 1, code: body }
  if (list.length) payload.params = list
  if (objectArgs) payload.objectArgs = true
  return JSON.stringify(payload)
}

export const decodeFunctionPropValue = (
  raw: unknown,
): { code: string; params: string[]; objectArgs: boolean } => {
  if (raw == null || raw === '') return { code: '', params: [], objectArgs: false }
  if (typeof raw === 'function') return { code: '', params: [], objectArgs: false }
  const str = String(raw)
  const trimmed = str.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as EncodedFunctionProp
      if (parsed && parsed.__fn === 1) {
        return {
          code: String(parsed.code ?? ''),
          params: Array.isArray(parsed.params)
            ? parsed.params.map((item) => String(item || '').trim()).filter(Boolean)
            : [],
          objectArgs: Boolean(parsed.objectArgs),
        }
      }
    } catch {
      // 普通函数体也可能以 { 开头，按源码处理
    }
  }
  return { code: str, params: [], objectArgs: false }
}
