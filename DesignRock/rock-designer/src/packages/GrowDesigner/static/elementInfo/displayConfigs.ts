import {
  boolSwitch,
  createConfig,
  numberInput,
  selectInput,
  sizeSelect,
  textInput,
} from './shared'

/** 弹窗：设计态用面板壳编辑；运行时由 modelValue / 事件控制显隐 */
export const modalConfig = createConfig([
  textInput('标题', 'title', '对话框标题'),
  boolSwitch('默认显示', 'modelValue', '运行时初始是否显示；设计态用工具栏打开模拟编辑层；预览不强制打开'),
  boolSwitch('启用页脚', 'showFooter', '开启后显示弹窗页脚拖入区域'),
  boolSwitch('显示关闭', 'show-close', '是否显示关闭按钮'),
  boolSwitch('点击遮罩关闭', 'close-on-click-modal', '是否可通过点击遮罩关闭'),
  boolSwitch('按 ESC 关闭', 'close-on-press-escape', '是否可通过按下 ESC 关闭'),
  boolSwitch('锁定滚动', 'lock-scroll', '是否在 Dialog 出现时将 body 滚动锁定'),
  boolSwitch('全屏', 'fullscreen', '是否为全屏 Dialog'),
  boolSwitch('居中', 'center', '是否对头部和底部采用居中布局'),
  boolSwitch('可拖拽', 'draggable', '是否可拖拽'),
  boolSwitch('销毁子元素', 'destroy-on-close', '关闭时销毁 Dialog 中的元素'),
  textInput('宽度', 'width', 'Dialog 的宽度', '如 50% 或 480px'),
])

/** 抽屉：设计态用面板壳编辑；运行时由 modelValue / 事件控制显隐 */
export const drawerConfig = createConfig([
  textInput('标题', 'title', '抽屉标题'),
  boolSwitch('默认显示', 'modelValue', '运行时初始是否显示；设计态用工具栏打开模拟编辑层；预览不强制打开'),
  boolSwitch('启用页脚', 'showFooter', '开启后显示抽屉页脚拖入区域'),
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
  textInput('尺寸', 'size', 'Drawer 窗体的大小', '如 30% 或 360px'),
  boolSwitch('显示关闭', 'show-close', '是否显示关闭按钮'),
  boolSwitch('点击遮罩关闭', 'close-on-click-modal', '点击遮罩是否关闭'),
  boolSwitch('按 ESC 关闭', 'close-on-press-escape', '按下 ESC 是否关闭'),
  boolSwitch('销毁子元素', 'destroy-on-close', '控制是否在关闭后销毁'),
])

/** 弹出框 Popover：reference=触发元素；default=弹出内容（可用 contentSlot 自定义） */
export const popoverConfig = createConfig([
  textInput('标题', 'title', '标题；有自定义内容插槽时仍可显示'),
  textInput('内容', 'content', '无自定义内容插槽时显示的文案'),
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
      { label: 'top-start', value: 'top-start' },
      { label: 'top-end', value: 'top-end' },
      { label: 'bottom', value: 'bottom' },
      { label: 'bottom-start', value: 'bottom-start' },
      { label: 'bottom-end', value: 'bottom-end' },
      { label: 'left', value: 'left' },
      { label: 'left-start', value: 'left-start' },
      { label: 'left-end', value: 'left-end' },
      { label: 'right', value: 'right' },
      { label: 'right-start', value: 'right-start' },
      { label: 'right-end', value: 'right-end' },
    ],
    '出现位置',
  ),
  numberInput('宽度', 'width', '弹出层宽度，单位 px'),
  numberInput('延迟显示', 'show-after', '延迟出现，单位毫秒'),
  numberInput('延迟隐藏', 'hide-after', '延迟关闭，单位毫秒'),
  boolSwitch('禁用', 'disabled', 'Popover 是否可用'),
])

/** 文字提示 Tooltip */
export const tooltipConfig = createConfig([
  textInput('内容', 'content', '显示的内容'),
  selectInput(
    '触发方式',
    'trigger',
    [
      { label: 'hover', value: 'hover' },
      { label: 'click', value: 'click' },
      { label: 'focus', value: 'focus' },
      { label: 'contextmenu', value: 'contextmenu' },
    ],
    '如何触发 Tooltip',
  ),
  selectInput(
    '出现位置',
    'placement',
    [
      { label: 'top', value: 'top' },
      { label: 'top-start', value: 'top-start' },
      { label: 'top-end', value: 'top-end' },
      { label: 'bottom', value: 'bottom' },
      { label: 'bottom-start', value: 'bottom-start' },
      { label: 'bottom-end', value: 'bottom-end' },
      { label: 'left', value: 'left' },
      { label: 'left-start', value: 'left-start' },
      { label: 'left-end', value: 'left-end' },
      { label: 'right', value: 'right' },
      { label: 'right-start', value: 'right-start' },
      { label: 'right-end', value: 'right-end' },
    ],
    'Tooltip 组件出现的位置',
  ),
  selectInput(
    '主题',
    'effect',
    [
      { label: 'dark', value: 'dark' },
      { label: 'light', value: 'light' },
    ],
    'Tooltip 主题',
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

/** 日历 */
export const calendarConfig = createConfig([
  textInput('绑定值', 'modelValue', '当前选中日期，推荐 YYYY-MM-DD'),
  textInput('默认值', 'default-value', '默认选中日期（部分驱动支持）'),
  textInput('值格式', 'value-format', '绑定值格式，如 YYYY-MM-DD（部分驱动支持）'),
  selectInput(
    '模式',
    'mode',
    [
      { label: '月', value: 'month' },
      { label: '年', value: 'year' },
    ],
    '面板模式（部分驱动支持）',
  ),
  boolSwitch('全屏', 'fullscreen', '是否全屏显示日历（部分驱动支持，默认 true）'),
  boolSwitch('显示周数', 'show-week', '是否在全屏日历中显示周数（部分驱动支持）'),
  selectInput(
    '尺寸',
    'size',
    [
      { label: '大', value: 'large' },
      { label: '默认', value: 'default' },
      { label: '小', value: 'small' },
    ],
    '组件尺寸（部分驱动支持）',
  ),
  selectInput(
    '头部控制器',
    'controller-type',
    [
      { label: '按钮', value: 'button' },
      { label: '下拉选择', value: 'select' },
    ],
    '头部年月切换控件类型（Element Plus）',
  ),
  textInput('范围起', 'range-start', '显示范围起始日 YYYY-MM-DD（需配合范围止，且分别为周一/周日）'),
  textInput('范围止', 'range-end', '显示范围结束日 YYYY-MM-DD（与范围起组成 range）'),
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

/** 时间（Naive UI NTime） */
export const timeConfig = createConfig([
  textInput('时间戳', 'time', '要展示的时间（毫秒时间戳；开启 unix 时为秒）', '如 1710000000000'),
  selectInput(
    '类型',
    'type',
    [
      { label: '日期时间', value: 'datetime' },
      { label: '日期', value: 'date' },
      { label: '相对时间', value: 'relative' },
    ],
    '时间展示类型',
  ),
  textInput('格式化', 'format', '自定义格式化字符串（date-fns format），设置后优先于 type'),
  boolSwitch('Unix 时间戳', 'unix', 'time / to 是否按 unix 秒级时间戳解析'),
  boolSwitch('纯文本', 'text', '是否以纯文本形式渲染'),
  textInput('目标时间', 'to', '相对时间对比的目标时间戳', '如 1710000000000'),
  textInput('时区', 'time-zone', '格式化使用的 IANA 时区，如 Asia/Shanghai'),
])

/** 文本省略（Naive UI NEllipsis） */
export const ellipsisConfig = createConfig([
  textInput('文本内容', 'content', '省略展示的文本内容'),
  numberInput('最大行数', 'line-clamp', '超出行数后省略；不填则单行省略'),
  selectInput(
    '展开方式',
    'expand-trigger',
    [
      { label: '不展开', value: '' },
      { label: '点击展开', value: 'click' },
    ],
    '设置点击后切换展开/收起；留空则仅省略展示',
  ),
  boolSwitch('悬浮提示', 'tooltip', '省略时是否通过 Tooltip 展示完整内容'),
])

/** Iconify 图标 */
export const iconifyConfig = createConfig([
  textInput('图标', 'icon', 'Iconify 图标名，如 carbon:application', 'carbon:application'),
  textInput('前缀', 'prefix', '图标集合前缀；icon 已含前缀时可不填', '如 carbon'),
  numberInput('尺寸', 'size', '图标尺寸（px）'),
  textInput('颜色', 'color', '图标颜色，如 #409eff / currentColor'),
  boolSwitch('旋转动画', 'infinite', '是否持续旋转'),
  boolSwitch('悬浮手型', 'hoverPointer', '悬浮时是否显示手型光标'),
  textInput('悬浮颜色', 'hoverColor', '悬浮时的图标颜色'),
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
  {
    eleType: 'PropTableHeight',
    name: '高度',
    describe:
      '默认不固定高度；选择「适应主区域高度」时跟随布局容器主区域 WatchBox；固定高度可输入像素值',
    modelKey: 'height',
  },
  textInput('最大高度', 'max-height', 'Table 的最大高度'),
  sizeSelect('Table 尺寸'),
  boolSwitch('空数据时显示', 'empty-text', '空数据时显示的文本（占位）'),
])

/** 走马灯 */
export const carouselConfig = createConfig([
  textInput('高度', 'height', '走马灯高度', '如 200px'),
  numberInput('初始索引', 'initial-index', '初始状态激活的幻灯片索引，从 0 开始'),
  selectInput(
    '指示器触发',
    'trigger',
    [
      { label: 'hover', value: 'hover' },
      { label: 'click', value: 'click' },
    ],
    '指示器的触发方式',
  ),
  boolSwitch('自动切换', 'autoplay', '是否自动切换'),
  numberInput('切换间隔', 'interval', '自动切换的时间间隔（毫秒）'),
  selectInput(
    '指示器位置',
    'indicator-position',
    [
      { label: '默认', value: '' },
      { label: '外部', value: 'outside' },
      { label: '不显示', value: 'none' },
    ],
    '指示器的位置',
  ),
  selectInput(
    '切换箭头',
    'arrow',
    [
      { label: '总是显示', value: 'always' },
      { label: '悬停显示', value: 'hover' },
      { label: '不显示', value: 'never' },
    ],
    '切换箭头的显示时机',
  ),
  selectInput(
    '类型',
    'type',
    [
      { label: '默认', value: '' },
      { label: '卡片', value: 'card' },
    ],
    '走马灯类型',
  ),
  boolSwitch('循环显示', 'loop', '是否循环显示'),
  selectInput(
    '展示方向',
    'direction',
    [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ],
    '展示方向',
  ),
  boolSwitch('悬停暂停', 'pause-on-hover', '鼠标悬浮时暂停自动切换'),
])

/** 走马灯项 */
export const carouselItemConfig = createConfig([
  textInput('标识', 'name', '幻灯片对应的 name，可用作 setActiveItem 参数'),
  textInput('标签', 'label', '幻灯片文本说明（用于指示器）'),
])

/** 高级搜索栏 SearchBar：字段由 props.search 配置，拖入后带示例条件 */
export const searchBarConfig = createConfig([])
