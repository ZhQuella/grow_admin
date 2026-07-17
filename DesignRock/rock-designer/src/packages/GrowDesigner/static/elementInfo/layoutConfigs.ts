import {
  boolSwitch,
  createConfig,
  numberInput,
  selectInput,
  textInput,
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
  textInput('展示内容', 'context', '展示在标签中的文字内容'),
])

/** 图片 img */
export const imageConfig = createConfig([
  textInput('图片地址', 'src', '图片的路径，用于指定图片的来源地址', '请输入 URL'),
  textInput('替代文本', 'alt', '图片无法加载时显示的文字，提高可访问性', '请输入 alt'),
])

/** 正文 p */
export const paragraphConfig = createConfig([
  textInput('展示内容', 'context', '段落文本内容'),
])

/** 短语 span */
export const spanConfig = createConfig([
  textInput('展示内容', 'context', '行内文本内容'),
])

/** 容器 div */
export const divConfig = createConfig([
  textInput('类名', 'class', '自定义 class'),
  textInput('ID', 'id', '元素 id'),
])

/** 卡片 */
export const cardConfig = createConfig([
  textInput('标题', 'header', '卡片头部标题'),
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
])

/** 选项卡 */
export const tabsConfig = createConfig([
  textInput('绑定值', 'modelValue', '当前激活的 tab name'),
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
  boolSwitch('拉伸', 'stretch', '标签是否自动撑开'),
])

/** 选项 */
export const tabPaneConfig = createConfig([
  textInput('标题', 'label', '选项卡标题'),
  textInput('标识', 'name', '与选项卡绑定值对应标识'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('可关闭', 'closable', '标签是否可关闭'),
])

/** 弹性盒子 Row */
export const rowConfig = createConfig([
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
])

/** 布局 Col */
export const colConfig = createConfig([
  numberInput('栅格占据列数', 'span', '栅格占据的列数', '请输入 1-24'),
  numberInput('栅格左侧间隔', 'offset', '栅格左侧的间隔格数'),
  numberInput('栅格向右移动', 'push', '栅格向右移动格数'),
  numberInput('栅格向左移动', 'pull', '栅格向左移动格数'),
])

/** 折叠面板 */
export const collapseConfig = createConfig([
  boolSwitch('手风琴', 'accordion', '是否手风琴模式'),
  textInput('展开项', 'modelValue', '当前展开的面板 name'),
])

/** 折叠项 */
export const collapseItemConfig = createConfig([
  textInput('标题', 'title', '面板标题'),
  textInput('标识', 'name', '唯一标识符'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
])
