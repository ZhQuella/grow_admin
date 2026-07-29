import type { ComponentEventOption } from './types'

const click: ComponentEventOption = {
  type: 'click',
  label: '点击',
  describe: '鼠标点击时触发',
}
const dblclick: ComponentEventOption = {
  type: 'dblclick',
  label: '双击',
  describe: '鼠标双击时触发',
}
const change: ComponentEventOption = {
  type: 'change',
  label: '值变化',
  describe: '绑定值变化时触发',
}
const input: ComponentEventOption = {
  type: 'input',
  label: '输入',
  describe: '输入时触发',
}
const focus: ComponentEventOption = {
  type: 'focus',
  label: '聚焦',
  describe: '获得焦点时触发',
}
const blur: ComponentEventOption = {
  type: 'blur',
  label: '失焦',
  describe: '失去焦点时触发',
}
const clear: ComponentEventOption = {
  type: 'clear',
  label: '清空',
  describe: '清空时触发',
}
const visibleChange: ComponentEventOption = {
  type: 'visible-change',
  label: '显隐变化',
  describe: '下拉/面板显隐变化时触发',
}

const COMMON_DOM = [click, dblclick]
const FORM_VALUE = [change, input, focus, blur, clear]
const SELECT_LIKE = [change, focus, blur, clear, visibleChange]

/** 组件 elTagName -> 可配置事件列表 */
export const elementEventsMap: Record<string, ComponentEventOption[]> = {
  // 基础
  img: COMMON_DOM,
  BasicTitle: COMMON_DOM,
  p: COMMON_DOM,
  span: COMMON_DOM,
  div: COMMON_DOM,

  // 布局
  GrowCard: [click],
  GrowTabs: [
    { type: 'tab-change', label: '切换页签', describe: '切换 Tab 时触发' },
    { type: 'tab-click', label: '点击页签', describe: '点击 Tab 时触发' },
  ],
  GrowTabPane: [],
  GrowRow: [click],
  GrowCol: [click],
  GrowCollapse: [
    change,
    { type: 'expand-change', label: '展开变化', describe: '展开面板变化时触发' },
  ],
  GrowCollapseItem: [],
  GrowScrollbar: [
    { type: 'scroll', label: '滚动', describe: '滚动时触发' },
  ],
  GrowLayout: [],

  // 反馈 / 浮层
  GrowModal: [
    { type: 'open', label: '打开', describe: '打开时触发' },
    { type: 'opened', label: '打开动画结束', describe: '打开动画结束时触发' },
    { type: 'close', label: '关闭', describe: '关闭时触发' },
    { type: 'closed', label: '关闭动画结束', describe: '关闭动画结束时触发' },
    { type: 'update:modelValue', label: '显隐更新', describe: 'v-model 更新时触发' },
  ],
  GrowDrawer: [
    { type: 'open', label: '打开', describe: '打开时触发' },
    { type: 'opened', label: '打开动画结束', describe: '打开动画结束时触发' },
    { type: 'close', label: '关闭', describe: '关闭时触发' },
    { type: 'closed', label: '关闭动画结束', describe: '关闭动画结束时触发' },
    { type: 'update:modelValue', label: '显隐更新', describe: 'v-model 更新时触发' },
  ],
  GrowPopover: [
    { type: 'show', label: '显示', describe: '显示时触发' },
    { type: 'hide', label: '隐藏', describe: '隐藏时触发' },
  ],
  GrowTooltip: [],
  GrowSearchBar: [
    { type: 'search', label: '搜索', describe: '触发搜索时触发' },
    { type: 'reset', label: '重置', describe: '重置时触发' },
  ],
  GrowColumnBar: [
    { type: 'confirm', label: '确认', describe: '确认列设置时触发，参数为更新后的列数据' },
  ],

  // 表单
  GrowForm: [
    { type: 'validate', label: '校验', describe: '表单校验时触发' },
  ],
  GrowFormItem: [],
  GrowButton: [click, focus, blur],
  GrowLink: [click],
  GrowInput: FORM_VALUE,
  GrowInputNumber: [change, focus, blur],
  GrowSelect: SELECT_LIKE,
  GrowCascader: SELECT_LIKE,
  GrowSwitch: [change],
  GrowSlider: [change, input],
  GrowTransfer: [
    change,
    { type: 'left-check-change', label: '左侧勾选变化' },
    { type: 'right-check-change', label: '右侧勾选变化' },
  ],
  GrowDatePicker: [change, focus, blur, clear, visibleChange],
  GrowTimePicker: [change, focus, blur, clear, visibleChange],
  GrowRadio: [change],
  GrowCheckbox: [change],
  GrowRadioGroup: [change],
  GrowCheckboxGroup: [change],
  GrowTreeSelect: SELECT_LIKE,
  GrowMention: [change, input, focus, blur, clear],
  GrowUpload: [
    { type: 'change', label: '文件变化', describe: '文件列表变化时触发' },
    { type: 'success', label: '上传成功' },
    { type: 'error', label: '上传失败' },
    { type: 'remove', label: '移除文件' },
    { type: 'exceed', label: '超出限制' },
    { type: 'preview', label: '预览' },
  ],

  // 数据展示
  GrowTable: [
    { type: 'select', label: '选择行' },
    { type: 'select-all', label: '全选' },
    { type: 'selection-change', label: '选择变化' },
    { type: 'row-click', label: '行点击' },
    { type: 'row-dblclick', label: '行双击' },
    { type: 'sort-change', label: '排序变化' },
    { type: 'filter-change', label: '筛选变化' },
  ],
  GrowPagination: [
    {
      type: 'current-change',
      label: '当前页变化',
      describe: 'current-page 改变时触发',
    },
    {
      type: 'size-change',
      label: '每页条数变化',
      describe: 'page-size 改变时触发',
    },
    {
      type: 'change',
      label: '页码或条数变化',
      describe: 'current-page 或 page-size 改变时触发',
    },
    {
      type: 'prev-click',
      label: '上一页点击',
      describe: '用户点击上一页按钮时触发',
    },
    {
      type: 'next-click',
      label: '下一页点击',
      describe: '用户点击下一页按钮时触发',
    },
    {
      type: 'update:current-page',
      label: '当前页更新',
      describe: 'v-model:current-page 更新时触发',
    },
    {
      type: 'update:page-size',
      label: '每页条数更新',
      describe: 'v-model:page-size 更新时触发',
    },
  ],
  GrowAvatar: [click],
  GrowBadge: [click],
  GrowTime: [],
  GrowEllipsis: [click],
  GrowIconify: [click],
  GrowCalendar: [change],
  GrowDivider: [],
  GrowTimeline: [],
  GrowTimelineItem: [click],
  GrowCarousel: [
    { type: 'change', label: '切换幻灯片', describe: '幻灯片切换时触发' },
  ],
  GrowCarouselItem: [click],
  GrowTree: [
    { type: 'node-click', label: '节点点击' },
    { type: 'node-expand', label: '节点展开' },
    { type: 'node-collapse', label: '节点收起' },
    { type: 'check', label: '勾选' },
    { type: 'check-change', label: '勾选变化' },
    { type: 'current-change', label: '当前节点变化' },
  ],
}

/** 默认函数名：click → onClick；onMounted → onMounted；update:modelValue → onUpdateModelValue */
export const defaultEventHandlerName = (eventType: string) => {
  const raw = String(eventType || 'event').trim()
  if (/^on[A-Z_]/.test(raw) || raw === 'onMounted' || raw.startsWith('on')) {
    // 已是 onXxx 形式（如页面生命周期）
    const cleaned = raw.replace(/[^A-Za-z0-9_$]/g, '')
    return cleaned || 'handler'
  }
  const parts = raw
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
  const body = parts.join('') || 'Event'
  return `on${body.charAt(0).toUpperCase()}${body.slice(1)}`
}

export const getComponentEventOptions = (
  elTagName?: string,
): ComponentEventOption[] => {
  if (!elTagName) return []
  return elementEventsMap[elTagName] || COMMON_DOM
}

/** 页面级生命周期事件（左侧「页面事件」面板） */
export const PAGE_LIFECYCLE_EVENTS: ComponentEventOption[] = [
  {
    type: 'onBeforeMount',
    label: '挂载前',
    describe: '页面挂载之前触发（onBeforeMount）',
  },
  {
    type: 'onMounted',
    label: '挂载完成',
    describe: '页面挂载完成后触发（onMounted）',
  },
  {
    type: 'onBeforeUpdate',
    label: '更新前',
    describe: '页面因响应式数据即将重新渲染前触发（onBeforeUpdate）',
  },
  {
    type: 'onUpdated',
    label: '更新完成',
    describe: '页面重新渲染完成后触发（onUpdated）',
  },
  {
    type: 'onBeforeUnmount',
    label: '卸载前',
    describe: '页面卸载前触发（onBeforeUnmount）',
  },
  {
    type: 'onUnmounted',
    label: '卸载完成',
    describe: '页面卸载后触发（onUnmounted）',
  },
  {
    type: 'onActivated',
    label: '被激活',
    describe: '被 keep-alive 缓存的页面再次激活时触发（onActivated）',
  },
  {
    type: 'onDeactivated',
    label: '被停用',
    describe: '被 keep-alive 缓存的页面停用时触发（onDeactivated）',
  },
  {
    type: 'onErrorCaptured',
    label: '捕获错误',
    describe: '捕获后代组件错误时触发；参数 event 为错误对象（onErrorCaptured）',
  },
]
