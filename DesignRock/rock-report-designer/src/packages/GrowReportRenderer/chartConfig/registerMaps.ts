import { china } from '@esmjs/geo'
import { echarts } from '@grow-admin-rock/hooks'

/** 报表设计器内置默认地图名（中国） */
export const DEFAULT_REPORT_MAP_NAME = 'china'

let registered = false

/** 注册内置地图 GeoJSON（幂等） */
export function ensureReportMapsRegistered() {
  if (registered) return
  if (!echarts.getMap(DEFAULT_REPORT_MAP_NAME)) {
    // @ts-expect-error echarts registerMap 接受 GeoJSON，与标准 FeatureCollection 类型不完全一致
    echarts.registerMap(DEFAULT_REPORT_MAP_NAME, { geoJSON: china })
  }
  registered = true
}
