export const MENU_FUNCTION_CODE_PATTERN = /^[A-Za-z0-9:_]+$/
export const MENU_FUNCTION_CODE_MESSAGE = '仅允许大小写字母、数字、冒号和下划线'

export type SystemMenuFunction = {
  id: string
  menuName: string
  title: string
  code: string
  sort: number
  enabled: boolean
}

export type SystemMenuFunctionSavePayload = {
  menuName: string
  items: Array<{
    id?: string
    title: string
    code: string
    sort: number
    enabled: boolean
  }>
}
