import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
/**
 * 直接引用无 Vue 的纯 TS 文件，避免 vite-plugin-mock(esbuild) 解析组件入口失败。
 */
import { DEMO_SCHEMA_BUNDLES } from '../../DesignRock/rock-data-prep/src/packages/GrowDataPrepDesigner/static/demoSchema'
import {
  mergeSchemaBundlesToRowsMap,
  queryDatasetLocal,
} from '../../DesignRock/rock-data-prep/src/packages/GrowDataPrepDesigner/utils/queryDataset'
import type {
  DataPrepDataset,
  DatasetQueryRequest,
} from '../../DesignRock/rock-data-prep/src/packages/GrowDataPrepDesigner/types'

/** 会话级 Dataset 存储（与前端 localStorage 互补） */
const datasetStore = new Map<string, DataPrepDataset>()

function resolveSchemaIds(dataset: DataPrepDataset): string[] {
  const fromRefs = (dataset.schemaRefs || [])
    .map((item) => item.schemaId)
    .filter(Boolean)
  if (fromRefs.length) return [...new Set(fromRefs)]
  if (dataset.schemaRef?.schemaId) return [dataset.schemaRef.schemaId]
  return [...new Set((dataset.sources || []).map((s) => s.schemaId).filter(Boolean))]
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/data-prep/schemas'),
    method: 'get',
    timeout: 120,
    response: () =>
      resultSuccess(
        DEMO_SCHEMA_BUNDLES.map(({ id, schema }) => ({
          id,
          schema,
        })),
      ),
  },
  {
    url: mockUrl('/data-prep/schema-bundle'),
    method: 'get',
    timeout: 120,
    response: ({ query }) => {
      const id = String(query?.id || '')
      const bundle =
        DEMO_SCHEMA_BUNDLES.find((item) => item.id === id) || DEMO_SCHEMA_BUNDLES[0]
      if (!bundle) return resultError('Schema 不存在')
      return resultSuccess(bundle)
    },
  },
  {
    url: mockUrl('/data-prep/datasets'),
    method: 'get',
    timeout: 80,
    response: () => resultSuccess(Array.from(datasetStore.values())),
  },
  {
    url: mockUrl('/data-prep/datasets'),
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      const dataset = body as DataPrepDataset
      if (!dataset?.id) return resultError('数据集无效')
      const saved: DataPrepDataset = {
        ...dataset,
        updatedAt: new Date().toISOString(),
      }
      datasetStore.set(saved.id, saved)
      return resultSuccess(saved)
    },
  },
  {
    url: mockUrl('/data-prep/dataset'),
    method: 'delete',
    timeout: 80,
    response: ({ query }) => {
      const id = String(query?.id || '')
      if (id) datasetStore.delete(id)
      return resultSuccess({ id })
    },
  },
  {
    url: mockUrl('/data-prep/query'),
    method: 'post',
    timeout: 150,
    response: ({ body }) => {
      const request = body as DatasetQueryRequest
      const dataset =
        request.dataset ||
        (request.datasetId ? datasetStore.get(request.datasetId) : undefined)
      if (!dataset) return resultError('数据集不存在，请传入 dataset 或先保存')

      const schemaIds = resolveSchemaIds(dataset)
      const bundles = DEMO_SCHEMA_BUNDLES.filter((item) => schemaIds.includes(item.id))
      if (!bundles.length) return resultError('关联 Schema 不存在')

      try {
        const tableRows = mergeSchemaBundlesToRowsMap(bundles)
        const result = queryDatasetLocal(dataset, tableRows, {
          configIds: request.configIds,
          limit: request.limit,
        })
        return resultSuccess(result)
      } catch (error) {
        return resultError(error instanceof Error ? error.message : '查询失败')
      }
    },
  },
]

export default mocks
