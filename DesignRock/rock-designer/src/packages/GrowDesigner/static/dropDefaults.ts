import { FORM_MODULE_FULL_WIDTH_TAGS } from './moduleMap'
import { createDefaultTableColumns } from './tableColumnUtils'

/** 行内块元素的默认画布样式 */
export const INLINE_BLOCK_STYLES: Record<string, string> = {
  display: 'inline-block',
  'min-width': '80px',
  'min-height': '36px',
}

/** 拖入画布时按 elTagName 写入的默认样式 */
export const defaultStylesByTag: Record<string, Record<string, string>> = {
  img: {
    width: '120px',
    height: '80px',
    'object-fit': 'cover',
  },
  BasicTitle: {
    width: '100%',
    'min-height': '48px',
    color: '#101010',
    'font-size': '20px',
    'line-height': '1.4',
  },
  p: {
    width: '100%',
    'min-height': '40px',
    color: '#101010',
    'font-size': '14px',
    'line-height': '1.4',
  },
  span: {
    'min-height': '36px',
    'min-width': '96px',
    color: '#101010',
    'font-size': '14px',
    'line-height': '1.4',
  },
  GrowEllipsis: {
    width: '240px',
    'max-width': '100%',
  },
  GrowScrollbar: {
    width: '100%',
  },
  GrowLayout: {
    width: '100%',
    height: '100%',
  },
  GrowModal: {
    width: '100%',
  },
  GrowDrawer: {
    width: '100%',
  },
}

/** 拖入画布时按 elTagName 写入的默认 props */
export const defaultPropsByTag: Record<string, Record<string, any>> = {
  BasicTitle: { level: 'h3', context: '标题文本' },
  p: { context: '正文内容' },
  span: { context: '短语文本' },
  GrowButton: { content: '按钮', type: 'primary' },
  GrowLink: {
    content: '链接文字',
    type: 'primary',
    underline: true,
  },
  GrowSearchBar: {
    search: [
      {
        labelText: '关键词',
        placeholder: '请输入关键词',
        elType: 'GrowInput',
        isDefault: true,
        model: 'keyword',
        noDelete: true,
      },
      {
        labelText: '状态',
        elType: 'GrowSelect',
        isDefault: true,
        model: 'status',
        label: 'label',
        value: 'value',
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' },
        ],
      },
    ],
    defaultData: {},
  },
  img: {
    alt: '图片',
  },
  GrowCarousel: {
    height: '200px',
    autoplay: true,
    interval: 3000,
    arrow: 'hover',
    loop: true,
    direction: 'horizontal',
    'pause-on-hover': true,
  },
  GrowScrollbar: {
    height: '200px',
  },
  GrowLayout: {
    layout: 'header-main',
    headerHeight: '40px',
    asideWidth: '200px',
    footerHeight: '60px',
  },
  GrowTooltip: {
    content: '文字提示',
    placement: 'top',
    trigger: 'hover',
    effect: 'dark',
  },
  GrowPopover: {
    title: '标题',
    content: '弹出框内容',
    placement: 'bottom',
    trigger: 'click',
    width: 200,
  },
  GrowModal: {
    title: '弹窗标题',
    modelValue: false,
    showFooter: false,
    width: '480px',
    'show-close': true,
    'close-on-click-modal': true,
    'close-on-press-escape': true,
  },
  GrowDrawer: {
    title: '抽屉标题',
    modelValue: false,
    showFooter: false,
    direction: 'rtl',
    size: '30%',
    'show-close': true,
    'close-on-click-modal': true,
    'close-on-press-escape': true,
  },
  GrowTable: {
    border: true,
    stripe: false,
    'show-header': true,
  },
  GrowSlider: {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1,
    'show-tooltip': true,
  },
  GrowTransfer: {
    modelValue: [],
    filterable: false,
    titles: ['列表 1', '列表 2'],
    'button-texts': [],
    'target-order': 'original',
  },
  GrowRadioGroup: {
    modelValue: '',
  },
  GrowCheckboxGroup: {
    modelValue: [],
  },
  GrowTreeSelect: {
    value: null,
    placeholder: '请选择',
    clearable: true,
    filterable: true,
    size: 'medium',
    options: [
      {
        label: '选项组 1',
        key: '1',
        children: [
          { label: '选项 1-1', key: '1-1' },
          { label: '选项 1-2', key: '1-2' },
        ],
      },
      {
        label: '选项组 2',
        key: '2',
        children: [{ label: '选项 2-1', key: '2-1' }],
      },
    ],
  },
  GrowMention: {
    value: '',
    placeholder: '输入 @ 提及某人',
    prefix: '@',
    separator: ' ',
    type: 'text',
    bordered: true,
    size: 'medium',
    options: [
      { label: '张三', value: 'zhangsan' },
      { label: '李四', value: 'lisi' },
      { label: '王五', value: 'wangwu' },
    ],
  },
  GrowTime: {
    type: 'datetime',
    unix: false,
    text: false,
    format: 'yyyy-MM-dd HH:mm:ss',
  },
  GrowEllipsis: {
    content:
      '这是一段很长的文本内容，超出容器宽度或设定行数后会被省略显示，悬浮可查看完整内容。',
    'line-clamp': 1,
    tooltip: true,
  },
  GrowIconify: {
    icon: 'carbon:application',
    size: 24,
    color: '',
    prefix: '',
    infinite: false,
    hoverPointer: false,
    hoverColor: 'inherit',
  },
  GrowTimePicker: {
    value: null,
    placeholder: '请选择时间',
    format: 'HH:mm:ss',
    clearable: true,
    size: 'medium',
  },
  GrowCard: {
    showFooter: false,
    showHeaderExtra: false,
  },
}

/**
 * 容器组件需保证存在的结构槽位字段。
 * children → 主内容；其余为具名插槽拖入区。
 */
export const structureSlotsByTag: Record<string, string[]> = {
  GrowCard: ['footerSlot', 'optionSlot'],
  GrowModal: ['children', 'footerSlot'],
  GrowDrawer: ['children', 'footerSlot'],
  // children → #reference；contentSlot → default 弹出内容
  GrowPopover: ['children', 'contentSlot'],
  GrowLayout: ['children', 'headerSlot', 'asideSlot', 'footerSlot'],
}

/** 结构上可能存放子节点的槽位键（复制时用于定位同级数组） */
export const STRUCTURE_SLOT_KEYS = [
  'children',
  'footerSlot',
  'optionSlot',
  'contentSlot',
  'headerSlot',
  'asideSlot',
] as const

export type SpecificChildAction = {
  type: 'specificChild'
  titlePrefix: string
  titleKey: string
  /** 是否将新建子项 name 写入父组件 modelValue */
  setModelValue?: boolean
}

export type ColChildAction = {
  type: 'colChild'
  span?: number
}

export type DropInitAction = SpecificChildAction | ColChildAction

/** 拖入画布后自动初始化子项 */
export const dropInitActionsByTag: Record<string, DropInitAction> = {
  GrowTabs: {
    type: 'specificChild',
    titlePrefix: '选项',
    titleKey: 'label',
    setModelValue: true,
  },
  GrowCollapse: {
    type: 'specificChild',
    titlePrefix: '面板',
    titleKey: 'title',
    setModelValue: true,
  },
  GrowRow: {
    type: 'colChild',
    span: 12,
  },
}

/** 「添加子项」按钮：按 childName 决定创建方式 */
export const specialAddByChildName: Record<string, DropInitAction> = {
  GrowTabPane: {
    type: 'specificChild',
    titlePrefix: '选项',
    titleKey: 'label',
  },
  GrowCollapseItem: {
    type: 'specificChild',
    titlePrefix: '面板',
    titleKey: 'title',
  },
  GrowCol: {
    type: 'colChild',
    span: 12,
  },
}

/** 合并标签专属样式 + 表单全宽规则 + 行内块规则 */
export const resolveDefaultStyles = (
  elTagName?: string,
  isInlineBlock?: boolean,
): Record<string, string> => {
  const styles: Record<string, string> = {}
  if (isInlineBlock) Object.assign(styles, INLINE_BLOCK_STYLES)
  if (elTagName && defaultStylesByTag[elTagName]) {
    Object.assign(styles, defaultStylesByTag[elTagName])
  }
  if (elTagName && FORM_MODULE_FULL_WIDTH_TAGS.has(elTagName)) {
    styles.width = '100%'
  }
  // 链接 / 按钮 / 高级搜索 / 开关 / 头像 / 图标：保留行内块，不设默认最小宽高
  if (
    elTagName === 'GrowLink' ||
    elTagName === 'GrowButton' ||
    elTagName === 'GrowSearchBar' ||
    elTagName === 'GrowSwitch' ||
    elTagName === 'GrowAvatar' ||
    elTagName === 'GrowIconify'
  ) {
    Reflect.deleteProperty(styles, 'min-width')
    Reflect.deleteProperty(styles, 'min-height')
  }
  return styles
}

/** 合并标签专属 props + 表单全宽 class（GrowTime.time 在拖入时即时取值） */
export const resolveDefaultProps = (elTagName?: string): Record<string, any> => {
  const props: Record<string, any> = {}
  if (elTagName && defaultPropsByTag[elTagName]) {
    // 深拷贝，避免多个实例共享嵌套对象引用（如 search / options）
    Object.assign(props, structuredClone(defaultPropsByTag[elTagName]))
  }
  if (elTagName === 'GrowTime') {
    props.time = Date.now()
  }
  if (elTagName === 'GrowTable') {
    props.columns = createDefaultTableColumns()
  }
  if (elTagName && FORM_MODULE_FULL_WIDTH_TAGS.has(elTagName)) {
    props.class = 'w-full'
  }
  // 显示 / 渲染默认开启
  if (props.visible === undefined) props.visible = true
  if (props.render === undefined) props.render = true
  return props
}

/** 确保结构上存在指定槽位数组 */
export const ensureStructureSlots = (structure: any, elTagName?: string) => {
  const slots = elTagName ? structureSlotsByTag[elTagName] : undefined
  if (!slots) return structure
  for (const key of slots) {
    if (!Array.isArray(structure[key])) structure[key] = []
  }
  return structure
}

/** 在父节点中定位包含指定 uuid 的同级数组 */
export const findSiblingArray = (
  parent: any | null,
  uuid: string,
  fallback: any[],
): any[] => {
  if (!parent) return fallback
  for (const key of STRUCTURE_SLOT_KEYS) {
    const list = parent[key]
    if (Array.isArray(list) && list.some((el: any) => el.uuid === uuid)) {
      return list
    }
  }
  return parent.children || []
}
