import type { DesignerApiFormModel, DesignerApiProcessorType } from './types'

export const loadTypeOptions = [
  { label: '串行', value: 'serial' },
  { label: '并行', value: 'parallel' },
]

export const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
]

export const processorTypeOptions: Array<{ type: DesignerApiProcessorType; label: string }> = [
  { type: 'willFetch', label: '请求发送前处理函数' },
  { type: 'fit', label: '请求返回时的数据适配' },
  { type: 'didFetch', label: '请求完成回调函数' },
  { type: 'onError', label: '请求错误处理函数' },
]

export const createDefaultApiForm = (): DesignerApiFormModel => ({
  name: '',
  description: '',
  autoLoad: true,
  loadType: 'parallel',
  url: '',
  method: 'GET',
  params: [],
  body: [],
  pathParams: [],
  shouldFetch: true,
  processors: [],
  defaultData: '',
})
