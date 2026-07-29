export const DRAGGABLE_CONGIG = "__draggableConfig__";

export const ACTIVE_UUID = "__activeUUID__";

/** 弹窗 / 抽屉设计态模拟编辑层当前 uuid */
export const OVERLAY_EDIT_UUID = "__overlayEditUUID__";

/** 布局容器主区域 WatchBox 尺寸（供表格等子组件适应高度） */
export const LAYOUT_MAIN_SIZE = "__layoutMainSize__";

/** 变量绑定运行时 state（由 dataSource / computedProps 求值） */
export const GROW_RUNTIME_STATE = "__growRuntimeState__";

/** 数据请求方法表（由 apiOutlined 生成，事件中通过 apis.名称() 调用） */
export const GROW_RUNTIME_APIS = "__growRuntimeApis__";

export type LayoutMainSize = {
  width: number
  height: number
}
