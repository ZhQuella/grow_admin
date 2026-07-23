<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col overflow-visible"
    @click.stop
    @mouseup.stop
  >
    <div
      class="flex h-10 shrink-0 items-center justify-end border-b border-solid border-border px-1"
    >
      <GrowButton type="primary" size="small" @click.stop="onCreate">
        <GrowIconify icon="carbon:add" :size="16" class="mr-1" />
        添加
      </GrowButton>
    </div>

    <GrowScrollbar class="min-h-0 flex-1">
      <div class="p-2">
        <div
          v-if="!configuredList.length"
          class="px-2 py-6 text-center text-xs text-text-secondary"
        >
          暂无数据监听，点击右上角添加
        </div>

        <div
          v-for="item in configuredList"
          :key="item.source"
          class="mb-1.5 rounded border border-solid border-border"
          :class="{ 'bg-primary-a08': drawerVisible && editingSourceKey === item.source }"
        >
          <div
            class="flex items-center gap-1 border-b border-solid border-border bg-layout px-1 py-2"
          >
            <div class="min-w-0 flex-1 px-1">
              <p
                class="truncate text-sm font-medium text-text"
                style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                {{ item.source }}
              </p>
              <div class="mt-0.5 flex gap-1">
                <span
                  v-if="item.deep"
                  class="rounded bg-primary-a08 px-1.5 text-[11px] text-primary"
                >
                  深度
                </span>
                <span
                  v-if="item.immediate"
                  class="rounded bg-primary-a08 px-1.5 text-[11px] text-primary"
                >
                  立即
                </span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-0.5">
              <span class="mr-1 text-xs text-text-secondary">启用</span>
              <GrowSwitch
                size="small"
                :model-value="isWatcherEnabled(item)"
                @update:model-value="(v) => onToggleEnabled(item.source, v)"
              />
              <GrowButton text size="small" title="编辑" @click.stop="onEdit(item)">
                <GrowIconify icon="carbon:edit" :size="14" />
              </GrowButton>
              <GrowButton
                text
                size="small"
                type="danger"
                title="删除"
                @click.stop="onRemove(item.source)"
              >
                <GrowIconify icon="carbon:trash-can" :size="14" />
              </GrowButton>
            </div>
          </div>
          <pre
            class="m-0 max-h-20 overflow-auto px-2.5 py-2 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap break-words"
          >{{ previewCode(item) }}</pre>
        </div>
      </div>
    </GrowScrollbar>

    <div
      v-if="drawerVisible"
      class="absolute bottom-0 left-full top-0 z-20 flex w-[520px] flex-col border-l border-solid border-border bg-component shadow-card"
    >
      <div
        class="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
      >
        <h4 class="m-0 text-sm font-medium text-text">
          {{ editingSourceKey ? '修改数据监听' : '添加数据监听' }}
        </h4>
        <div class="flex shrink-0 items-center gap-2">
          <GrowButton
            type="primary"
            size="small"
            :disabled="!String(formData.source || '').trim()"
            @click.stop="onSave"
          >
            保存
          </GrowButton>
          <GrowButton type="primary" plain size="small" @click.stop="onClose">取消</GrowButton>
        </div>
      </div>
      <WatchForm :model="formData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import {
  defaultWatcherName,
  isWatcherEnabled,
  type DesignerWatcherItem,
} from '../../static/pageWatchers'
import type { DesignerDataSourceItem } from '../dataSource/types'
import WatchForm from './WatchForm.vue'

defineOptions({ name: 'pageWatchers' })

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = toRefs(props)
const message = useMsg()

const drawerVisible = ref(false)
const editingSourceKey = ref('')
const formData = reactive<Omit<DesignerWatcherItem, 'name'>>({
  source: '',
  code: '',
  enabled: false,
  deep: false,
  immediate: false,
})

const ensurePageConfig = () => {
  if (!data.value.pageConfig) {
    data.value.pageConfig = {}
  }
  return data.value.pageConfig
}

const configuredMap = computed(
  () =>
    (data.value?.pageConfig?.watchers || {}) as Record<string, DesignerWatcherItem>,
)

const configuredList = computed(() =>
  Object.values(configuredMap.value).filter((item) => item && item.source),
)

const dataSource = computed(
  () => (data.value?.dataSource || []) as DesignerDataSourceItem[],
)

const previewCode = (item: DesignerWatcherItem) => {
  const body = String(item.code || '').trim()
  if (!body) return '// 空函数体'
  return body.length > 160 ? `${body.slice(0, 160)}…` : body
}

const commit = (next: Record<string, DesignerWatcherItem>) => {
  ensurePageConfig().watchers = next
}

const resetForm = (source = 'state.') => {
  Object.assign(formData, {
    source,
    code: '',
    enabled: false,
    deep: false,
    immediate: false,
  })
  editingSourceKey.value = ''
}

const onCreate = () => {
  const first = dataSource.value.find((item) => item && String(item.name || '').trim())
  resetForm(first ? `state.${String(first.name).trim()}` : 'state.')
  drawerVisible.value = true
}

const onEdit = (item: DesignerWatcherItem) => {
  Object.assign(formData, {
    source: item.source,
    code: item.code ?? '',
    enabled: isWatcherEnabled(item),
    deep: Boolean(item.deep),
    immediate: Boolean(item.immediate),
  })
  editingSourceKey.value = item.source
  drawerVisible.value = true
}

const onClose = () => {
  drawerVisible.value = false
  editingSourceKey.value = ''
}

const onSave = () => {
  const source = String(formData.source || '').trim()
  if (!source) {
    message.warning('请输入监听路径')
    return
  }
  const next = { ...configuredMap.value }
  const oldKey = editingSourceKey.value
  if (oldKey && oldKey !== source) {
    Reflect.deleteProperty(next, oldKey)
  }
  next[source] = {
    name: defaultWatcherName(source),
    source,
    code: formData.code ?? '',
    enabled: Boolean(formData.enabled),
    deep: Boolean(formData.deep),
    immediate: Boolean(formData.immediate),
  }
  commit(next)
  message.success(oldKey ? '修改成功' : '添加成功')
  onClose()
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
  if (editingSourceKey.value === source) {
    onClose()
  }
  message.success('已删除')
}
</script>
