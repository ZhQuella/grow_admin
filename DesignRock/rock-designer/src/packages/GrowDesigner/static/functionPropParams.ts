/** 函数类 prop 的形参名注册（modelKey → params） */

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

const FUNCTION_PROP_PARAMS: Record<string, string[]> = {}

export const registerFunctionPropParams = (
  modelKey: string,
  params: string[] = [],
) => {
  const key = String(modelKey || '').trim()
  if (!key) return
  FUNCTION_PROP_PARAMS[key] = params
    .map((item) => String(item || '').trim())
    .filter((item) => SAFE_NAME_RE.test(item))
}

export const getFunctionPropParams = (modelKey: string): string[] =>
  FUNCTION_PROP_PARAMS[String(modelKey || '').trim()] || []
