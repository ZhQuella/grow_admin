import {
  boolSwitch,
  createConfig,
  numberInput,
  selectInput,
  sizeSelect,
  textInput,
} from './shared'

/** 弹窗 */
export const modalConfig = createConfig([
  textInput('标题', 'title', '对话框标题'),
  boolSwitch('显示', 'modelValue', '是否显示 Dialog'),
  boolSwitch('显示关闭', 'show-close', '是否显示关闭按钮'),
  boolSwitch('点击遮罩关闭', 'close-on-click-modal', '是否可通过点击遮罩关闭'),
  boolSwitch('按 ESC 关闭', 'close-on-press-escape', '是否可通过按下 ESC 关闭'),
  boolSwitch('锁定滚动', 'lock-scroll', '是否在 Dialog 出现时将 body 滚动锁定'),
  boolSwitch('全屏', 'fullscreen', '是否为全屏 Dialog'),
  boolSwitch('居中', 'center', '是否对头部和底部采用居中布局'),
  boolSwitch('可拖拽', 'draggable', '是否可拖拽'),
  boolSwitch('销毁子元素', 'destroy-on-close', '关闭时销毁 Dialog 中的元素'),
  textInput('宽度', 'width', 'Dialog 的宽度', '如 50%'),
])

/** 抽屉 */
export const drawerConfig = createConfig([
  textInput('标题', 'title', '抽屉标题'),
  boolSwitch('显示', 'modelValue', '是否显示 Drawer'),
  selectInput(
    '打开方向',
    'direction',
    [
      { label: '右', value: 'rtl' },
      { label: '左', value: 'ltr' },
      { label: '上', value: 'ttb' },
      { label: '下', value: 'btt' },
    ],
    'Drawer 打开的方向',
  ),
  textInput('尺寸', 'size', 'Drawer 窗体的大小', '如 30%'),
  boolSwitch('显示关闭', 'show-close', '是否显示关闭按钮'),
  boolSwitch('点击遮罩关闭', 'close-on-click-modal', '点击遮罩是否关闭'),
  boolSwitch('按 ESC 关闭', 'close-on-press-escape', '按下 ESC 是否关闭'),
  boolSwitch('销毁子元素', 'destroy-on-close', '控制是否在关闭后销毁'),
])

/** 弹出框 Popover */
export const popoverConfig = createConfig([
  textInput('标题', 'title', '标题'),
  textInput('内容', 'content', '显示的内容'),
  selectInput(
    '触发方式',
    'trigger',
    [
      { label: 'click', value: 'click' },
      { label: 'focus', value: 'focus' },
      { label: 'hover', value: 'hover' },
      { label: 'contextmenu', value: 'contextmenu' },
    ],
    '触发方式',
  ),
  selectInput(
    '出现位置',
    'placement',
    [
      { label: 'top', value: 'top' },
      { label: 'bottom', value: 'bottom' },
      { label: 'left', value: 'left' },
      { label: 'right', value: 'right' },
    ],
    '出现位置',
  ),
  numberInput('延迟显示', 'show-after', '延迟出现，单位毫秒'),
  numberInput('延迟隐藏', 'hide-after', '延迟关闭，单位毫秒'),
  boolSwitch('禁用', 'disabled', 'Popover 是否可用'),
])

/** 文字提示 Tooltip */
export const tooltipConfig = createConfig([
  textInput('内容', 'content', '显示的内容'),
  selectInput(
    '出现位置',
    'placement',
    [
      { label: 'top', value: 'top' },
      { label: 'bottom', value: 'bottom' },
      { label: 'left', value: 'left' },
      { label: 'right', value: 'right' },
    ],
    'Tooltip 组件出现的位置',
  ),
  boolSwitch('禁用', 'disabled', 'Tooltip 是否可用'),
  numberInput('延迟显示', 'show-after', '延迟出现，单位毫秒'),
  numberInput('延迟隐藏', 'hide-after', '延迟关闭，单位毫秒'),
])

/** 分割线 */
export const dividerConfig = createConfig([
  selectInput(
    '方向',
    'direction',
    [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ],
    '设置分割线方向',
  ),
  selectInput(
    '文案位置',
    'content-position',
    [
      { label: '左', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右', value: 'right' },
    ],
    '分割线文案的位置',
  ),
  boolSwitch('虚线', 'border-style', '是否为虚线风格（占位）'),
])

/** 头像 */
export const avatarConfig = createConfig([
  selectInput(
    '形状',
    'shape',
    [
      { label: '圆形', value: 'circle' },
      { label: '方形', value: 'square' },
    ],
    '头像形状',
  ),
  numberInput('尺寸', 'size', '头像大小'),
  textInput('图片地址', 'src', '图片头像地址'),
  textInput('适配方式', 'fit', '图片如何适应容器', '如 cover'),
])

/** 徽章 */
export const badgeConfig = createConfig([
  numberInput('显示值', 'value', '显示值'),
  numberInput('最大值', 'max', '最大值，超过最大值会显示 {max}+'),
  boolSwitch('小圆点', 'is-dot', '是否显示小圆点'),
  boolSwitch('隐藏', 'hidden', '是否隐藏 Badge'),
  selectInput(
    '类型',
    'type',
    [
      { label: 'primary', value: 'primary' },
      { label: 'success', value: 'success' },
      { label: 'warning', value: 'warning' },
      { label: 'danger', value: 'danger' },
      { label: 'info', value: 'info' },
    ],
    '类型',
  ),
])

/** 时间线 */
export const timelineConfig = createConfig([
  boolSwitch('倒序', 'reverse', '指定节点排序方向，默认为正序'),
])

/** 时间线项 */
export const timelineItemConfig = createConfig([
  textInput('时间戳', 'timestamp', '时间戳'),
  boolSwitch('隐藏时间戳', 'hide-timestamp', '是否隐藏时间戳'),
  selectInput(
    '时间戳位置',
    'placement',
    [
      { label: '上', value: 'top' },
      { label: '下', value: 'bottom' },
    ],
    '时间戳位置',
  ),
  selectInput(
    '节点类型',
    'type',
    [
      { label: 'primary', value: 'primary' },
      { label: 'success', value: 'success' },
      { label: 'warning', value: 'warning' },
      { label: 'danger', value: 'danger' },
      { label: 'info', value: 'info' },
    ],
    '节点类型',
  ),
  selectInput(
    '节点尺寸',
    'size',
    [
      { label: '正常', value: 'normal' },
      { label: '大', value: 'large' },
    ],
    '节点尺寸',
  ),
  boolSwitch('空心点', 'hollow', '是否空心点'),
])

/** 树 */
export const treeConfig = createConfig([
  boolSwitch('手风琴', 'accordion', '是否每次只打开一个同级树节点'),
  boolSwitch('高亮当前', 'highlight-current', '是否高亮当前选中节点'),
  boolSwitch('默认展开全部', 'default-expand-all', '是否默认展开所有节点'),
  boolSwitch('显示复选框', 'show-checkbox', '节点是否可被选择'),
  boolSwitch('严格勾选', 'check-strictly', '父子不互相关联'),
  boolSwitch('可拖拽', 'draggable', '是否开启拖拽节点功能'),
  sizeSelect('组件尺寸'),
])

/** 表格（常用项） */
export const tableConfig = createConfig([
  boolSwitch('斑马纹', 'stripe', '是否为斑马纹 table'),
  boolSwitch('边框', 'border', '是否带有纵向边框'),
  boolSwitch('显示表头', 'show-header', '是否显示表头'),
  boolSwitch('高亮当前行', 'highlight-current-row', '是否要高亮当前行'),
  textInput('高度', 'height', 'Table 的高度', '如 400'),
  textInput('最大高度', 'max-height', 'Table 的最大高度'),
  sizeSelect('Table 尺寸'),
  boolSwitch('空数据时显示', 'empty-text', '空数据时显示的文本（占位）'),
])
