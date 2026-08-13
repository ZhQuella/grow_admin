import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import {
  resultError,
  resultPageSuccess,
  resultSuccess,
} from '@grow-admin-rock/mock/util'

type LowcodeAssetType = 'form' | 'page'

type DesignerSchema = Recordable<any>

type LowcodeAssetVersion = {
  version: string
  schema: DesignerSchema
  publishedAt: string
  publishedBy?: string
  remark?: string
}

type LowcodeAsset = {
  id: string
  name: string
  code: string
  type: LowcodeAssetType
  description: string
  enabled: boolean
  currentVersion: string | null
  publishedAt: string | null
  publishedBy: string | null
  updatedBy: string
  draftSchema: DesignerSchema
  versions: LowcodeAssetVersion[]
  createdAt: string
  updatedAt: string
}

const MOCK_OPERATOR = 'Grow Admin'

function emptySchema(): DesignerSchema {
  return {
    structures: [],
    renderArgument: {},
    props: {},
    styles: {},
    pageConfig: {},
    dataSource: [],
    computedProps: [],
    apiOutlined: [],
    propBindModes: {},
    events: {},
  }
}

function nowIso() {
  return new Date().toISOString()
}

function nextId() {
  return `la_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function toListItem(asset: LowcodeAsset) {
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

function nextVersionLabel(asset: LowcodeAsset): string {
  const max = asset.versions.reduce((acc, item) => Math.max(acc, parseVersionNo(item.version)), 0)
  return `v${max + 1}`
}

function cloneSchema(schema?: DesignerSchema): DesignerSchema {
  try {
    return JSON.parse(JSON.stringify(schema || emptySchema()))
  } catch {
    return emptySchema()
  }
}

const assetStore = new Map<string, LowcodeAsset>()

function seed() {
  if (assetStore.size) return
  const t1 = '2026-08-01T08:00:00.000Z'
  const t2 = '2026-08-10T10:30:00.000Z'
  const pagePublished: LowcodeAsset = {
    id: 'la_demo_page_1',
    name: '示例工作台页面',
    code: 'demo_workspace_page',
    type: 'page',
    description: '演示已发布页面资产',
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
  const formDraft: LowcodeAsset = {
    id: 'la_demo_form_1',
    name: '示例请假表单',
    code: 'demo_leave_form',
    type: 'form',
    description: '演示草稿表单资产',
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
  const disabledPage: LowcodeAsset = {
    id: 'la_demo_page_2',
    name: '已停用页面',
    code: 'demo_disabled_page',
    type: 'page',
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
  ;[pagePublished, formDraft, disabledPage].forEach((item) => assetStore.set(item.id, item))
}

seed()

function findAsset(id: string) {
  return assetStore.get(id)
}

function filterAssets(query: Recordable<any>): LowcodeAsset[] {
  const name = String(query?.name || '').trim().toLowerCase()
  const code = String(query?.code || '').trim().toLowerCase()
  const type = String(query?.type || '').trim()
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
      if (type && item.type !== type) return false
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
    url: mockUrl('/lowcode-assets/page'),
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
    url: mockUrl('/lowcode-assets'),
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = String(payload.name || '').trim()
      const code = String(payload.code || '').trim()
      const type = String(payload.type || '').trim() as LowcodeAssetType
      const description = String(payload.description || '').trim()

      if (!name) return resultError('请填写名称')
      if (!code) return resultError('请填写编码')
      if (type !== 'form' && type !== 'page') return resultError('请选择类型：表单或页面')
      if ([...assetStore.values()].some((item) => item.code === code)) {
        return resultError('编码已存在')
      }

      const stamp = nowIso()
      const asset: LowcodeAsset = {
        id: nextId(),
        name,
        code,
        type,
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
    url: mockUrl('/lowcode-asset/detail'),
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
    url: mockUrl('/lowcode-asset'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('资产不存在')

      const name = String(payload.name || '').trim()
      const type = String(payload.type || '').trim() as LowcodeAssetType
      const description = String(payload.description || '').trim()
      if (!name) return resultError('请填写名称')
      if (type !== 'form' && type !== 'page') return resultError('请选择类型：表单或页面')

      asset.name = name
      asset.type = type
      asset.description = description
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(toListItem(asset), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/lowcode-asset/delete'),
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
    url: mockUrl('/lowcode-asset/enabled'),
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
    url: mockUrl('/lowcode-asset/schema'),
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
    url: mockUrl('/lowcode-asset/publish'),
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
    url: mockUrl('/lowcode-asset/versions'),
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
    url: mockUrl('/lowcode-asset/rollback'),
    method: 'post',
    timeout: 60,
    response: () => resultError('暂未开放'),
  },
]

export default mocks
