import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { OrgChartQuery, OrgChartResult } from '../types/systemOrgChart'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemOrgChart(params: OrgChartQuery) {
  return useRequest().post<OrgChartResult>({
    url: '/system/org-chart',
    data: params,
  })
}
