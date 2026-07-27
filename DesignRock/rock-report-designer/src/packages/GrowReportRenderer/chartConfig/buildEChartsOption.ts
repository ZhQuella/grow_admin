import type { EChartsOption } from 'echarts'
import { _merge, cloneDeep } from '@grow-admin-rock/utils'
import { echarts } from '@grow-admin-rock/hooks'
import type { ReportChartType } from '../chartTypes'
import { createDefaultChartConfig } from './defaults'
import { DEFAULT_REPORT_MAP_NAME, ensureReportMapsRegistered } from './registerMaps'
import type { ReportChartConfig } from './types'

ensureReportMapsRegistered()

const TOOLBOX_FEATURE_I18N: Record<string, Record<string, any>> = {
  saveAsImage: {
    title: '保存为图片',
  },
  dataView: {
    title: '数据视图',
    lang: ['数据视图', '关闭', '刷新'],
  },
  restore: {
    title: '还原',
  },
  dataZoom: {
    title: {
      zoom: '区域缩放',
      back: '区域缩放还原',
    },
  },
  magicType: {
    type: ['line', 'bar', 'stack', 'tiled'],
    title: {
      line: '切换为折线图',
      bar: '切换为柱状图',
      stack: '切换为堆叠',
      tiled: '切换为平铺',
    },
  },
}

function toToolboxFeature(feature?: Record<string, boolean | undefined>) {
  if (!feature) return undefined
  const out: Record<string, any> = {}
  Object.entries(feature).forEach(([key, enabled]) => {
    if (!enabled) return
    out[key] = {
      ...(TOOLBOX_FEATURE_I18N[key] || {}),
    }
  })
  return Object.keys(out).length ? out : undefined
}

function normalizeSeriesStyle(style: Record<string, any> = {}) {
  const next = cloneDeep(style)
  if (next.areaStyle === true) next.areaStyle = {}
  if (next.areaStyle === false) delete next.areaStyle
  if (next.step === false) delete next.step
  if (next.step === true) next.step = 'start'
  if (next.stack === '') delete next.stack
  if (next.barWidth === '') delete next.barWidth
  if (typeof next.boxWidth === 'string') {
    try {
      next.boxWidth = JSON.parse(next.boxWidth)
    } catch {
      /* keep string */
    }
  }
  if (typeof next.radius === 'string') {
    try {
      next.radius = JSON.parse(next.radius)
    } catch {
      /* keep string */
    }
  }
  if (typeof next.center === 'string') {
    try {
      next.center = JSON.parse(next.center)
    } catch {
      /* keep string */
    }
  }
  return next
}

function resolveCartesianSeriesType(type: unknown) {
  if (type === 'scatter' || type === 'bar' || type === 'candlestick') return type
  return 'line'
}

/** 仅构建系列结构，不含演示数据（真实数据源后续接入） */
function buildSeries(chartType: ReportChartType, seriesStyle: Record<string, any>) {
  const style = normalizeSeriesStyle(seriesStyle)

  switch (chartType) {
    case 'cartesian': {
      const list = Array.isArray(seriesStyle.__seriesList)
        ? seriesStyle.__seriesList
        : [{ name: '系列1', type: 'bar', yAxisIndex: 0 }]
      return list.map((item: Record<string, any>, index: number) => {
        const itemStyle = normalizeSeriesStyle({ ...item })
        delete itemStyle.__seriesList
        const type = resolveCartesianSeriesType(itemStyle.type)
        return {
          ...itemStyle,
          name: itemStyle.name || `系列${index + 1}`,
          type,
          yAxisIndex: Number(itemStyle.yAxisIndex) === 1 ? 1 : 0,
          data: [],
        }
      })
    }
    case 'boxplot':
      return [{ name: '盒须', ...style, type: 'boxplot', data: [] }]
    case 'heatmap':
    case 'matrix':
      return [{ name: '热力', ...style, type: 'heatmap', data: [], label: { show: true } }]
    case 'radar':
      return [{ type: 'radar', ...style, data: [] }]
    case 'graph':
    case 'chord':
      return [{ name: '关系', ...style, type: 'graph', data: [], links: [] }]
    case 'tree':
      return [{ ...style, type: 'tree', data: [] }]
    case 'treemap':
      return [{ ...style, type: 'treemap', data: [] }]
    case 'sunburst':
      return [{ ...style, type: 'sunburst', data: [] }]
    case 'parallel':
      return [{ ...style, type: 'parallel', data: [] }]
    case 'sankey':
      return [{ ...style, type: 'sankey', data: [], links: [] }]
    case 'funnel':
      return [{ name: '漏斗', ...style, type: 'funnel', data: [] }]
    case 'gauge':
      return [{ ...style, type: 'gauge', data: [] }]
    case 'themeRiver':
      return [{ ...style, type: 'themeRiver', data: [] }]
    case 'calendar':
      return [{ ...style, type: 'heatmap', coordinateSystem: 'calendar', data: [] }]
    case 'map':
      return [{ ...style, type: 'map', data: [] }]
    default:
      return [{ name: '系列', ...style, type: chartType, data: [] }]
  }
}

function buildCartesianAxes(config: ReportChartConfig, chartType: ReportChartType) {
  const leftAxis = {
    ...config.yAxis,
    data: config.yAxis?.type === 'category' ? [] : undefined,
  }

  if (chartType === 'cartesian') {
    const right = config.yAxisRight || { show: true, type: 'value', name: '' }
    const useDualAxis =
      right.show !== false &&
      (config.seriesList || []).some((item) => Number(item.yAxisIndex) === 1)
    return {
      xAxis: {
        ...config.xAxis,
        type: 'category',
        data: [],
        axisPointer: { type: 'shadow' },
      },
      yAxis: useDualAxis
        ? [
            {
              ...leftAxis,
              name: config.yAxis?.name || '',
            },
            {
              show: true,
              type: right.type || 'value',
              name: right.name || '',
              scale: right.scale,
            },
          ]
        : leftAxis,
    }
  }

  return {
    xAxis: {
      ...config.xAxis,
      data: config.xAxis?.type !== 'value' ? [] : undefined,
    },
    yAxis: leftAxis,
  }
}

/** 深度合并配置；数组（如 seriesList）以用户配置整表覆盖，避免 lodash merge 按索引残留旧项 */
function mergeChartConfig(
  chartType: ReportChartType,
  chartConfig?: ReportChartConfig | null,
): ReportChartConfig {
  const defaults = createDefaultChartConfig(chartType)
  if (!chartConfig) return defaults

  const merged = _merge({}, defaults, chartConfig) as ReportChartConfig
  if (Object.prototype.hasOwnProperty.call(chartConfig, 'seriesList')) {
    merged.seriesList = Array.isArray(chartConfig.seriesList)
      ? cloneDeep(chartConfig.seriesList)
      : []
  }
  if (Object.prototype.hasOwnProperty.call(chartConfig, 'radarSeriesList')) {
    merged.radarSeriesList = Array.isArray(chartConfig.radarSeriesList)
      ? cloneDeep(chartConfig.radarSeriesList)
      : []
  }
  if (chartConfig.radar && Object.prototype.hasOwnProperty.call(chartConfig.radar, 'indicator')) {
    merged.radar = {
      ...(merged.radar || {}),
      indicator: Array.isArray(chartConfig.radar.indicator)
        ? cloneDeep(chartConfig.radar.indicator)
        : [],
    }
  }
  if (
    chartConfig.radar &&
    Object.prototype.hasOwnProperty.call(chartConfig.radar, 'splitAreaColors')
  ) {
    merged.radar = {
      ...(merged.radar || {}),
      splitAreaColors: Array.isArray(chartConfig.radar.splitAreaColors)
        ? cloneDeep(chartConfig.radar.splitAreaColors)
        : chartConfig.radar.splitAreaColors,
    }
  }
  if (
    chartConfig.radar &&
    Object.prototype.hasOwnProperty.call(chartConfig.radar, 'splitLineColors')
  ) {
    merged.radar = {
      ...(merged.radar || {}),
      splitLineColors: Array.isArray(chartConfig.radar.splitLineColors)
        ? cloneDeep(chartConfig.radar.splitLineColors)
        : chartConfig.radar.splitLineColors,
    }
  }
  return merged
}

/** 标题叠在 grid 之上，按主/副标题预留 top，避免挡住绘图区 */
function resolveCartesianGrid(config: ReportChartConfig): EChartsOption['grid'] {
  const rawGrid = config.grid || {}
  const looseGap =
    (typeof rawGrid.left === 'string' && String(rawGrid.left).includes('%')) ||
    (typeof rawGrid.right === 'string' && String(rawGrid.right).includes('%'))

  const title = config.title
  const titleVisible = title?.show !== false
  const hasText = titleVisible && !!String(title?.text || '').trim()
  const hasSub = titleVisible && !!String(title?.subtext || '').trim()

  let minTop = 8
  if (hasText && hasSub) minTop = 72
  else if (hasText || hasSub) minTop = 48

  const legendAtBottom =
    config.legend?.show !== false &&
    (config.legend?.top === 'bottom' || config.legend?.top == null)
  const minBottom = legendAtBottom ? 40 : 12

  const configuredTop =
    typeof rawGrid.top === 'number'
      ? rawGrid.top
      : Number.parseFloat(String(rawGrid.top ?? '')) || minTop
  const configuredBottom =
    typeof rawGrid.bottom === 'number'
      ? rawGrid.bottom
      : Number.parseFloat(String(rawGrid.bottom ?? '')) || minBottom

  return {
    ...rawGrid,
    containLabel: rawGrid.containLabel !== false,
    left: looseGap ? 4 : rawGrid.left ?? 4,
    right: looseGap ? 4 : rawGrid.right ?? 4,
    top: Math.max(configuredTop, minTop),
    bottom: Math.max(configuredBottom, minBottom),
  }
}

function splitCsvColors(raw?: string | string[]) {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item || '').trim()).filter(Boolean)
  }
  return String(raw || '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parsePadding(raw?: string | number | number[]) {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'number') return raw
  const text = String(raw ?? '').trim()
  if (!text) return undefined
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text)
  const parts = text
    .split(/[,，\s]+/)
    .map((item) => Number(item))
    .filter((n) => !Number.isNaN(n))
  return parts.length ? parts : undefined
}

function buildRadarAxisName(axisName: Record<string, any> = {}) {
  const show = axisName.show !== false
  const nameFormat = axisName.nameFormat || 'none'
  let formatter = axisName.formatter
  if (nameFormat === 'none') formatter = undefined
  else if (nameFormat === 'custom' || nameFormat === 'bracket') {
    // bracket 为旧配置兼容：等价于自定义 【{value}】
    formatter =
      nameFormat === 'bracket' ? '【{value}】' : formatter || '{value}'
  }

  const padding = parsePadding(axisName.padding)
  const backgroundColor =
    axisName.backgroundColor === 'transparent' ? undefined : axisName.backgroundColor

  return {
    show,
    formatter,
    color: axisName.color,
    backgroundColor,
    borderRadius: axisName.borderRadius || undefined,
    padding,
  }
}

function resolveRadarIndicators(config: ReportChartConfig) {
  const raw = config.radar?.indicator
  if (Array.isArray(raw) && raw.length) {
    return raw.map((item: any, index: number) => ({
      name: String(item?.name || item?.text || `指标${index + 1}`),
      max: Number(item?.max) > 0 ? Number(item.max) : 100,
    }))
  }

  // 兼容旧配置：indicatorNames + indicatorMax
  const names = splitCsvColors(config.radar?.indicatorNames || '销售,管理,信息技术,客服,研发')
  const max = Number(config.radar?.indicatorMax) > 0 ? Number(config.radar?.indicatorMax) : 100
  return names.map((name) => ({ name, max }))
}

/** 雷达无 grid，按标题/图例下移中心并收敛半径，避免挡住绘图区 */
function resolveRadarLayout(config: ReportChartConfig) {
  const title = config.title
  const titleVisible = title?.show !== false
  const hasText = titleVisible && !!String(title?.text || '').trim()
  const hasSub = titleVisible && !!String(title?.subtext || '').trim()

  const legendAtBottom =
    config.legend?.show !== false &&
    (config.legend?.top === 'bottom' || config.legend?.top == null)

  let centerY = 50
  let radiusPercent = 65
  if (hasText && hasSub) {
    centerY = 58
    radiusPercent = 52
  } else if (hasText || hasSub) {
    centerY = 55
    radiusPercent = 56
  }
  if (legendAtBottom) {
    // 底部图例再略压半径，避免与下方图例重叠
    radiusPercent = Math.max(42, radiusPercent - 6)
    if (!hasText && !hasSub) centerY = 46
  }

  const configuredCenter = config.radar?.center
  const configuredRadius = config.radar?.radius

  let center: [string | number, string | number] = [`50%`, `${centerY}%`]
  if (Array.isArray(configuredCenter) && configuredCenter.length >= 2) {
    // 用户显式配置了 center 时仍尊重 X，Y 取「配置值」与「标题预留」的更靠下者（百分比）
    const cx = configuredCenter[0]
    const cy = configuredCenter[1]
    if (typeof cy === 'string' && cy.endsWith('%')) {
      const cyNum = Number.parseFloat(cy)
      center = [cx, `${Math.max(cyNum || centerY, centerY)}%`]
    } else if (typeof cy === 'number') {
      center = [cx, Math.max(cy, centerY)]
    } else {
      center = [cx, cy]
    }
  }

  let radius: string | number | [string | number, string | number] = `${radiusPercent}%`
  if (configuredRadius != null && configuredRadius !== '') {
    if (typeof configuredRadius === 'string' && configuredRadius.endsWith('%')) {
      const r = Number.parseFloat(configuredRadius)
      radius = `${Math.min(Number.isNaN(r) ? radiusPercent : r, radiusPercent)}%`
    } else {
      radius = configuredRadius
    }
  }

  return { center, radius }
}

function buildRadarOption(config: ReportChartConfig): EChartsOption['radar'] {
  const raw = config.radar || {}
  const indicators = resolveRadarIndicators(config)
  const splitAreaColors = splitCsvColors(raw.splitAreaColors)
  const splitLineColors = splitCsvColors(
    raw.splitLineColors ?? raw.splitLine?.lineStyle?.color,
  )
  const layout = resolveRadarLayout(config)

  const {
    indicator: _indicator,
    indicatorNames: _n,
    indicatorMax: _m,
    splitAreaColors: _areaColors,
    splitLineColors: _lineColors,
    axisName: rawAxisName,
    splitArea: rawSplitArea,
    splitLine: rawSplitLine,
    center: _center,
    radius: _radius,
    ...rest
  } = raw

  return {
    shape: 'circle',
    splitNumber: 4,
    startAngle: 90,
    ...rest,
    center: layout.center,
    radius: layout.radius,
    indicator: indicators,
    axisName: buildRadarAxisName(rawAxisName || {}),
    splitArea: {
      show: rawSplitArea?.show !== false,
      areaStyle: {
        ...(rawSplitArea?.areaStyle || {}),
        ...(splitAreaColors.length ? { color: splitAreaColors } : {}),
      },
    },
    splitLine: {
      show: rawSplitLine?.show !== false,
      lineStyle: {
        width: 1,
        ...(rawSplitLine?.lineStyle || {}),
        ...(splitLineColors.length
          ? {
              color:
                splitLineColors.length === 1 ? splitLineColors[0] : splitLineColors,
            }
          : {}),
      },
    },
  }
}

function buildRadarAreaStyle(item: NonNullable<ReportChartConfig['radarSeriesList']>[number]) {
  if (item.areaFill === 'solid') {
    return { color: item.areaColor || 'rgba(103, 249, 216, 0.45)' }
  }
  if (item.areaFill === 'radial') {
    return {
      color: {
        type: 'radial',
        x: 0.1,
        y: 0.6,
        r: 1,
        colorStops: [
          { offset: 0, color: item.gradientFrom || 'rgba(255, 145, 124, 0.1)' },
          { offset: 1, color: item.gradientTo || 'rgba(255, 145, 124, 0.9)' },
        ],
      },
    }
  }
  return undefined
}

function buildRadarSeries(config: ReportChartConfig) {
  const list =
    config.radarSeriesList?.length
      ? config.radarSeriesList
      : [
          {
            name: '预算',
            areaFill: 'solid' as const,
            areaColor: 'rgba(103, 249, 216, 0.45)',
            lineType: 'solid' as const,
            symbol: 'circle',
            symbolSize: 6,
            showLabel: false,
          },
          {
            name: '实际',
            areaFill: 'solid' as const,
            areaColor: 'rgba(255, 228, 52, 0.55)',
            lineType: 'solid' as const,
            symbol: 'circle',
            symbolSize: 6,
            showLabel: false,
          },
        ]

  const data = list.map((item, index) => {
    const areaStyle = buildRadarAreaStyle(item)
    return {
      name: item.name || `系列${index + 1}`,
      value: [] as number[],
      symbol: item.symbol || 'circle',
      symbolSize: item.symbolSize ?? 6,
      lineStyle: {
        type: item.lineType === 'dashed' ? 'dashed' : 'solid',
      },
      ...(areaStyle ? { areaStyle } : {}),
      ...(item.showLabel
        ? {
            label: {
              show: true,
              formatter: (params: any) => params.value,
            },
          }
        : {}),
    }
  })

  return [
    {
      type: 'radar',
      emphasis: {
        lineStyle: { width: 4 },
      },
      data,
    },
  ]
}

/** 将报表视觉配置编译为 ECharts option（系列/轴不含演示数据，待数据源接入） */
export function buildEChartsOption(
  chartType: ReportChartType,
  chartConfig?: ReportChartConfig | null,
): EChartsOption {
  const config = mergeChartConfig(chartType, chartConfig)

  const toolboxFeature = toToolboxFeature(config.toolbox?.feature)
  const base: EChartsOption = {
    ...(config.color?.length ? { color: config.color } : {}),
    backgroundColor: config.backgroundColor,
    animation: config.animation,
    animationDuration: config.animationDuration,
    title: config.title as EChartsOption['title'],
    legend: config.legend as EChartsOption['legend'],
    tooltip:
      chartType === 'cartesian'
        ? ({
            ...(config.tooltip || {}),
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: { color: '#999' },
            },
          } as EChartsOption['tooltip'])
        : (config.tooltip as EChartsOption['tooltip']),
    toolbox: config.toolbox?.show
      ? {
          show: true,
          feature: toolboxFeature,
        }
      : { show: false },
  }

  let option: EChartsOption = { ...base }

  const cartesianTypes: ReportChartType[] = [
    'cartesian',
    'boxplot',
    'heatmap',
    'matrix',
  ]

  if (cartesianTypes.includes(chartType)) {
    const seriesPayload =
      chartType === 'cartesian'
        ? { __seriesList: config.seriesList ?? [] }
        : config.seriesStyle || { type: chartType }

    option = {
      ...option,
      grid: resolveCartesianGrid(config),
      ...buildCartesianAxes(config, chartType),
      visualMap: config.visualMap as EChartsOption['visualMap'],
      series: buildSeries(chartType, seriesPayload),
    }
  } else if (chartType === 'radar') {
    option = {
      ...option,
      radar: buildRadarOption(config),
      series: buildRadarSeries(config),
    }
  } else if (chartType === 'parallel') {
    option = {
      ...option,
      parallelAxis: [
        { dim: 0, name: 'A' },
        { dim: 1, name: 'B' },
        { dim: 2, name: 'C' },
        { dim: 3, name: 'D' },
      ],
      parallel: { left: '8%', right: '12%', bottom: 40, top: 40 },
      parallelAxisDefault: config.parallelAxisDefault,
      series: buildSeries(chartType, config.seriesStyle || { type: 'parallel' }),
    }
  } else if (chartType === 'themeRiver') {
    option = {
      ...option,
      singleAxis: {
        type: 'time',
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      },
      series: buildSeries(chartType, config.seriesStyle || { type: 'themeRiver' }),
    }
  } else if (chartType === 'calendar') {
    option = {
      ...option,
      calendar: {
        range: '2024-01',
        ...(config.calendar || {}),
      },
      visualMap: config.visualMap as EChartsOption['visualMap'],
      series: buildSeries(chartType, config.seriesStyle || { type: 'heatmap' }),
    }
  } else if (chartType === 'map') {
    ensureReportMapsRegistered()
    const mapName =
      String(config.seriesStyle?.map || config.geo?.map || '').trim() ||
      DEFAULT_REPORT_MAP_NAME
    const mapReady = !!echarts.getMap(mapName)

    if (mapReady) {
      const series = buildSeries(chartType, {
        ...(config.seriesStyle || { type: 'map' }),
        map: mapName,
      })
      const geoShow = config.geo?.show === true
      option = {
        ...option,
        geo: geoShow
          ? ({
              ...config.geo,
              map: config.geo?.map || mapName,
            } as EChartsOption['geo'])
          : undefined,
        visualMap: config.visualMap as EChartsOption['visualMap'],
        series,
      }
    } else {
      option = {
        ...option,
        geo: undefined,
        visualMap: undefined,
        series: [],
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: `地图「${mapName}」未注册\n请先 echarts.registerMap`,
              fill: '#999',
              fontSize: 13,
              textAlign: 'center',
            },
          },
        ],
      }
    }
  } else {
    option = {
      ...option,
      series: buildSeries(chartType, config.seriesStyle || { type: chartType }),
    }
  }

  const advanced = (config.advancedOptionJson || '').trim()
  if (advanced) {
    try {
      const parsed = JSON.parse(advanced)
      option = _merge({}, option, parsed) as EChartsOption
    } catch {
      /* ignore invalid json */
    }
  }

  return option
}
