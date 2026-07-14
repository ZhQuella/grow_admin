export type AbstractEleConfig = {
  elType?: string
  model: string
  labelText?: string
  placeholder?: string
  options?: Recordable<any>[]
  /** 选项的展示字段，默认 label */
  label?: string
  /** 选项的值字段，默认 value */
  value?: string
  [key: string]: unknown
}
