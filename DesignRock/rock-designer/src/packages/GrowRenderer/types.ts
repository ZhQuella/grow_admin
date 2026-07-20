/** 设计器 / 运行时共用的页面渲染 schema */
export type DesignerStructureNode = {
  uuid: string
  children?: DesignerStructureNode[]
  /** GrowCard / GrowModal / GrowDrawer / GrowLayout 页脚插槽子节点 */
  footerSlot?: DesignerStructureNode[]
  /** GrowCard 标题右侧操作插槽子节点 */
  optionSlot?: DesignerStructureNode[]
  /** GrowPopover default 插槽（弹出内容）；reference 使用 children */
  contentSlot?: DesignerStructureNode[]
  /** GrowLayout 顶栏插槽 */
  headerSlot?: DesignerStructureNode[]
  /** GrowLayout 侧边栏插槽 */
  asideSlot?: DesignerStructureNode[]
}

export type DesignerRenderArgument = {
  elTagName?: string
  elName?: string
  elType?: string
  isChild?: boolean
  unsupported?: boolean
  [key: string]: unknown
}

export type DesignerSchema = {
  structures?: DesignerStructureNode[]
  renderArgument?: Record<string, DesignerRenderArgument>
  styles?: Record<string, Record<string, any>>
  props?: Record<string, Record<string, any>>
  pageConfig?: Record<string, any>
  events?: Record<string, any>
  dataSource?: unknown[]
  apiOutlined?: unknown[]
}
