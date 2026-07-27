import {
  boolSwitch,
  colorInput,
  codeEditorInput,
  numberInput,
  sectionTitle,
  selectInput,
  textInput,
  type ChartPropConfigItem,
} from './propHelpers'

const leftOptions = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
]

const topOptions = [
  { label: '上', value: 'top' },
  { label: '中', value: 'middle' },
  { label: '下', value: 'bottom' },
]

/** 各图共用：标题 / 图例 / 提示框 / 工具箱 / 动画 */
export const commonVisualFields = (): ChartPropConfigItem[] => [
  sectionTitle('标题'),
  boolSwitch('显示标题', 'title.show'),
  textInput('主标题', 'title.text'),
  textInput('副标题', 'title.subtext'),
  selectInput('水平位置', 'title.left', leftOptions),
  textInput('垂直位置', 'title.top', '支持 top/middle/bottom 或像素、百分比'),
  colorInput('标题颜色', 'title.textStyle.color'),
  numberInput('标题字号', 'title.textStyle.fontSize'),

  sectionTitle('图例'),
  boolSwitch('显示图例', 'legend.show'),
  selectInput('图例类型', 'legend.type', [
    { label: '普通', value: 'plain' },
    { label: '滚动', value: 'scroll' },
  ]),
  selectInput('图例方向', 'legend.orient', [
    { label: '水平', value: 'horizontal' },
    { label: '垂直', value: 'vertical' },
  ]),
  selectInput('图例水平位置', 'legend.left', leftOptions),
  selectInput('图例垂直位置', 'legend.top', topOptions),

  sectionTitle('提示框'),
  boolSwitch('显示提示框', 'tooltip.show'),
  selectInput('触发方式', 'tooltip.trigger', [
    { label: '坐标轴', value: 'axis' },
    { label: '数据项', value: 'item' },
    { label: '不触发', value: 'none' },
  ]),
  boolSwitch('限制在图表内', 'tooltip.confine'),

  sectionTitle('工具箱'),
  boolSwitch('显示工具箱', 'toolbox.show'),
  boolSwitch('保存为图片', 'toolbox.feature.saveAsImage'),
  boolSwitch('数据视图', 'toolbox.feature.dataView'),
  boolSwitch('还原', 'toolbox.feature.restore'),
  boolSwitch('区域缩放', 'toolbox.feature.dataZoom'),
  boolSwitch('动态类型切换', 'toolbox.feature.magicType'),

  sectionTitle('动画'),
  boolSwitch('开启动画', 'animation'),
  numberInput('动画时长(ms)', 'animationDuration'),
]

/** 高级配置（应置于面板最底部） */
export const advancedOptionFields = (): ChartPropConfigItem[] => [
  sectionTitle('高级'),
  codeEditorInput(
    'Option JSON',
    'advancedOptionJson',
    '完整 ECharts option（JSON）。有值时会与上方配置深度合并，可用于覆盖任意项。',
    'json',
  ),
]

export const cartesianAxisFields = (): ChartPropConfigItem[] => [
  sectionTitle('坐标系 · 网格'),
  boolSwitch('显示网格', 'grid.show'),
  boolSwitch('包含刻度标签', 'grid.containLabel'),
  textInput('左边距', 'grid.left', '建议用像素，如 4；百分比在双轴下容易过大'),
  textInput('右边距', 'grid.right', '建议用像素，如 4'),
  textInput('上边距', 'grid.top'),
  textInput('下边距', 'grid.bottom'),

  sectionTitle('X 轴'),
  boolSwitch('显示 X 轴', 'xAxis.show'),
  selectInput('X 轴类型', 'xAxis.type', [
    { label: '类目', value: 'category' },
    { label: '数值', value: 'value' },
    { label: '时间', value: 'time' },
    { label: '对数', value: 'log' },
  ]),
  textInput('X 轴名称', 'xAxis.name'),
  boolSwitch('两端留白', 'xAxis.boundaryGap'),

  sectionTitle('Y 轴'),
  boolSwitch('显示 Y 轴', 'yAxis.show'),
  selectInput('Y 轴类型', 'yAxis.type', [
    { label: '数值', value: 'value' },
    { label: '类目', value: 'category' },
    { label: '时间', value: 'time' },
    { label: '对数', value: 'log' },
  ]),
  textInput('Y 轴名称', 'yAxis.name'),
  boolSwitch('脱离 0 值比例', 'yAxis.scale'),
]

export const visualMapFields = (): ChartPropConfigItem[] => [
  sectionTitle('视觉映射'),
  boolSwitch('显示 visualMap', 'visualMap.show'),
  boolSwitch('可拖拽', 'visualMap.calculable'),
  selectInput('方向', 'visualMap.orient', [
    { label: '垂直', value: 'vertical' },
    { label: '水平', value: 'horizontal' },
  ]),
  numberInput('最小值', 'visualMap.min'),
  numberInput('最大值', 'visualMap.max'),
]
