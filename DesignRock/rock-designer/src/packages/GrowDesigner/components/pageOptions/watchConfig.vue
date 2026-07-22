<template>
  <div class="watch-config">
    <div class="watch-config__toolbar">
      <span class="watch-config__title">已配置监听</span>
      <GrowButton size="small" type="primary" plain title="添加监听" @click="onAdd">
        <GrowIconify icon="carbon:add" :size="14" />
        添加监听
      </GrowButton>
    </div>

    <p v-if="!configuredList.length" class="watch-config__empty">
      暂无监听。可监听数据源变量（如 state.user），变化时执行代码。
    </p>

    <div
      v-for="item in configuredList"
      :key="item.source"
      class="watch-config__card"
    >
      <div class="watch-config__card-head">
        <div class="watch-config__card-meta">
          <span class="watch-config__card-source">{{ item.source }}</span>
        </div>
        <div class="watch-config__card-actions">
          <span class="watch-config__enabled-label">启用绑定</span>
          <GrowSwitch
            size="small"
            :model-value="isWatcherEnabled(item)"
            @update:model-value="(v) => onToggleEnabled(item.source, v)"
          />
          <GrowButton text size="small" title="编辑" @click="onEdit(item)">
            <GrowIconify icon="carbon:edit" :size="14" />
          </GrowButton>
          <GrowButton
            text
            size="small"
            type="danger"
            title="删除"
            @click="onRemove(item.source)"
          >
            <GrowIconify icon="carbon:trash-can" :size="14" />
          </GrowButton>
        </div>
      </div>
      <div class="watch-config__tags">
        <span v-if="item.deep" class="watch-config__tag">深度</span>
        <span v-if="item.immediate" class="watch-config__tag">立即</span>
      </div>
      <pre class="watch-config__preview">{{ previewCode(item) }}</pre>
    </div>

    <WatchEditDialog
      v-model:visible="dialogVisible"
      :model-value="editingItem"
      @confirm="onDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue'
import {
  isWatcherEnabled,
  type DesignerWatcherItem,
} from '../../static/pageWatchers'
import type { DesignerDataSourceItem } from '../dataSource/types'
import WatchEditDialog from './WatchEditDialog.vue'

defineOptions({ name: 'watchConfig' })

const props = defineProps({
  currentWatchersConfig: {
    type: Object,
    default: () => ({}),
  },
  dataSource: {
    type: Array as () => DesignerDataSourceItem[],
    default: () => [],
  },
})

const emit = defineEmits<{
  'update:currentWatchersConfig': [value: Record<string, DesignerWatcherItem>]
}>()

const { currentWatchersConfig } = toRefs(props)

const dialogVisible = ref(false)
const editingItem = reactive<DesignerWatcherItem>({
  name: 'onStateChange',
  source: '',
  code: '',
  enabled: false,
  deep: false,
  immediate: false,
})
/** 编辑前的旧 source，用于改路径时迁移 key */
const editingSourceKey = ref('')

const configuredMap = computed(
  () =>
    (currentWatchersConfig.value || {}) as Record<string, DesignerWatcherItem>,
)

const configuredList = computed(() =>
  Object.values(configuredMap.value).filter((item) => item && item.source),
)

const previewCode = (item: DesignerWatcherItem) => {
  const body = String(item.code || '').trim()
  if (!body) return '// 空函数体'
  return body.length > 160 ? `${body.slice(0, 160)}…` : body
}

const commit = (next: Record<string, DesignerWatcherItem>) => {
  emit('update:currentWatchersConfig', next)
}

const onAdd = () => {
  const first = (props.dataSource || []).find(
    (item) => item && String(item.name || '').trim(),
  )
  const source = first ? `state.${String(first.name).trim()}` : 'state.'
  Object.assign(editingItem, {
    name: '',
    source,
    code: '',
    enabled: false,
    deep: false,
    immediate: false,
  })
  editingSourceKey.value = ''
  dialogVisible.value = true
}

const onEdit = (item: DesignerWatcherItem) => {
  Object.assign(editingItem, {
    name: '',
    source: item.source,
    code: item.code ?? '',
    enabled: isWatcherEnabled(item),
    deep: Boolean(item.deep),
    immediate: Boolean(item.immediate),
  })
  editingSourceKey.value = item.source
  dialogVisible.value = true
}

const onDialogConfirm = (value: DesignerWatcherItem) => {
  const source = String(value.source || '').trim()
  if (!source) return
  const next = { ...configuredMap.value }
  const oldKey = editingSourceKey.value
  if (oldKey && oldKey !== source) {
    Reflect.deleteProperty(next, oldKey)
  }
  next[source] = { ...value, source }
  commit(next)
}

const onToggleEnabled = (source: string, value: boolean | string | number) => {
  const current = configuredMap.value[source]
  if (!current) return
  commit({
    ...configuredMap.value,
    [source]: {
      ...current,
      enabled: Boolean(value),
    },
  })
}

const onRemove = (source: string) => {
  const next = { ...configuredMap.value }
  Reflect.deleteProperty(next, source)
  commit(next)
}
</script>

<style scoped lang="scss">
.watch-config {
  height: 100%;
  padding: 10px 12px 16px;
}

.watch-config__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.watch-config__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.watch-config__empty {
  margin: 24px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}

.watch-config__card {
  margin-bottom: 10px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--layout-container-background-color, #fff);
}

.watch-config__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--layout-background-color, #f5f7fa);
}

.watch-config__card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.watch-config__card-source {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.watch-config__card-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.watch-config__enabled-label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.watch-config__tags {
  display: flex;
  gap: 6px;
  padding: 6px 10px 0;
}

.watch-config__tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--color-primary-a08, rgba(124, 77, 255, 0.08));
  font-size: 11px;
  color: var(--primary-color);
}

.watch-config__preview {
  margin: 0;
  padding: 8px 10px;
  max-height: 88px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
