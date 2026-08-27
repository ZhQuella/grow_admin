<template>
  <GrowDrawer
    v-model="visible"
    :title="account ? `账号历史 · ${account.username}` : '账号历史'"
    size="520px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="account-history__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-if="loading" class="account-history__hint">加载中…</div>
          <div v-else-if="!rows.length" class="account-history__hint">暂无历史记录</div>
          <GrowTimeline v-else class="account-history__timeline">
            <GrowTimelineItem
              v-for="(item, index) in rows"
              :key="item.id"
              :timestamp="formatTime(item.createdAt)"
              :type="tagType(item.type)"
              :hollow="index !== 0"
              placement="top"
            >
              <div class="account-history__card">
                <GrowTag :type="tagType(item.type)" size="small">{{ item.title }}</GrowTag>
                <p class="account-history__summary">{{ item.summary }}</p>
                <div class="account-history__meta">{{ item.operator }}</div>
              </div>
            </GrowTimelineItem>
          </GrowTimeline>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowButton @click="visible = false">关闭</GrowButton>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchSystemAccountHistory } from '../../../api/systemAccount'
import type { AccountEventType, AccountHistoryItem, SystemAccountListItem } from '../../../types/systemAccount'
import { formatTime, toMessage } from '../use/helpers'

defineOptions({ name: 'AccountHistoryDrawer' })

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const account = ref<SystemAccountListItem | null>(null)
const rows = ref<AccountHistoryItem[]>([])

function tagType(type: AccountEventType | string) {
  if (type === 'disable') return 'danger'
  if (type === 'reset_password' || type === 'unassign') return 'warning'
  if (type === 'enable' || type === 'login') return 'success'
  if (type === 'assign' || type === 'create') return 'primary'
  return 'info'
}

async function open(row: SystemAccountListItem) {
  account.value = row
  rows.value = []
  visible.value = true
  loading.value = true
  try {
    const data = await fetchSystemAccountHistory(row.accountId)
    rows.value = Array.isArray(data) ? data : []
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.account-history__watch {
  height: 100%;
  min-height: 240px;
}

.account-history__hint {
  padding: 24px 8px;
  color: var(--text-color-secondary);
  text-align: center;
}

.account-history__timeline {
  padding: 8px 4px 8px 8px;
}

.account-history__card {
  padding-bottom: 4px;
}

.account-history__summary {
  margin: 8px 0 0;
  line-height: 1.5;
}

.account-history__meta {
  margin-top: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
