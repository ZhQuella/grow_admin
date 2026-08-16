import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import {
  resultError,
  resultPageSuccess,
  resultSuccess,
} from '@grow-admin-rock/mock/util'

type OnlinePageDraft = {
  files: Record<string, string>
  dependencies: Array<Recordable<any>>
}

type OnlinePageVersion = {
  version: string
  draft: OnlinePageDraft
  publishedAt: string
  publishedBy?: string
  remark?: string
}

type OnlinePage = {
  id: string
  name: string
  code: string
  description: string
  enabled: boolean
  currentVersion: string | null
  publishedAt: string | null
  publishedBy: string | null
  updatedBy: string
  draft: OnlinePageDraft
  versions: OnlinePageVersion[]
  createdAt: string
  updatedAt: string
}

const MOCK_OPERATOR = 'Grow Admin'

const EMPTY_APP_VUE = `<template>
  <div class="online-page">
    <h3>{{ title }}</h3>
    <p>在左侧编辑代码，右侧实时预览。</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const title = ref('在线页面')
</script>

<style scoped>
.online-page {
  padding: 16px;
}
</style>
`

function emptyDraft(): OnlinePageDraft {
  return {
    files: {
      'App.vue': EMPTY_APP_VUE,
    },
    dependencies: [],
  }
}

function nowIso() {
  return new Date().toISOString()
}

function nextId() {
  return `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function toListItem(asset: OnlinePage) {
  const { draft: _d, versions, ...rest } = asset
  return {
    ...rest,
    versionCount: versions.length,
  }
}

function parseVersionNo(version: string): number {
  const matched = /^v(\d+)$/i.exec(version)
  return matched ? Number(matched[1]) : 0
}

function nextVersionLabel(asset: OnlinePage): string {
  const max = asset.versions.reduce((acc, item) => Math.max(acc, parseVersionNo(item.version)), 0)
  return `v${max + 1}`
}

function cloneDraft(draft?: OnlinePageDraft): OnlinePageDraft {
  try {
    return JSON.parse(JSON.stringify(draft || emptyDraft()))
  } catch {
    return emptyDraft()
  }
}

const assetStore = new Map<string, OnlinePage>()

function seed() {
  if (assetStore.size) return
  const t1 = '2026-08-01T08:00:00.000Z'
  const t2 = '2026-08-10T10:30:00.000Z'
  const published: OnlinePage = {
    id: 'op_demo_1',
    name: '示例欢迎页',
    code: 'demo_welcome',
    description: '演示已发布在线页面',
    enabled: true,
    currentVersion: 'v1',
    publishedAt: t2,
    publishedBy: MOCK_OPERATOR,
    updatedBy: MOCK_OPERATOR,
    draft: emptyDraft(),
    versions: [
      {
        version: 'v1',
        draft: emptyDraft(),
        publishedAt: t2,
        publishedBy: MOCK_OPERATOR,
        remark: '首次发布',
      },
    ],
    createdAt: t1,
    updatedAt: t2,
  }
  const draft: OnlinePage = {
    id: 'op_demo_2',
    name: '示例工作台',
    code: 'demo_workbench',
    description: '演示草稿在线页面',
    enabled: true,
    currentVersion: null,
    publishedAt: null,
    publishedBy: null,
    updatedBy: MOCK_OPERATOR,
    draft: emptyDraft(),
    versions: [],
    createdAt: t1,
    updatedAt: t1,
  }
  const disabled: OnlinePage = {
    id: 'op_demo_3',
    name: '已停用页面',
    code: 'demo_disabled_page',
    description: '停用后可删除',
    enabled: false,
    currentVersion: 'v2',
    publishedAt: '2026-07-15T08:00:00.000Z',
    publishedBy: '张三',
    updatedBy: '李四',
    draft: emptyDraft(),
    versions: [
      {
        version: 'v1',
        draft: emptyDraft(),
        publishedAt: '2026-07-01T08:00:00.000Z',
        publishedBy: '张三',
      },
      {
        version: 'v2',
        draft: emptyDraft(),
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

function filterAssets(query: Recordable<any>): OnlinePage[] {
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
    url: mockUrl('/online-pages/page'),
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
    url: mockUrl('/online-pages'),
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
      const asset: OnlinePage = {
        id: nextId(),
        name,
        code,
        description,
        enabled: true,
        currentVersion: null,
        publishedAt: null,
        publishedBy: null,
        updatedBy: MOCK_OPERATOR,
        draft: emptyDraft(),
        versions: [],
        createdAt: stamp,
        updatedAt: stamp,
      }
      assetStore.set(asset.id, asset)
      return resultSuccess(toListItem(asset), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/online-page/detail'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
      return resultSuccess({
        ...asset,
        draft: cloneDraft(asset.draft),
        versions: asset.versions.map((item) => ({
          ...item,
          draft: cloneDraft(item.draft),
        })),
      })
    },
  },
  {
    url: mockUrl('/online-page'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')

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
    url: mockUrl('/online-page/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
      if (asset.enabled) return resultError('启用中的页面不能删除，请先停用')
      assetStore.delete(id)
      return resultSuccess({ id }, { message: '删除成功' })
    },
  },
  {
    url: mockUrl('/online-page/enabled'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
      asset.enabled = Boolean(payload.enabled)
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(toListItem(asset), {
        message: asset.enabled ? '已启用' : '已停用',
      })
    },
  },
  {
    url: mockUrl('/online-page/schema'),
    method: 'put',
    timeout: 120,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
      asset.draft = cloneDraft(payload.draft)
      asset.updatedAt = nowIso()
      asset.updatedBy = MOCK_OPERATOR
      return resultSuccess(
        { id: asset.id, updatedAt: asset.updatedAt, updatedBy: asset.updatedBy },
        { message: '设计内容已保存' },
      )
    },
  },
  {
    url: mockUrl('/online-page/publish'),
    method: 'post',
    timeout: 120,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const id = String(payload.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
      const version = nextVersionLabel(asset)
      const publishedAt = nowIso()
      asset.versions.push({
        version,
        draft: cloneDraft(asset.draft),
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
    url: mockUrl('/online-page/versions'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '')
      const asset = findAsset(id)
      if (!asset) return resultError('页面不存在')
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
    url: mockUrl('/online-page/rollback'),
    method: 'post',
    timeout: 60,
    response: () => resultError('暂未开放'),
  },
]

export default mocks
