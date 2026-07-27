import type { ReportChartType } from '../chartTypes'
import {
  advancedOptionFields,
  cartesianAxisFields,
  commonVisualFields,
  visualMapFields,
} from './commonFields'
import {
  boolSwitch,
  colorInput,
  numberInput,
  sectionTitle,
  selectInput,
  textInput,
  type ChartPropConfigItem,
} from './propHelpers'

const withCommon = (...groups: ChartPropConfigItem[][]): ChartPropConfigItem[] => [
  ...commonVisualFields(),
  ...groups.flat(),
  ...advancedOptionFields(),
]

const cartesianFields = (): ChartPropConfigItem[] =>
  withCommon(cartesianAxisFields(), [
    sectionTitle('双 Y 轴'),
    boolSwitch('显示右轴', 'yAxisRight.show'),
    textInput('右轴名称', 'yAxisRight.name'),
    selectInput('右轴类型', 'yAxisRight.type', [
      { label: '数值', value: 'value' },
      { label: '类目', value: 'category' },
    ]),
    boolSwitch('右轴脱离 0 值', 'yAxisRight.scale'),
    sectionTitle('系列'),
    {
      eleType: 'ChartSeriesListEditor',
      name: '系列列表',
      describe: '可添加多个系列，每个系列可选折线 / 柱状 / 散点 / K线',
      modelKey: 'seriesList',
    },
  ])

const boxplotFields = (): ChartPropConfigItem[] =>
  withCommon(cartesianAxisFields(), [
    sectionTitle('盒须系列'),
    textInput('盒宽', 'seriesStyle.boxWidth', '可为数组，如 [7,50]'),
  ])

const heatmapFields = (): ChartPropConfigItem[] =>
  withCommon(cartesianAxisFields(), visualMapFields(), [
    sectionTitle('热力系列'),
    textInput('系列说明', 'seriesStyle.name', '仅作标识，数据后续接入'),
  ])

const radarFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('雷达坐标系'),
    selectInput('形状', 'radar.shape', [
      { label: '多边形', value: 'polygon' },
      { label: '圆形', value: 'circle' },
    ]),
    numberInput('分割段数', 'radar.splitNumber'),
    textInput('半径', 'radar.radius', '如 65% 或 120'),
    numberInput('起始角度', 'radar.startAngle'),
    {
      eleType: 'ChartRadarIndicatorListEditor',
      name: '指示器 indicator',
      describe: '对应 ECharts radar.indicator，可逐项配置名称与最大值',
      modelKey: 'radar.indicator',
    },
    sectionTitle('指示器名称样式'),
    boolSwitch('显示指示器名', 'radar.axisName.show'),
    selectInput('名称格式', 'radar.axisName.nameFormat', [
      { label: '原样', value: 'none' },
      { label: '自定义', value: 'custom' },
    ]),
    textInput(
      '自定义格式',
      'radar.axisName.formatter',
      '名称格式=自定义时生效，可用 {value}',
      '【{value}】',
    ),
    colorInput('名称颜色', 'radar.axisName.color'),
    colorInput('名称背景', 'radar.axisName.backgroundColor'),
    numberInput('名称圆角', 'radar.axisName.borderRadius'),
    textInput(
      '名称内边距',
      'radar.axisName.padding',
      '如 3 或 3,5；留空则不设置',
    ),
    sectionTitle('分割区 / 圆环'),
    boolSwitch('显示分割区', 'radar.splitArea.show'),
    {
      eleType: 'ChartColorListEditor',
      name: '分割区填充色',
      describe: '同心环面填充色，由外到内；可添加、删除并拖拽排序',
      modelKey: 'radar.splitAreaColors',
    },
    colorInput('分割区阴影色', 'radar.splitArea.areaStyle.shadowColor'),
    numberInput('分割区阴影模糊', 'radar.splitArea.areaStyle.shadowBlur'),
    boolSwitch('显示圆环轮廓', 'radar.splitLine.show'),
    {
      eleType: 'ChartColorListEditor',
      name: '圆环轮廓线',
      describe: '同心圆/多边形描边色，由外到内；可添加、删除并拖拽排序',
      modelKey: 'radar.splitLineColors',
    },
    colorInput('轴线颜色', 'radar.axisLine.lineStyle.color'),
    sectionTitle('雷达系列'),
    {
      eleType: 'ChartRadarSeriesListEditor',
      name: '系列列表',
      describe: '可配置面积填充、虚线、标记、数值标签；径向渐变用起止色',
      modelKey: 'radarSeriesList',
    },
  ])

const mapFields = (): ChartPropConfigItem[] =>
  withCommon(visualMapFields(), [
    sectionTitle('地图'),
    textInput('地图名称', 'seriesStyle.map', '内置 china，也可填已 registerMap 的名称'),
    boolSwitch('开启漫游', 'seriesStyle.roam'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    textInput('Geo 地图名', 'geo.map'),
    boolSwitch('Geo 漫游', 'geo.roam'),
  ])

const graphFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('关系图'),
    selectInput('布局', 'seriesStyle.layout', [
      { label: '力引导', value: 'force' },
      { label: '环形', value: 'circular' },
      { label: '无（使用 x/y）', value: 'none' },
    ]),
    boolSwitch('开启漫游', 'seriesStyle.roam'),
    boolSwitch('可拖拽节点', 'seriesStyle.draggable'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    numberInput('斥力', 'seriesStyle.force.repulsion'),
    numberInput('边长', 'seriesStyle.force.edgeLength'),
    numberInput('边弯曲度', 'seriesStyle.lineStyle.curveness'),
  ])

const treeFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('树图'),
    selectInput('布局', 'seriesStyle.layout', [
      { label: '正交', value: 'orthogonal' },
      { label: '径向', value: 'radial' },
    ]),
    selectInput('方向', 'seriesStyle.orient', [
      { label: '从左到右', value: 'LR' },
      { label: '从右到左', value: 'RL' },
      { label: '从上到下', value: 'TB' },
      { label: '从下到上', value: 'BT' },
    ]),
    boolSwitch('开启漫游', 'seriesStyle.roam'),
    numberInput('标记大小', 'seriesStyle.symbolSize'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    boolSwitch('展开收起', 'seriesStyle.expandAndCollapse'),
    numberInput('初始展开深度', 'seriesStyle.initialTreeDepth'),
  ])

const treemapFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('矩形树图'),
    boolSwitch('开启漫游', 'seriesStyle.roam'),
    selectInput('节点点击', 'seriesStyle.nodeClick', [
      { label: '缩放到节点', value: 'zoomToNode' },
      { label: '链接跳转', value: 'link' },
      { label: '关闭', value: false },
    ]),
    boolSwitch('显示面包屑', 'seriesStyle.breadcrumb.show'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
  ])

const sunburstFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('旭日图'),
    textInput('半径', 'seriesStyle.radius', '如 ["15%","80%"]'),
    textInput('中心', 'seriesStyle.center', '如 ["50%","50%"]'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
  ])

const parallelFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('平行坐标'),
    selectInput('默认轴类型', 'parallelAxisDefault.type', [
      { label: '数值', value: 'value' },
      { label: '类目', value: 'category' },
    ]),
    numberInput('线宽', 'seriesStyle.lineStyle.width'),
    numberInput('透明度', 'seriesStyle.lineStyle.opacity'),
    boolSwitch('平滑', 'seriesStyle.smooth'),
  ])

const sankeyFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('桑基图'),
    selectInput('方向', 'seriesStyle.orient', [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ]),
    selectInput('节点对齐', 'seriesStyle.nodeAlign', [
      { label: '两端对齐', value: 'justify' },
      { label: '左', value: 'left' },
      { label: '右', value: 'right' },
    ]),
    numberInput('布局迭代次数', 'seriesStyle.layoutIterations'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    numberInput('边弯曲度', 'seriesStyle.lineStyle.curveness'),
    numberInput('边透明度', 'seriesStyle.lineStyle.opacity'),
  ])

const funnelFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('漏斗图'),
    selectInput('排序', 'seriesStyle.sort', [
      { label: '降序', value: 'descending' },
      { label: '升序', value: 'ascending' },
      { label: '无', value: 'none' },
    ]),
    numberInput('间距', 'seriesStyle.gap'),
    textInput('最小尺寸', 'seriesStyle.minSize'),
    textInput('最大尺寸', 'seriesStyle.maxSize'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    selectInput('标签位置', 'seriesStyle.label.position', [
      { label: '内部', value: 'inside' },
      { label: '左侧', value: 'left' },
      { label: '右侧', value: 'right' },
    ]),
  ])

const gaugeFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('仪表盘'),
    numberInput('最小值', 'seriesStyle.min'),
    numberInput('最大值', 'seriesStyle.max'),
    numberInput('分割段数', 'seriesStyle.splitNumber'),
    numberInput('起始角度', 'seriesStyle.startAngle'),
    numberInput('结束角度', 'seriesStyle.endAngle'),
    boolSwitch('显示进度条', 'seriesStyle.progress.show'),
    boolSwitch('显示详情值', 'seriesStyle.detail.show'),
    numberInput('详情字号', 'seriesStyle.detail.fontSize'),
    boolSwitch('显示刻度标签', 'seriesStyle.axisLabel.show'),
  ])

const themeRiverFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('主题河流'),
    textInput('系列说明', 'seriesStyle.name'),
  ])

const calendarFields = (): ChartPropConfigItem[] =>
  withCommon(visualMapFields(), [
    sectionTitle('日历坐标'),
    selectInput('方向', 'calendar.orient', [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ]),
    textInput('水平位置', 'calendar.left'),
    textInput('垂直位置', 'calendar.top'),
    numberInput('单元格大小', 'calendar.cellSize'),
    boolSwitch('显示年标签', 'calendar.yearLabel.show'),
    boolSwitch('显示月标签', 'calendar.monthLabel.show'),
    boolSwitch('显示日标签', 'calendar.dayLabel.show'),
  ])

const matrixFields = (): ChartPropConfigItem[] =>
  withCommon(cartesianAxisFields(), visualMapFields(), [
    sectionTitle('矩阵'),
    textInput('系列说明', 'seriesStyle.name'),
  ])

const chordFields = (): ChartPropConfigItem[] =>
  withCommon([
    sectionTitle('和弦图（graph 环形）'),
    boolSwitch('标签旋转', 'seriesStyle.circular.rotateLabel'),
    boolSwitch('显示标签', 'seriesStyle.label.show'),
    numberInput('边弯曲度', 'seriesStyle.lineStyle.curveness'),
    numberInput('边透明度', 'seriesStyle.lineStyle.opacity'),
  ])

/** chartType → 配置字段列表 */
export const chartOptionFieldsMap: Record<ReportChartType, () => ChartPropConfigItem[]> = {
  cartesian: cartesianFields,
  map: mapFields,
  radar: radarFields,
  boxplot: boxplotFields,
  heatmap: heatmapFields,
  graph: graphFields,
  tree: treeFields,
  treemap: treemapFields,
  sunburst: sunburstFields,
  parallel: parallelFields,
  sankey: sankeyFields,
  funnel: funnelFields,
  gauge: gaugeFields,
  themeRiver: themeRiverFields,
  calendar: calendarFields,
  matrix: matrixFields,
  chord: chordFields,
}

export function getChartOptionFields(chartType: ReportChartType): ChartPropConfigItem[] {
  return (chartOptionFieldsMap[chartType] || cartesianFields)()
}
