/** 函数类 prop 的形参元信息注册（modelKey → meta） */

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

export type FunctionPropParamMeta = {
  params: string[]
  /** 组件只传一个对象参数时，从 args[0] 解构具名参数 */
  objectArgs?: boolean
}

const FUNCTION_PROP_PARAMS: Record<string, FunctionPropParamMeta> = {}

export const registerFunctionPropParams = (
  modelKey: string,
  params: string[] = [],
  options?: { objectArgs?: boolean },
) => {
  const key = String(modelKey || '').trim()
  if (!key) return
  FUNCTION_PROP_PARAMS[key] = {
    params: params
      .map((item) => String(item || '').trim())
      .filter((item) => SAFE_NAME_RE.test(item)),
    objectArgs: Boolean(options?.objectArgs),
  }
}

export const getFunctionPropParams = (modelKey: string): string[] =>
  FUNCTION_PROP_PARAMS[String(modelKey || '').trim()]?.params || []

export const getFunctionPropParamMeta = (
  modelKey: string,
): FunctionPropParamMeta =>
  FUNCTION_PROP_PARAMS[String(modelKey || '').trim()] || {
    params: [],
    objectArgs: false,
  }
