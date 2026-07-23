export interface DesignerDataSourceItem {
  id: string
  name: string
  description: string
  data: string
}

export type DesignerDataSourceFormModel = Omit<DesignerDataSourceItem, 'id'>

/** 页面计算属性：基于 state 脚本派生，挂到同名 state 键 */
export interface DesignerComputedPropItem {
  id: string
  name: string
  description: string
  /** 表达式，可使用 state（如 (state.list || []).filter(Boolean)） */
  code: string
}

export type DesignerComputedPropFormModel = Omit<DesignerComputedPropItem, 'id'>
