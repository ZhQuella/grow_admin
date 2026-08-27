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
          <div v-else class="person-history__list">
            <div v-for="item in rows" :key="item.id" class="person-history__item">
              <div class="person-history__dot" :class="`is-${item.type}`" />
              <div class="person-history__body">
                <div class="person-history__head">
                  <GrowTag :type="tagType(item.type)" size="small">{{ item.title }}</GrowTag>
                  <span class="person-history__date">{{ item.effectiveDate }}</span>
                </div>
                <p class="person-history__summary">{{ item.summary }}</p>
                <div class="person-history__meta">
                  {{ item.operator }} · {{ formatTime(item.createdAt) }}
                </div>
              </div>
            </div>
          </div>
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
  if (type === 'resign') return 'danger'
  if (type === 'transfer') return 'warning'
  if (type === 'confirm') return 'success'
  if (type === 'reinstate') return 'primary'
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

.person-history__list {
  padding: 8px 4px 16px;
}

.person-history__item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}

.person-history__dot {
  flex: 0 0 10px;
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--el-color-info);
}

.person-history__dot.is-onboard { background: var(--el-color-info); }
.person-history__dot.is-transfer { background: var(--el-color-warning); }
.person-history__dot.is-confirm { background: var(--el-color-success); }
.person-history__dot.is-resign { background: var(--el-color-danger); }
.person-history__dot.is-reinstate { background: var(--el-color-primary); }

.person-history__body {
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.person-history__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.person-history__date {
  color: var(--text-color-secondary);
  font-size: 12px;
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
