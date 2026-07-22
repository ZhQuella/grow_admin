/** 函数 prop 存储编解码（code + params，避免同名 prop 形参冲突） */

export type EncodedFunctionProp = {
  __fn: 1
  code: string
  params?: string[]
}

export const encodeFunctionPropValue = (
  code: string,
  params: string[] = [],
): string => {
  const body = String(code ?? '')
  const list = (params || []).map((item) => String(item || '').trim()).filter(Boolean)
  if (!list.length) return body
  const payload: EncodedFunctionProp = { __fn: 1, code: body, params: list }
  return JSON.stringify(payload)
}

export const decodeFunctionPropValue = (
  raw: unknown,
): { code: string; params: string[] } => {
  if (raw == null || raw === '') return { code: '', params: [] }
  if (typeof raw === 'function') return { code: '', params: [] }
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
        }
      }
    } catch {
      // 普通函数体也可能以 { 开头，按源码处理
    }
  }
  return { code: str, params: [] }
}
