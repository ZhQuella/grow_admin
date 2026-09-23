<template>
  <GrowDrawer
    v-model="visible"
    class="tenant-history-drawer"
    :title="target?.tenantName ? `租户变更历史 · ${target.tenantName}` : '租户变更历史'"
    size="450px"
    direction="rtl"
    append-to-body
    destroy-on-close
  >
    <div ref="viewportRef" class="tenant-history-drawer__viewport">
      <GrowScrollbar :key="target?.id" height="100%" class="tenant-history-drawer__scrollbar">
        <template v-if="!items.length">
          <div v-if="loading" class="tenant-history-drawer__state" role="status">加载中…</div>
          <div v-else-if="error" class="tenant-history-drawer__state" role="alert">
            <p>{{ error }}</p>
            <GrowButton link type="primary" @click="loadMore">重新加载</GrowButton>
          </div>
          <div v-else class="tenant-history-drawer__state">暂无变更记录</div>
        </template>
        <template v-else>
          <GrowTimeline class="tenant-history-drawer__timeline">
            <GrowTimelineItem
              v-for="(item, index) in items"
              :key="item.id"
              :timestamp="formatTime(item.operatedAt)"
              placement="top"
              :type="historyType(item.action)"
              :hollow="index !== 0"
            >
              <div class="tenant-history-drawer__card">
                <GrowTag :type="historyType(item.action)" size="small">{{ TENANT_HISTORY_ACTION_LABELS[item.action] || item.action }}</GrowTag>
                <p v-if="item.description" class="tenant-history-drawer__summary">{{ item.description }}</p>
                <p v-if="item.remark" class="tenant-history-drawer__summary">备注：{{ item.remark }}</p>
                <div class="tenant-history-drawer__meta">
                  {{ item.operatorName || '-' }} · {{ formatTime(item.operatedAt) }}
                </div>
              </div>
            </GrowTimelineItem>
          </GrowTimeline>
          <div ref="loadMoreRef" class="tenant-history-drawer__more" aria-live="polite">
            <span v-if="loading">加载中…</span>
            <template v-else-if="error">
              <p>{{ error }}</p>
              <GrowButton link type="primary" @click="loadMore">重新加载</GrowButton>
            </template>
            <GrowButton v-else-if="hasMore" link size="small" @click="loadMore">加载更多记录</GrowButton>
            <span v-else>已显示全部记录</span>
          </div>
        </template>
      </GrowScrollbar>
    </div>
    <template #footer>
      <GrowButton @click="visible = false">关闭</GrowButton>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { TENANT_HISTORY_ACTION_LABELS } from '../../../types/systemTenant'
import { formatTime } from '../use/helpers'
import { useTenantHistory } from '../use/useTenantHistory'

const { visible, target, loading, error, items, hasMore, loadMore, open } = useTenantHistory()
const viewportRef = ref<HTMLElement>()
const loadMoreRef = ref<HTMLElement>()

function historyType(action: string) {
  if (action === 'create' || action === 'activate') return 'success'
  if (action === 'trial') return 'warning'
  if (action === 'disable' || action === 'clear' || action === 'delete') return 'danger'
  return 'primary'
}

watch([viewportRef, loadMoreRef, visible, loading, hasMore, error], (_, __, onCleanup) => {
  if (!viewportRef.value || !loadMoreRef.value || !visible.value || loading.value || !hasMore.value || error.value) return
  if (typeof IntersectionObserver === 'undefined') return

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !error.value) void loadMore()
  }, { root: viewportRef.value })
  observer.observe(loadMoreRef.value)
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })

defineExpose({ open })
</script>

<style scoped>
.tenant-history-drawer__viewport {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tenant-history-drawer__scrollbar :deep(.el-scrollbar__wrap) {
  overscroll-behavior: contain;
}

.tenant-history-drawer__timeline {
  padding: 8px 4px 8px 8px;
  overflow-wrap: anywhere;
}

.tenant-history-drawer__card {
  padding-bottom: 4px;
}

.tenant-history-drawer__summary {
  margin: 8px 0 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.tenant-history-drawer__meta {
  margin-top: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.tenant-history-drawer__more {
  padding: 12px 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  overflow-wrap: anywhere;
}

.tenant-history-drawer__state {
  padding: 24px 8px;
  color: var(--text-color-secondary);
  text-align: center;
}
</style>

<style>
.tenant-history-drawer.el-drawer {
  max-width: 100vw;
  overflow: hidden;
}

.tenant-history-drawer .el-drawer__header,
.tenant-history-drawer .el-drawer__footer {
  flex-shrink: 0;
}

.tenant-history-drawer .el-drawer__title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.tenant-history-drawer .el-drawer__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
