export const DRAGGABLE_CONGIG = "__draggableConfig__";

export const ACTIVE_UUID = "__activeUUID__";

/** 弹窗 / 抽屉设计态模拟编辑层当前 uuid */
export const OVERLAY_EDIT_UUID = "__overlayEditUUID__";

/**
 * 是否处于设计画布（含 overlay 编辑层）。
 * 预览 / 运行态应为 false；勿用 DRAGGABLE_CONGIG 判断（预览抽屉仍在其 provide 树下）。
 */
export const GROW_DESIGN_CANVAS = "__growDesignCanvas__";

/** 布局容器主区域 WatchBox 尺寸（供表格等子组件适应高度） */
export const LAYOUT_MAIN_SIZE = "__layoutMainSize__";

/** 变量绑定运行时 state（由 dataSource / computedProps 求值） */
export const GROW_RUNTIME_STATE = "__growRuntimeState__";

/** 数据请求方法表（由 apiOutlined 生成，事件中通过 apis.名称() 调用） */
export const GROW_RUNTIME_APIS = "__growRuntimeApis__";

/** 组件实例 refs 表（由 renderArgument.refName 收集，事件中通过 refs.名称 调用） */
export const GROW_RUNTIME_REFS = "__growRuntimeRefs__";

export type LayoutMainSize = {
  width: number
  height: number
}
