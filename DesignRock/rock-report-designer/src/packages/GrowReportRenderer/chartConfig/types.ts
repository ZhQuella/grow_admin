/** 报表图表视觉配置（对齐 ECharts option 结构，不含数据） */

export type ReportChartConfig = {
  title?: {
    show?: boolean
    text?: string
    subtext?: string
    left?: string | number
    top?: string | number
    textStyle?: {
      color?: string
      fontSize?: number
    }
  }
  legend?: {
    show?: boolean
    type?: 'plain' | 'scroll'
    orient?: 'horizontal' | 'vertical'
    left?: string | number
    top?: string | number
  }
  tooltip?: {
    show?: boolean
    trigger?: 'item' | 'axis' | 'none'
    confine?: boolean
  }
  /** 全局调色盘 */
  color?: string[]
  toolbox?: {
    show?: boolean
    feature?: {
      saveAsImage?: boolean
      dataView?: boolean
      restore?: boolean
      dataZoom?: boolean
      magicType?: boolean
    }
  }
  grid?: {
    show?: boolean
    containLabel?: boolean
    left?: string | number
    right?: string | number
    top?: string | number
    bottom?: string | number
  }
  xAxis?: {
    show?: boolean
    type?: string
    name?: string
    boundaryGap?: boolean | [string, string]
  }
  yAxis?: {
    show?: boolean
    type?: string
    name?: string
    scale?: boolean
  }
  /** 双 Y 轴时的右侧轴（折柱混合等） */
  yAxisRight?: {
    show?: boolean
    type?: string
    name?: string
    scale?: boolean
  }
  /** 系列视觉样式（渲染时合并进 series，不含 data） */
  seriesStyle?: Record<string, any>
  /**
   * 多系列配置（直角坐标系）
   * type: line | bar | scatter | candlestick；yAxisIndex: 0 左轴 / 1 右轴
   */
  seriesList?: Array<{
    name?: string
    type?: 'line' | 'bar' | 'scatter' | 'candlestick'
    yAxisIndex?: number
    smooth?: boolean
    showSymbol?: boolean
    areaStyle?: boolean
    stack?: string
    barWidth?: string | number
    barMaxWidth?: number
    symbol?: string
    symbolSize?: number
  }>
  /**
   * 雷达系列（对应 series.data 多项）
   * areaFill: none | solid | radial（径向渐变用起止色简化配置）
   */
  radarSeriesList?: Array<{
    name?: string
    color?: string
    areaFill?: 'none' | 'solid' | 'radial'
    areaColor?: string
    gradientFrom?: string
    gradientTo?: string
    lineType?: 'solid' | 'dashed'
    symbol?: string
    symbolSize?: number
    showLabel?: boolean
  }>
  radar?: Record<string, any>
  visualMap?: Record<string, any>
  parallelAxisDefault?: Record<string, any>
  calendar?: Record<string, any>
  geo?: Record<string, any>
  animation?: boolean
  animationDuration?: number
  backgroundColor?: string
  /**
   * 高级：完整 ECharts option JSON（字符串）。
   * 有值时在基础配置之上深度合并。
   */
  advancedOptionJson?: string
}
