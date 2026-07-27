import type { ReportChartType } from '../chartTypes'
import type { ReportChartConfig } from './types'

const commonBase = (): ReportChartConfig => ({
  title: {
    show: true,
    text: '',
    subtext: '',
    left: 'center',
    top: 8,
    textStyle: {
      color: '#333',
      fontSize: 14,
    },
  },
  legend: {
    show: true,
    type: 'plain',
    orient: 'horizontal',
    left: 'center',
    top: 'bottom',
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    confine: true,
  },
  toolbox: {
    show: false,
    feature: {
      saveAsImage: true,
      dataView: false,
      restore: false,
      dataZoom: false,
      magicType: false,
    },
  },
  animation: true,
  animationDuration: 1000,
  backgroundColor: 'transparent',
  advancedOptionJson: '',
})

const cartesianBase = (): ReportChartConfig => ({
  ...commonBase(),
  grid: {
    show: false,
    containLabel: true,
    left: 4,
    right: 4,
    top: 40,
    bottom: 40,
  },
  xAxis: {
    show: true,
    type: 'category',
    name: '',
    boundaryGap: true,
  },
  yAxis: {
    show: true,
    type: 'value',
    name: '',
    scale: false,
  },
})

/** 按图表类型生成默认视觉配置 */
export function createDefaultChartConfig(chartType: ReportChartType): ReportChartConfig {
  switch (chartType) {
    case 'cartesian':
      return {
        ...cartesianBase(),
        tooltip: {
          show: true,
          trigger: 'axis',
          confine: true,
        },
        legend: {
          show: true,
          type: 'scroll',
          orient: 'horizontal',
          left: 'center',
          top: 'bottom',
        },
        yAxis: {
          show: true,
          type: 'value',
          name: '',
          scale: false,
        },
        yAxisRight: {
          show: false,
          type: 'value',
          name: '',
          scale: false,
        },
        seriesList: [
          {
            name: '系列1',
            type: 'bar',
            yAxisIndex: 0,
            barWidth: '',
          },
        ],
      }
    case 'boxplot':
      return {
        ...cartesianBase(),
        seriesStyle: {
          type: 'boxplot',
          boxWidth: [7, 50],
        },
      }
    case 'heatmap':
      return {
        ...cartesianBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        visualMap: {
          show: true,
          calculable: true,
          orient: 'vertical',
          left: 'right',
          min: 0,
          max: 10,
        },
        seriesStyle: {
          type: 'heatmap',
        },
      }
    case 'radar':
      return {
        ...commonBase(),
        color: ['#67F9D8', '#FFE434', '#56A3F1', '#FF917C'],
        tooltip: { show: true, trigger: 'item', confine: true },
        radar: {
          shape: 'circle',
          splitNumber: 4,
          radius: '65%',
          center: ['50%', '50%'],
          startAngle: 90,
          indicator: [
            { name: '销售', max: 100 },
            { name: '管理', max: 100 },
            { name: '信息技术', max: 100 },
            { name: '客服', max: 100 },
            { name: '研发', max: 100 },
          ],
          /** 分割区填充色，由外到内 */
          splitAreaColors: ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4'],
          /** 圆环轮廓线颜色，由外到内 */
          splitLineColors: [
            'rgba(211, 253, 250, 0.8)',
            'rgba(211, 253, 250, 0.8)',
            'rgba(211, 253, 250, 0.8)',
            'rgba(211, 253, 250, 0.8)',
          ],
          axisName: {
            show: true,
            /** none | custom；custom 时用 axisName.formatter */
            nameFormat: 'none',
            formatter: '',
            color: '#428BD4',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: '',
          },
          splitArea: {
            show: true,
            areaStyle: {
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10,
            },
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(211, 253, 250, 0.8)',
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
            },
          },
        },
        radarSeriesList: [
          {
            name: '预算',
            areaFill: 'solid',
            areaColor: 'rgba(103, 249, 216, 0.45)',
            gradientFrom: 'rgba(103, 249, 216, 0.1)',
            gradientTo: 'rgba(103, 249, 216, 0.85)',
            lineType: 'solid',
            symbol: 'circle',
            symbolSize: 6,
            showLabel: false,
          },
          {
            name: '实际',
            areaFill: 'solid',
            areaColor: 'rgba(255, 228, 52, 0.55)',
            gradientFrom: 'rgba(255, 145, 124, 0.1)',
            gradientTo: 'rgba(255, 145, 124, 0.9)',
            lineType: 'solid',
            symbol: 'circle',
            symbolSize: 6,
            showLabel: false,
          },
        ],
        seriesStyle: {
          type: 'radar',
        },
      }
    case 'map':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        geo: {
          show: false,
          map: 'china',
          roam: true,
          label: { show: false },
        },
        visualMap: {
          show: true,
          calculable: true,
          min: 0,
          max: 100,
        },
        seriesStyle: {
          type: 'map',
          map: 'china',
          roam: true,
          label: { show: false },
          itemStyle: {
            areaColor: '#cfe8ff',
            borderColor: '#5b8ff9',
            borderWidth: 1,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#9ec9ff',
            },
          },
        },
      }
    case 'graph':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          label: { show: true },
          force: { repulsion: 100, edgeLength: 50 },
          lineStyle: { curveness: 0.2 },
        },
      }
    case 'tree':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'tree',
          layout: 'orthogonal',
          orient: 'LR',
          roam: false,
          symbolSize: 10,
          label: { show: true },
          expandAndCollapse: true,
          initialTreeDepth: 2,
        },
      }
    case 'treemap':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'treemap',
          roam: false,
          nodeClick: 'zoomToNode',
          breadcrumb: { show: true },
          label: { show: true },
        },
      }
    case 'sunburst':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'sunburst',
          radius: ['15%', '80%'],
          center: ['50%', '50%'],
          label: { show: true },
        },
      }
    case 'parallel':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        parallelAxisDefault: {
          type: 'value',
          nameLocation: 'end',
        },
        seriesStyle: {
          type: 'parallel',
          lineStyle: { width: 1, opacity: 0.5 },
          smooth: false,
        },
      }
    case 'sankey':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'sankey',
          orient: 'horizontal',
          nodeAlign: 'justify',
          layoutIterations: 32,
          label: { show: true },
          lineStyle: { curveness: 0.5, opacity: 0.4 },
        },
      }
    case 'funnel':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'funnel',
          sort: 'descending',
          gap: 2,
          minSize: '0%',
          maxSize: '100%',
          label: { show: true, position: 'inside' },
        },
      }
    case 'gauge':
      return {
        ...commonBase(),
        legend: { show: false, type: 'plain', orient: 'horizontal', left: 'center', top: 'bottom' },
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'gauge',
          min: 0,
          max: 100,
          splitNumber: 10,
          startAngle: 225,
          endAngle: -45,
          progress: { show: true },
          detail: { show: true, fontSize: 20 },
          axisLabel: { show: true },
        },
      }
    case 'themeRiver':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'axis', confine: true },
        seriesStyle: {
          type: 'themeRiver',
        },
      }
    case 'calendar':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        calendar: {
          orient: 'horizontal',
          left: 'center',
          top: 48,
          cellSize: 16,
          yearLabel: { show: true },
          monthLabel: { show: true },
          dayLabel: { show: true },
        },
        visualMap: {
          show: true,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 8,
          min: 0,
          max: 10,
        },
        seriesStyle: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
        },
      }
    case 'matrix':
      return {
        ...cartesianBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'heatmap',
        },
        visualMap: {
          show: true,
          calculable: true,
          min: 0,
          max: 10,
        },
      }
    case 'chord':
      return {
        ...commonBase(),
        tooltip: { show: true, trigger: 'item', confine: true },
        seriesStyle: {
          type: 'graph',
          layout: 'circular',
          circular: { rotateLabel: true },
          roam: false,
          label: { show: true },
          lineStyle: { curveness: 0.3, opacity: 0.4 },
        },
      }
    default:
      return {
        ...cartesianBase(),
        seriesStyle: { type: chartType },
      }
  }
}
