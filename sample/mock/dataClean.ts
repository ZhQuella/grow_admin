import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
/**
 * 直接引用无 Vue 的纯 TS 文件，避免 vite-plugin-mock(esbuild) 解析组件入口失败。
 */
import {
  ALL_DEMO_CLEAN_TABLES,
  buildCleanTableRowsMap,
  findDemoTable,
} from '../../DesignRock/rock-data-clean/src/packages/GrowDataCleanDesigner/static/demoTables'
import { runCleanFlowLocal } from '../../DesignRock/rock-data-clean/src/packages/GrowDataCleanDesigner/utils/runCleanFlow'
import type { CleanFlow } from '../../DesignRock/rock-data-clean/src/packages/GrowDataCleanDesigner/types'

const mocks: MockMethod[] = [
  {
    url: mockUrl('/data-clean/tables'),
    method: 'get',
    timeout: 80,
    response: () => resultSuccess(ALL_DEMO_CLEAN_TABLES),
  },
  {
    url: mockUrl('/data-clean/table-rows'),
    method: 'get',
    timeout: 80,
    response: ({ query }) => {
      const id = String(query?.id || '')
      const table = findDemoTable(id)
      if (!table) return resultError('数据表不存在')
      return resultSuccess(table.rows)
    },
  },
  {
    url: mockUrl('/data-clean/preview'),
    method: 'post',
    timeout: 150,
    response: ({ body }) => {
      const payload = body as {
        flow?: CleanFlow
        targetNodeId?: string
        toOutput?: boolean
        limit?: number
      }
      if (!payload?.flow) return resultError('请传入清洗流 flow')
      try {
        const result = runCleanFlowLocal(payload.flow, {
          targetNodeId: payload.targetNodeId,
          toOutput: payload.toOutput,
          limit: payload.limit ?? 50,
          tableRows: buildCleanTableRowsMap(),
        })
        if (result.error) return resultError(result.error)
        return resultSuccess(result)
      } catch (error) {
        return resultError(error instanceof Error ? error.message : '预览失败')
      }
    },
  },
]

export default mocks
