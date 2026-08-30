<template>
  <GrowDrawer
    v-model="visible"
    :title="person ? `人事历史 · ${person.name}` : '人事历史'"
    size="520px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="person-history__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-if="loading" class="person-history__hint">加载中…</div>
          <div v-else-if="!rows.length" class="person-history__hint">暂无历史记录</div>
          <GrowTimeline v-else class="person-history__timeline">
            <GrowTimelineItem
              v-for="(item, index) in rows"
              :key="item.id"
              :timestamp="item.effectiveDate || formatTime(item.createdAt)"
              :type="tagType(item.type)"
              :hollow="index !== 0"
              placement="top"
            >
              <div class="person-history__card">
                <GrowTag :type="tagType(item.type)" size="small">{{ item.title }}</GrowTag>
                <p class="person-history__summary">{{ item.summary }}</p>
                <div class="person-history__meta">
                  {{ item.operator }} · {{ formatTime(item.createdAt) }}
                </div>
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
import { fetchSystemPersonHistory } from '../../../api/systemPerson'
import type { PersonEventType, PersonHistoryItem, SystemPersonListItem } from '../../../types/systemPerson'
import { formatTime, toMessage } from '../use/helpers'

defineOptions({ name: 'PersonHistoryDrawer' })

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const person = ref<SystemPersonListItem | null>(null)
const rows = ref<PersonHistoryItem[]>([])

function tagType(type: PersonEventType | string) {
  if (type === 'resign' || type === 'delete' || type === 'retire') return 'danger'
  if (type === 'transfer' || type === 'disable' || type.startsWith('part_time')) return 'warning'
  if (type === 'confirm' || type === 'enable') return 'success'
  if (type === 'reinstate' || type === 'rehire') return 'primary'
  return 'info'
}

async function open(row: SystemPersonListItem) {
  person.value = row
  rows.value = []
  visible.value = true
  loading.value = true
  try {
    const data = await fetchSystemPersonHistory(row.userId)
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
.person-history__watch {
  height: 100%;
  min-height: 240px;
}

.person-history__hint {
  padding: 24px 8px;
  color: var(--text-color-secondary);
  text-align: center;
}

.person-history__timeline {
  padding: 8px 4px 8px 8px;
}

.person-history__card {
  padding-bottom: 4px;
}

.person-history__summary {
  margin: 8px 0 0;
  line-height: 1.5;
}

.person-history__meta {
  margin-top: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
