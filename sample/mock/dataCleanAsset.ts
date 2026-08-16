import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import {
  resultError,
  resultPageSuccess,
  resultSuccess,
} from '@grow-admin-rock/mock/util'

type CleanFlow = Recordable<any>

type DataCleanAssetVersion = {
  version: string
  schema: CleanFlow
  publishedAt: string
  publishedBy?: string
  remark?: string
}

type DataCleanAsset = {
  id: string
  name: string
  code: string
  description: string
  enabled: boolean
  currentVersion: string | null
  publishedAt: string | null
  publishedBy: string | null
  updatedBy: string
  draftSchema: CleanFlow
  versions: DataCleanAssetVersion[]
  createdAt: string
  updatedAt: string
}

const MOCK_OPERATOR = 'Grow Admin'

function emptySchema(): CleanFlow {
  return {
    version: 1,
    id: `clean_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: '未命名清洗流',
    status: 'draft',
    nodes: [],
    edges: [],
  }
}

function nowIso() {
  return new Date().toISOString()
}

function nextId() {
  return `dca_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function toListItem(asset: DataCleanAsset) {
  const { draftSchema: _d, versions, ...rest } = asset
  return {
    ...rest,
    versionCount: versions.length,
  }
}

function parseVersionNo(version: string): number {
  const matched = /^v(\d+)$/i.exec(version)
  return matched ? Number(matched[1]) : 0
}

function nextVersionLabel(asset: DataCleanAsset): string {
  const max = asset.versions.reduce((acc, item) => Math.max(acc, parseVersionNo(item.version)), 0)
  return `v${max + 1}`
}

function cloneSchema(schema?: CleanFlow): CleanFlow {
  try {
    return JSON.parse(JSON.stringify(schema || emptySchema()))
  } catch {
    return emptySchema()
  }
}

const assetStore = new Map<string, DataCleanAsset>()

function seed() {
  if (assetStore.size) return
  const t1 = '2026-08-01T08:00:00.000Z'
  const t2 = '2026-08-10T10:30:00.000Z'
  const published: DataCleanAsset = {
    id: 'dca_demo_1',
    name: '示例清洗流',
    code: 'demo_clean_flow',
    description: '演示已发布数据清洗资产',
    enabled: true,
    currentVersion: 'v1',
    publishedAt: t2,
    publishedBy: MOCK_OPERATOR,
    updatedBy: MOCK_OPERATOR,
    draftSchema: emptySchema(),
    versions: [
      {
        version: 'v1',
        schema: emptySchema(),
        publishedAt: t2,
        publishedBy: MOCK_OPERATOR,
        remark: '首次发布',
      },
    ],
    createdAt: t1,
    updatedAt: t2,
  }
  const draft: DataCleanAsset = {
    id: 'dca_demo_2',
    name: '示例草稿清洗',
    code: 'demo_draft_clean',
    description: '演示草稿数据清洗资产',
    enabled: true,
    currentVersion: null,
    publishedAt: null,
    publishedBy: null,
    updatedBy: MOCK_OPERATOR,
    draftSchema: emptySchema(),
    versions: [],
    createdAt: t1,
    updatedAt: t1,
  }
  const disabled: DataCleanAsset = {
    id: 'dca_demo_3',
    name: '已停用清洗流',
    code: 'demo_disabled_clean',
    description: '停用后可删除',
    enabled: false,
    currentVersion: 'v2',
    publishedAt: '2026-07-15T08:00:00.000Z',
    publishedBy: '张三',
    updatedBy: '李四',
    draftSchema: emptySchema(),
    versions: [
      {
        version: 'v1',
        schema: emptySchema(),
        publishedAt: '2026-07-01T08:00:00.000Z',
        publishedBy: '张三',
      },
      {
        version: 'v2',
        schema: emptySchema(),
        publishedAt: '2026-07-15T08:00:00.000Z',
        publishedBy: '张三',
      },
    ],
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-07-20T08:00:00.000Z',
  }
  ;[published, draft, disabled].forEach((item) => assetStore.set(item.id, item))
}

seed()

function findAsset(id: string) {
  return assetStore.get(id)
}

function filterAssets(query: Recordable<any>): DataCleanAsset[] {
  const name = String(query?.name || '').trim().toLowerCase()
  const code = String(query?.code || '').trim().toLowerCase()
  const publishStatus = String(query?.publishStatus || '').trim()
  const updatedAtStart = String(query?.updatedAtStart || '').trim()
  const updatedAtEnd = String(query?.updatedAtEnd || '').trim()

  let enabledFilter: boolean | null = null
  if (query?.enabled !== undefined && query?.enabled !== null && query?.enabled !== '') {
    const raw = query.enabled
    enabledFilter = raw === true || raw === 'true' || raw === 1 || raw === '1'
  }

  return Array.from(assetStore.values())
    .filter((item) => {
      if (name && !item.name.toLowerCase().includes(name)) return false
      if (code && !item.code.toLowerCase().includes(code)) return false
      if (enabledFilter != null && item.enabled !== enabledFilter) return false
      if (publishStatus === 'draft' && item.currentVersion) return false
      if (publishStatus === 'published' && !item.currentVersion) return false
      if (updatedAtStart && item.updatedAt.slice(0, 10) < updatedAtStart) return false
      if (updatedAtEnd && item.updatedAt.slice(0, 10) > updatedAtEnd) return false
      return true
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/data-clean-assets/page'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const page = Number(payload.page || 1)
      const pageSize = Number(payload.pageSize || 10)
      const list = filterAssets(payload).map(toListItem)
      return resultPageSuccess(page, pageSize, list)
    },
  },
  {
    url: mockUrl('/data-clean-assets'),
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = String(payload.name || '').trim()
      const code = String(payload.code || '').trim()
      const description = String(payload.description || '').trim()

      if (!name) return resultError('请填写名称')
      if (!code) return resultError('请填写编码')
      if ([...assetStore.values()].some((item) => item.code === code)) {
        return resultError('编码已存在')
      }

      const stamp = nowIso()
      const asset: DataCleanAsset = {
        id: nextId(),
        name,
        code,
        description,
        enabled: true,
        currentVersion: null,
        publishedAt: null,
        publishedBy: null,
        updatedBy: MOCK_OPERATOR,
        draftSchema: emptySchema(),
        versions: [],
        createdAt: stamp,
        updatedAt: stamp,
      }
      assetStore.set(asset.id, asset)
      return resultSuccess(toListItem(asset), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/data-clean-asset/detail'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      return resultSuccess({
        ...asset,
        draftSchema: cloneSchema(asset.draftSchema),
        versions: asset.versions.map((item) => ({
          ...item,
          schema: cloneSchema(item.schema),
        })),
      })
    },
  },
  {
    url: mockUrl('/data-clean-asset'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')

      const name = String(payload.name || '').trim()
      const description = String(payload.description || '').trim()
      if (!name) return resultError('请填写名称')

      asset.name = name
      asset.description = description
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(toListItem(asset), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/data-clean-asset/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      if (asset.enabled) return resultError('启用中的资产不能删除，请先停用')
      assetStore.delete(id)
      return resultSuccess({ id }, { message: '删除成功' })
    },
  },
  {
    url: mockUrl('/data-clean-asset/enabled'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      asset.enabled = Boolean(payload.enabled)
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(toListItem(asset), {
        message: asset.enabled ? '已启用' : '已停用',
      })
    },
  },
  {
    url: mockUrl('/data-clean-asset/schema'),
    method: 'put',
    timeout: 120,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      asset.draftSchema = cloneSchema(payload.schema)
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(
        { id: asset.id, updatedAt: asset.updatedAt, updatedBy: asset.updatedBy },
        { message: '设计内容已保存' },
      )
    },
  },
  {
    url: mockUrl('/data-clean-asset/publish'),
    method: 'post',
    timeout: 120,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      const version = nextVersionLabel(asset)
      const publishedAt = nowIso()
      asset.versions.push({
        version,
        schema: cloneSchema(asset.draftSchema),
        publishedAt,
        publishedBy: MOCK_OPERATOR,
        remark: String(payload.remark || '').trim() || undefined,
      })
      asset.currentVersion = version
      asset.publishedAt = publishedAt
      asset.publishedBy = MOCK_OPERATOR
      asset.updatedAt = publishedAt
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(toListItem(asset), { message: `已发布 ${version}` })
    },
  },
  {
    url: mockUrl('/data-clean-asset/versions'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')
      const list = [...asset.versions]
        .sort((a, b) => parseVersionNo(b.version) - parseVersionNo(a.version))
        .map(({ version, publishedAt, publishedBy, remark }) => ({
          version,
          publishedAt,
          publishedBy: publishedBy || '',
          remark: remark || '',
          isCurrent: version === asset.currentVersion,
        }))
      return resultSuccess({
        id: asset.id,
        currentVersion: asset.currentVersion,
        items: list,
      })
    },
  },
  {
    url: mockUrl('/data-clean-asset/rollback'),
    method: 'post',
    timeout: 60,
    response: () => resultError('暂未开放'),
  },
]

export default mocks
