export type ColumnBarItem = {
  title?: string
  field?: string
  visible?: boolean
  disabled?: boolean
  children?: ColumnBarItem[]
  [key: string]: unknown
}
