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

export const labelPositionOptions = [
  { label: 'top', value: 'top' },
  { label: 'left', value: 'left' },
  { label: 'right', value: 'right' },
  { label: 'bottom', value: 'bottom' },
  { label: 'inside', value: 'inside' },
  { label: 'insideTop', value: 'insideTop' },
  { label: 'insideBottom', value: 'insideBottom' },
  { label: 'insideLeft', value: 'insideLeft' },
  { label: 'insideRight', value: 'insideRight' },
  { label: 'outside', value: 'outside' },
]

export const lineTypeOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]

export const symbolOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '圆角矩形', value: 'roundRect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '图钉', value: 'pin' },
  { label: '箭头', value: 'arrow' },
  { label: '无', value: 'none' },
]

export const emphasisFocusOptions = [
  { label: 'none', value: 'none' },
  { label: 'self', value: 'self' },
  { label: 'series', value: 'series' },
]

/** 标签通用字段 */
export const seriesLabelFields = (
  prefix = 'seriesStyle.label',
  title = '标签 label',
): ChartPropConfigItem[] => [
  sectionTitle(title),
  boolSwitch('显示标签', `${prefix}.show`),
  selectInput('位置', `${prefix}.position`, labelPositionOptions),
  numberInput('距离', `${prefix}.distance`),
  numberInput('旋转角', `${prefix}.rotate`),
  colorInput('颜色', `${prefix}.color`),
  numberInput('字号', `${prefix}.fontSize`),
  textInput('字重', `${prefix}.fontWeight`, '如 normal / bold / 400'),
  textInput('formatter', `${prefix}.formatter`, '如 {b}: {c}'),
]

/** itemStyle 通用 */
export const seriesItemStyleFields = (
  prefix = 'seriesStyle.itemStyle',
  title = '图形样式 itemStyle',
): ChartPropConfigItem[] => [
  sectionTitle(title),
  colorInput('颜色', `${prefix}.color`),
  colorInput('描边色', `${prefix}.borderColor`),
  numberInput('描边宽', `${prefix}.borderWidth`),
  selectInput('描边类型', `${prefix}.borderType`, lineTypeOptions),
  textInput('圆角', `${prefix}.borderRadius`, '如 4 或 4,4,0,0'),
  numberInput('透明度', `${prefix}.opacity`),
  numberInput('阴影模糊', `${prefix}.shadowBlur`),
  colorInput('阴影色', `${prefix}.shadowColor`),
  numberInput('阴影偏移 X', `${prefix}.shadowOffsetX`),
  numberInput('阴影偏移 Y', `${prefix}.shadowOffsetY`),
]

/** lineStyle 通用 */
export const seriesLineStyleFields = (
  prefix = 'seriesStyle.lineStyle',
  title = '线样式 lineStyle',
): ChartPropConfigItem[] => [
  sectionTitle(title),
  colorInput('颜色', `${prefix}.color`),
  numberInput('线宽', `${prefix}.width`),
  selectInput('线型', `${prefix}.type`, lineTypeOptions),
  numberInput('透明度', `${prefix}.opacity`),
  numberInput('弯曲度', `${prefix}.curveness`),
  numberInput('阴影模糊', `${prefix}.shadowBlur`),
  colorInput('阴影色', `${prefix}.shadowColor`),
]

/** emphasis 简化 */
export const seriesEmphasisFields = (
  prefix = 'seriesStyle.emphasis',
): ChartPropConfigItem[] => [
  sectionTitle('高亮 emphasis'),
  boolSwitch('禁用高亮', `${prefix}.disabled`),
  selectInput('focus', `${prefix}.focus`, emphasisFocusOptions),
  boolSwitch('缩放', `${prefix}.scale`),
  colorInput('高亮填充', `${prefix}.itemStyle.color`),
  colorInput('高亮描边', `${prefix}.itemStyle.borderColor`),
  numberInput('高亮描边宽', `${prefix}.itemStyle.borderWidth`),
]

/** 系列通用层级 / 行为 */
export const seriesMetaFields = (prefix = 'seriesStyle'): ChartPropConfigItem[] => [
  sectionTitle('系列通用'),
  textInput('系列名称', `${prefix}.name`),
  numberInput('zlevel', `${prefix}.zlevel`),
  numberInput('z', `${prefix}.z`),
  boolSwitch('静默', `${prefix}.silent`),
  boolSwitch('图例联动', `${prefix}.legendHoverLink`),
  boolSwitch('裁剪', `${prefix}.clip`),
  textInput('光标', `${prefix}.cursor`, '如 pointer'),
  boolSwitch('系列动画', `${prefix}.animation`),
  numberInput('动画时长', `${prefix}.animationDuration`),
  textInput('动画缓动', `${prefix}.animationEasing`, '如 cubicOut'),
]

/** 各图共用：标题 / 图例 / 提示框 / 工具箱 / 动画 */
export const commonVisualFields = (): ChartPropConfigItem[] => [
  sectionTitle('画布'),
  colorInput('背景色', 'backgroundColor'),

  sectionTitle('标题'),
  boolSwitch('显示标题', 'title.show'),
  textInput('主标题', 'title.text'),
  textInput('副标题', 'title.subtext'),
  selectInput('水平位置', 'title.left', leftOptions),
  textInput('垂直位置', 'title.top', '支持 top/middle/bottom 或像素、百分比'),
  colorInput('标题颜色', 'title.textStyle.color'),
  numberInput('标题字号', 'title.textStyle.fontSize'),
  textInput('标题字重', 'title.textStyle.fontWeight'),
  colorInput('副标题颜色', 'title.subtextStyle.color'),
  numberInput('副标题字号', 'title.subtextStyle.fontSize'),
  numberInput('标题间距', 'title.itemGap'),
  colorInput('标题背景', 'title.backgroundColor'),
  textInput('标题内边距', 'title.padding', '如 5 或 5,10'),

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
  selectInput('对齐', 'legend.align', [
    { label: 'auto', value: 'auto' },
    { label: 'left', value: 'left' },
    { label: 'right', value: 'right' },
  ]),
  numberInput('图例项间距', 'legend.itemGap'),
  numberInput('图例标记宽', 'legend.itemWidth'),
  numberInput('图例标记高', 'legend.itemHeight'),
  colorInput('图例文字色', 'legend.textStyle.color'),
  numberInput('图例字号', 'legend.textStyle.fontSize'),
  boolSwitch('选中模式', 'legend.selectedMode'),
  colorInput('图例背景', 'legend.backgroundColor'),
  textInput('图例内边距', 'legend.padding', '如 5 或 5,10'),

  sectionTitle('提示框'),
  boolSwitch('显示提示框', 'tooltip.show'),
  selectInput('触发方式', 'tooltip.trigger', [
    { label: '坐标轴', value: 'axis' },
    { label: '数据项', value: 'item' },
    { label: '不触发', value: 'none' },
  ]),
  selectInput('触发条件', 'tooltip.triggerOn', [
    { label: 'mousemove', value: 'mousemove' },
    { label: 'click', value: 'click' },
    { label: 'mousemove|click', value: 'mousemove|click' },
    { label: 'none', value: 'none' },
  ]),
  boolSwitch('限制在图表内', 'tooltip.confine'),
  boolSwitch('显示内容', 'tooltip.showContent'),
  boolSwitch('始终显示', 'tooltip.alwaysShowContent'),
  textInput('背景色', 'tooltip.backgroundColor'),
  colorInput('边框色', 'tooltip.borderColor'),
  numberInput('边框宽', 'tooltip.borderWidth'),
  numberInput('内边距', 'tooltip.padding'),
  colorInput('文字色', 'tooltip.textStyle.color'),
  numberInput('文字字号', 'tooltip.textStyle.fontSize'),
  textInput('formatter', 'tooltip.formatter', '字符串模板或留空'),
  numberInput('显示延迟 ms', 'tooltip.showDelay'),
  numberInput('隐藏延迟 ms', 'tooltip.hideDelay'),

  sectionTitle('工具箱'),
  boolSwitch('显示工具箱', 'toolbox.show'),
  selectInput('工具箱方位', 'toolbox.orient', [
    { label: '水平', value: 'horizontal' },
    { label: '垂直', value: 'vertical' },
  ]),
  textInput('工具箱 left', 'toolbox.left'),
  textInput('工具箱 top', 'toolbox.top'),
  numberInput('图标尺寸', 'toolbox.itemSize'),
  numberInput('图标间距', 'toolbox.itemGap'),
  boolSwitch('保存为图片', 'toolbox.feature.saveAsImage'),
  boolSwitch('数据视图', 'toolbox.feature.dataView'),
  boolSwitch('还原', 'toolbox.feature.restore'),
  boolSwitch('区域缩放', 'toolbox.feature.dataZoom'),
  boolSwitch('动态类型切换', 'toolbox.feature.magicType'),

  sectionTitle('动画'),
  boolSwitch('开启动画', 'animation'),
  numberInput('阈值阈值', 'animationThreshold'),
  numberInput('动画时长(ms)', 'animationDuration'),
  textInput('动画缓动', 'animationEasing', '如 cubicOut'),
  numberInput('动画延迟', 'animationDelay'),
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
  textInput('宽度', 'grid.width'),
  textInput('高度', 'grid.height'),
  colorInput('网格背景', 'grid.backgroundColor'),
  colorInput('网格边框色', 'grid.borderColor'),
  numberInput('网格边框宽', 'grid.borderWidth'),
  numberInput('grid z', 'grid.z'),
  numberInput('grid zlevel', 'grid.zlevel'),

  sectionTitle('X 轴'),
  boolSwitch('显示 X 轴', 'xAxis.show'),
  selectInput('X 轴类型', 'xAxis.type', [
    { label: '类目', value: 'category' },
    { label: '数值', value: 'value' },
    { label: '时间', value: 'time' },
    { label: '对数', value: 'log' },
  ]),
  textInput('X 轴名称', 'xAxis.name'),
  selectInput('名称位置', 'xAxis.nameLocation', [
    { label: 'start', value: 'start' },
    { label: 'middle', value: 'middle' },
    { label: 'end', value: 'end' },
  ]),
  numberInput('名称间距', 'xAxis.nameGap'),
  numberInput('名称旋转', 'xAxis.nameRotate'),
  boolSwitch('两端留白', 'xAxis.boundaryGap'),
  boolSwitch('反向', 'xAxis.inverse'),
  selectInput('轴位置', 'xAxis.position', [
    { label: 'bottom', value: 'bottom' },
    { label: 'top', value: 'top' },
  ]),
  textInput('最小值', 'xAxis.min', '数值或 dataMin'),
  textInput('最大值', 'xAxis.max', '数值或 dataMax'),
  boolSwitch('脱离 0 值', 'xAxis.scale'),
  numberInput('分割段数', 'xAxis.splitNumber'),
  boolSwitch('显示刻度', 'xAxis.axisTick.show'),
  boolSwitch('显示刻度标签', 'xAxis.axisLabel.show'),
  numberInput('标签旋转', 'xAxis.axisLabel.rotate'),
  colorInput('标签颜色', 'xAxis.axisLabel.color'),
  numberInput('标签字号', 'xAxis.axisLabel.fontSize'),
  boolSwitch('显示轴线', 'xAxis.axisLine.show'),
  colorInput('轴线颜色', 'xAxis.axisLine.lineStyle.color'),
  boolSwitch('显示分割线', 'xAxis.splitLine.show'),
  colorInput('分割线色', 'xAxis.splitLine.lineStyle.color'),
  selectInput('分割线型', 'xAxis.splitLine.lineStyle.type', lineTypeOptions),

  sectionTitle('Y 轴'),
  boolSwitch('显示 Y 轴', 'yAxis.show'),
  selectInput('Y 轴类型', 'yAxis.type', [
    { label: '数值', value: 'value' },
    { label: '类目', value: 'category' },
    { label: '时间', value: 'time' },
    { label: '对数', value: 'log' },
  ]),
  textInput('Y 轴名称', 'yAxis.name'),
  selectInput('名称位置', 'yAxis.nameLocation', [
    { label: 'start', value: 'start' },
    { label: 'middle', value: 'middle' },
    { label: 'end', value: 'end' },
  ]),
  numberInput('名称间距', 'yAxis.nameGap'),
  boolSwitch('反向', 'yAxis.inverse'),
  textInput('最小值', 'yAxis.min', '数值或 dataMin'),
  textInput('最大值', 'yAxis.max', '数值或 dataMax'),
  boolSwitch('脱离 0 值比例', 'yAxis.scale'),
  numberInput('分割段数', 'yAxis.splitNumber'),
  boolSwitch('显示刻度', 'yAxis.axisTick.show'),
  boolSwitch('显示刻度标签', 'yAxis.axisLabel.show'),
  numberInput('标签旋转', 'yAxis.axisLabel.rotate'),
  colorInput('标签颜色', 'yAxis.axisLabel.color'),
  numberInput('标签字号', 'yAxis.axisLabel.fontSize'),
  boolSwitch('显示轴线', 'yAxis.axisLine.show'),
  colorInput('轴线颜色', 'yAxis.axisLine.lineStyle.color'),
  boolSwitch('显示分割线', 'yAxis.splitLine.show'),
  colorInput('分割线色', 'yAxis.splitLine.lineStyle.color'),
  selectInput('分割线型', 'yAxis.splitLine.lineStyle.type', lineTypeOptions),
]

export const visualMapFields = (): ChartPropConfigItem[] => [
  sectionTitle('视觉映射'),
  boolSwitch('显示 visualMap', 'visualMap.show'),
  selectInput('类型', 'visualMap.type', [
    { label: '连续 continuous', value: 'continuous' },
    { label: '分段 piecewise', value: 'piecewise' },
  ]),
  boolSwitch('可拖拽', 'visualMap.calculable'),
  boolSwitch('实时更新', 'visualMap.realtime'),
  boolSwitch('反转', 'visualMap.inverse'),
  selectInput('方向', 'visualMap.orient', [
    { label: '垂直', value: 'vertical' },
    { label: '水平', value: 'horizontal' },
  ]),
  textInput('left', 'visualMap.left'),
  textInput('right', 'visualMap.right'),
  textInput('top', 'visualMap.top'),
  textInput('bottom', 'visualMap.bottom'),
  numberInput('最小值', 'visualMap.min'),
  numberInput('最大值', 'visualMap.max'),
  textInput('范围', 'visualMap.range', '如 [0,100]，连续型'),
  textInput('宽度', 'visualMap.itemWidth'),
  textInput('高度', 'visualMap.itemHeight'),
  textInput('对齐', 'visualMap.align', 'auto / left / right / top / bottom'),
  colorInput('文字色', 'visualMap.textStyle.color'),
  numberInput('文字字号', 'visualMap.textStyle.fontSize'),
  textInput('两端文本', 'visualMap.text', '如 ["高","低"]'),
  numberInput('精度', 'visualMap.precision'),
  numberInput('分段数', 'visualMap.splitNumber'),
  boolSwitch('显示手柄', 'visualMap.hoverLink'),
  colorInput('控制器边框', 'visualMap.borderColor'),
  numberInput('边框宽', 'visualMap.borderWidth'),
  colorInput('背景色', 'visualMap.backgroundColor'),
  numberInput('z', 'visualMap.z'),
  numberInput('zlevel', 'visualMap.zlevel'),
]
