import type { PropBindMode } from '../../static/propBindModes'

export interface DesignerApiParam {
  key: string
  value: string
  /** value 输入模式：text 固定值 / bind 绑定数据源或计算属性 */
  bindMode?: PropBindMode | string
}

export type DesignerApiProcessorType = 'willFetch' | 'fit' | 'didFetch' | 'onError'

export interface DesignerApiProcessor {
  id: string
  type: DesignerApiProcessorType
  code: string
}

export interface DesignerApiOutlinedItem {
  id: string
  name: string
  description: string
  autoLoad: boolean
  loadType: 'serial' | 'parallel'
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params: DesignerApiParam[]
  shouldFetch: boolean
  processors: DesignerApiProcessor[]
  defaultData: string
}

export type DesignerApiFormModel = Omit<DesignerApiOutlinedItem, 'id'>
