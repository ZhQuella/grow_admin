import {
  boolSwitch,
  childColSpans,
  childPaneNames,
  createConfig,
  dimensionInput,
  functionBind,
  modelBind,
  numberInput,
  selectInput,
  textInput,
  variableBindInput,
} from './shared'

/** 标题 BasicTitle */
export const basicTitleConfig = createConfig([
  selectInput(
    '级别',
    'level',
    [
      { label: 'H1', value: 'h1' },
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'H4', value: 'h4' },
      { label: 'H5', value: 'h5' },
    ],
    '标题级别',
  ),
  variableBindInput('展示内容', 'context', '展示在标签中的文字内容，支持变量绑定'),
])

/** 图片 img */
export const imageConfig = createConfig([
  variableBindInput('图片地址', 'src', '图片的路径，用于指定图片的来源地址，支持变量绑定', '请输入 URL 或绑定变量'),
  variableBindInput('替代文本', 'alt', '图片无法加载时显示的文字，提高可访问性，支持变量绑定', '请输入 alt 或绑定变量'),
])

/** 正文 p */
export const paragraphConfig = createConfig([
  variableBindInput('展示内容', 'context', '段落文本内容，支持变量绑定'),
])

/** 短语 span */
export const spanConfig = createConfig([
  variableBindInput('展示内容', 'context', '行内文本内容，支持变量绑定'),
])

/** 容器 div */
export const divConfig = createConfig([
  textInput('类名', 'class', '自定义 class'),
  textInput('ID', 'id', '元素 id'),
])

/** 卡片 */
export const cardConfig = createConfig([
  variableBindInput('标题', 'header', '卡片头部标题，支持变量绑定'),
  variableBindInput('页脚文本', 'footer', '卡片页脚文本；启用页脚拖入区时以拖入内容为准', '请输入页脚文本或绑定变量'),
  selectInput(
    '阴影时机',
    'shadow',
    [
      { label: '总是', value: 'always' },
      { label: '悬停', value: 'hover' },
      { label: '从不', value: 'never' },
    ],
    '卡片阴影显示时机',
  ),
  textInput('主体样式', 'body-style', '卡片 body 的 CSS 样式，如 padding: 20px'),
  textInput('头部类名', 'header-class', '卡片 header 自定义 class'),
  textInput('主体类名', 'body-class', '卡片 body 自定义 class'),
  textInput('页脚类名', 'footer-class', '卡片 footer 自定义 class'),
  boolSwitch('启用页脚', 'showFooter', '开启后显示卡片页脚拖入区域'),
  boolSwitch('启用操作', 'showHeaderExtra', '开启后在标题右侧显示操作拖入区域'),
])

/** 选项卡 */
export const tabsConfig = createConfig([
  modelBind('选项卡激活值绑定路径，支持变量绑定（如 state.activeTab）'),
  variableBindInput(
    '默认激活',
    'modelValue',
    '当前激活的 tab name；未绑定 model 时作为激活值，支持变量绑定',
    '请输入默认激活或绑定变量',
  ),
  selectInput(
    '风格类型',
    'type',
    [
      { label: '默认', value: '' },
      { label: '卡片', value: 'card' },
      { label: '边框卡片', value: 'border-card' },
    ],
    '选项卡风格',
  ),
  selectInput(
    '选项卡位置',
    'tab-position',
    [
      { label: '上', value: 'top' },
      { label: '右', value: 'right' },
      { label: '下', value: 'bottom' },
      { label: '左', value: 'left' },
    ],
    '选项卡所在位置',
  ),
  boolSwitch('可关闭', 'closable', '标签是否可关闭'),
  boolSwitch('可增加', 'addable', '标签是否可增加'),
  boolSwitch('可编辑', 'editable', '标签是否同时可增加与关闭'),
  boolSwitch('拉伸', 'stretch', '标签的宽度是否自撑开'),
  numberInput('tabindex', 'tabindex', '选项卡的 tabindex'),
  functionBind(
    '切换前钩子',
    'before-leave',
    '切换标签之前的钩子；返回 false 或 rejected Promise 则阻止切换',
    {
      params: ['activeName', 'oldActiveName'],
      example: `// return true\nreturn true`,
    },
  ),
  childPaneNames(
    '选项名称',
    {
      childName: 'GrowTabPane',
      titleKey: 'label',
      nameKey: 'name',
      activeKey: 'modelValue',
      titlePrefix: '选项',
    },
    '增删选项卡子项，并设置标题与标识',
  ),
])

/** 选项 */
export const tabPaneConfig = createConfig([
  textInput('标题', 'label', '选项卡标题'),
  textInput('标识', 'name', '与选项卡绑定值对应标识'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('可关闭', 'closable', '标签是否可关闭'),
  boolSwitch('懒加载', 'lazy', '标签是否延迟渲染'),
])

/** 弹性盒子 Row */
export const rowConfig = createConfig([
  textInput('自定义元素', 'tag', '自定义元素标签，默认 div'),
  numberInput('栅格间隔', 'gutter', '栅格间隔'),
  selectInput(
    '水平排列',
    'justify',
    [
      { label: 'start', value: 'start' },
      { label: 'end', value: 'end' },
      { label: 'center', value: 'center' },
      { label: 'space-around', value: 'space-around' },
      { label: 'space-between', value: 'space-between' },
      { label: 'space-evenly', value: 'space-evenly' },
    ],
    'flex 布局下的水平排列方式',
  ),
  selectInput(
    '垂直排列',
    'align',
    [
      { label: 'top', value: 'top' },
      { label: 'middle', value: 'middle' },
      { label: 'bottom', value: 'bottom' },
    ],
    'flex 布局下的垂直排列方式',
  ),
  childColSpans(
    '列配置',
    { childName: 'GrowCol', defaultSpan: 12 },
    '增删列并设置 span / offset / push / pull',
  ),
])

/** 布局 Col */
export const colConfig = createConfig([
  textInput('自定义元素', 'tag', '自定义元素标签，默认 div'),
  numberInput('栅格占据列数', 'span', '栅格占据的列数', '请输入 1-24'),
  numberInput('栅格左侧间隔', 'offset', '栅格左侧的间隔格数'),
  numberInput('栅格向右移动', 'push', '栅格向右移动格数'),
  numberInput('栅格向左移动', 'pull', '栅格向左移动格数'),
  numberInput('xs', 'xs', '<768px 时占据的列数'),
  numberInput('sm', 'sm', '≥768px 时占据的列数'),
  numberInput('md', 'md', '≥992px 时占据的列数'),
  numberInput('lg', 'lg', '≥1200px 时占据的列数'),
  numberInput('xl', 'xl', '≥1920px 时占据的列数'),
])

/** 折叠面板 */
export const collapseConfig = createConfig([
  modelBind('当前展开的面板绑定路径；手风琴为单个 name，否则为 name 数组，支持变量绑定'),
  variableBindInput(
    '默认激活',
    'modelValue',
    '当前展开的面板 name；未绑定 model 时作为激活值；手风琴为单个 name，否则为 name 数组，支持变量绑定',
    '请输入默认激活或绑定变量',
  ),
  boolSwitch('手风琴', 'accordion', '是否手风琴模式'),
  selectInput(
    '展开图标位置',
    'expand-icon-position',
    [
      { label: '左', value: 'left' },
      { label: '右', value: 'right' },
    ],
    '折叠面板展开图标的位置',
  ),
  functionBind(
    '折叠前钩子',
    'before-collapse',
    '折叠状态改变前的钩子；返回 false 或 rejected Promise 则阻止切换',
    {
      params: ['activeNames', 'name'],
      example: `// return true\nreturn true`,
    },
  ),
  childPaneNames(
    '面板名称',
    {
      childName: 'GrowCollapseItem',
      titleKey: 'title',
      nameKey: 'name',
      activeKey: 'modelValue',
      titlePrefix: '面板',
    },
    '增删折叠面板子项，并设置标题与标识',
  ),
])

/** 折叠项 */
export const collapseItemConfig = createConfig([
  textInput('标题', 'title', '面板标题'),
  textInput('标识', 'name', '唯一标识符'),
  textInput('图标', 'icon', '自定义展开图标组件名'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
])

/** 滚动条容器 Scrollbar */
export const scrollbarConfig = createConfig([
  dimensionInput('高度', 'height', { placeholder: '200' }, '滚动区域高度，支持 px / % / vh'),
  dimensionInput('最大高度', 'max-height', { placeholder: '400' }, '滚动区域最大高度，支持 px / % / vh'),
  boolSwitch('始终显示', 'always', '是否始终显示滚动条'),
  boolSwitch('原生滚动条', 'native', '是否使用原生滚动条样式'),
  boolSwitch('不响应尺寸变化', 'noresize', '不响应容器尺寸变化，可优化性能'),
  numberInput('触发距离', 'distance', '触底/触边触发的距离（px）'),
  numberInput('最小尺寸', 'min-size', '滚动条最小尺寸（px）'),
  textInput('自定义元素', 'tag', '视图层元素标签，默认 div'),
  textInput('包裹类名', 'wrap-class', '包裹容器 class'),
  textInput('包裹样式', 'wrap-style', '包裹容器 style，如 overflow: auto'),
  textInput('视图类名', 'view-class', '视图容器 class'),
  textInput('视图样式', 'view-style', '视图容器 style'),
  textInput('ID', 'id', '视图容器 id'),
  textInput('role', 'role', '视图容器 role'),
  textInput('aria-label', 'aria-label', '无障碍标签'),
  selectInput(
    'aria-orientation',
    'aria-orientation',
    [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ],
    '无障碍方向',
  ),
  numberInput('tabindex', 'tabindex', '包裹容器 tabindex'),
])

/** 布局容器：通过 layout 选择常见页面结构 */
export const layoutConfig = createConfig([
  selectInput(
    '布局方式',
    'layout',
    [
      { label: '顶栏 + 主区域', value: 'header-main' },
      { label: '顶栏 + 主区域 + 底栏', value: 'header-main-footer' },
      { label: '侧边栏 + 主区域', value: 'aside-main' },
      { label: '顶栏 + 侧边栏 + 主区域', value: 'header-aside-main' },
      { label: '顶栏 + 侧边栏 + 主区域 + 底栏', value: 'header-aside-main-footer' },
      { label: '侧边栏 + 顶栏 + 主区域', value: 'aside-header-main' },
      { label: '侧边栏 + 顶栏 + 主区域 + 底栏', value: 'aside-header-main-footer' },
    ],
    '选择常见页面布局结构，切换后各区域内容会保留',
  ),
  textInput('顶栏高度', 'headerHeight', 'Header 高度，默认 40px'),
  textInput('侧边栏宽度', 'asideWidth', 'Aside 宽度，默认 200px'),
  textInput('底栏高度', 'footerHeight', 'Footer 高度，默认 60px'),
])
