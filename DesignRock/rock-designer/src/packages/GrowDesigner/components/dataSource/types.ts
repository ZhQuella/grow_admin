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
  /** 函数体，可使用 state，须 return 返回值 */
  code: string
}

export type DesignerComputedPropFormModel = Omit<DesignerComputedPropItem, 'id'>
