import type { CodeDependency } from '@grow-admin-rock/code-sandbox'

export type OnlinePageDraft = {
  files: Record<string, string>
  dependencies: CodeDependency[]
}

export type OnlinePageVersion = {
  version: string
  draft: OnlinePageDraft
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type OnlinePage = {
  id: string
  name: string
  code: string
  description: string
  /** 启用中不可删除 */
  enabled: boolean
  /** 已发布中的最新版本号，如 v1；从未发布为 null */
  currentVersion: string | null
  publishedAt: string | null
  publishedBy: string | null
  updatedBy: string
  draft: OnlinePageDraft
  versions: OnlinePageVersion[]
  createdAt: string
  updatedAt: string
}

export type OnlinePageListItem = Omit<OnlinePage, 'draft' | 'versions'> & {
  versionCount: number
}

export type OnlinePagePageResult = {
  items: OnlinePageListItem[]
  total: number
}

export type OnlinePageQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type OnlinePageCreatePayload = {
  name: string
  code: string
  description?: string
}

export type OnlinePageUpdatePayload = {
  name: string
  description?: string
}

export const EMPTY_ONLINE_PAGE_APP_VUE = `<template>
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

export function createEmptyOnlinePageDraft(): OnlinePageDraft {
  return {
    files: {
      'App.vue': EMPTY_ONLINE_PAGE_APP_VUE,
    },
    dependencies: [],
  }
}
