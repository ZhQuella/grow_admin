<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col overflow-visible"
    @click.stop
    @mouseup.stop
  >
    <div
      class="flex h-10 shrink-0 items-center justify-end border-b border-solid border-border px-1"
    >
      <GrowDropdown
        trigger="click"
        placement="bottom-end"
        popper-class="page-events__menu"
        :disabled="!availableOptions.length"
        @command="onCreate"
      >
        <GrowButton type="primary" size="small" :disabled="!availableOptions.length">
          <GrowIconify icon="carbon:add" :size="16" class="mr-1" />
          添加
        </GrowButton>
        <template #dropdown>
          <GrowDropdownMenu>
            <GrowDropdownItem
              v-for="option in availableOptions"
              :key="option.type"
              :command="option.type"
              :title="option.describe || option.type"
            >
              <div class="page-events__option">
                <span class="page-events__option-label">{{ option.label }}</span>
                <span class="page-events__option-type">{{ option.type }}</span>
              </div>
            </GrowDropdownItem>
          </GrowDropdownMenu>
        </template>
      </GrowDropdown>
    </div>

    <GrowScrollbar class="min-h-0 flex-1">
      <div class="p-2">
        <div
          v-if="!configuredList.length"
          class="px-2 py-6 text-center text-xs text-text-secondary"
        >
          暂无页面事件，点击右上角添加
        </div>

        <div
          v-for="item in configuredList"
          :key="item.eventType"
          class="mb-1.5 rounded border border-solid border-border"
          :class="{ 'bg-primary-a08': drawerVisible && editingEventType === item.eventType }"
        >
          <div
            class="flex items-center gap-1 border-b border-solid border-border bg-layout px-1 py-2"
          >
            <div class="min-w-0 flex-1 px-1">
              <p class="truncate text-sm font-medium text-text">{{ item.name }}</p>
              <p class="mt-0.5 truncate text-xs text-text-secondary">
                {{ labelOf(item.eventType) }} · {{ item.eventType }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-0.5">
              <span class="mr-1 text-xs text-text-secondary">启用</span>
              <GrowSwitch
                size="small"
                :model-value="isEventEnabled(item)"
                @update:model-value="(v) => onToggleEnabled(item.eventType, v)"
              />
              <GrowButton text size="small" title="编辑" @click.stop="onEdit(item)">
                <GrowIconify icon="carbon:edit" :size="14" />
              </GrowButton>
              <GrowButton
                text
                size="small"
                type="danger"
                title="删除"
                @click.stop="onRemove(item.eventType)"
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
          {{
            editingEventType
              ? `修改事件 · ${labelOf(editingEventType)}`
              : `添加事件 · ${labelOf(formData.eventType)}`
          }}
        </h4>
        <div class="flex shrink-0 items-center gap-2">
          <GrowButton type="primary" size="small" @click.stop="onSave">保存</GrowButton>
          <GrowButton type="primary" plain size="small" @click.stop="onClose">取消</GrowButton>
        </div>
      </div>
      <EventForm :model="formData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import {
  defaultEventHandlerName,
  PAGE_LIFECYCLE_EVENTS,
} from '../../static/elementEvents'
import type { DesignerEventItem } from '../../static/elementEvents/types'
import { isEventEnabled } from '../../static/elementEvents/types'
import EventForm from './EventForm.vue'

defineOptions({ name: 'pageEvents' })

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = toRefs(props)
const message = useMsg()

const drawerVisible = ref(false)
const editingEventType = ref('')
const formData = reactive<DesignerEventItem>({
  name: 'onMounted',
  eventType: 'onMounted',
  code: '',
  enabled: false,
})

const ensurePageConfig = () => {
  if (!data.value.pageConfig) {
    data.value.pageConfig = {}
  }
  return data.value.pageConfig
}

const configuredMap = computed(
  () =>
    (data.value?.pageConfig?.events || {}) as Record<string, DesignerEventItem>,
)

const configuredList = computed(() =>
  Object.values(configuredMap.value).filter((item) => item && item.eventType),
)

const availableOptions = computed(() =>
  PAGE_LIFECYCLE_EVENTS.filter((opt) => !configuredMap.value[opt.type]),
)

const labelOf = (eventType: string) =>
  PAGE_LIFECYCLE_EVENTS.find((item) => item.type === eventType)?.label || eventType

const previewCode = (item: DesignerEventItem) => {
  const body = String(item.code || '').trim()
  if (!body) return '// 空函数体'
  return body.length > 160 ? `${body.slice(0, 160)}…` : body
}

const commit = (next: Record<string, DesignerEventItem>) => {
  ensurePageConfig().events = next
}

const onCreate = (eventType: string) => {
  if (!eventType || configuredMap.value[eventType]) return
  Object.assign(formData, {
    name: defaultEventHandlerName(eventType),
    eventType,
    code: '',
    enabled: false,
  })
  editingEventType.value = ''
  drawerVisible.value = true
}

const onEdit = (item: DesignerEventItem) => {
  Object.assign(formData, {
    name: item.name,
    eventType: item.eventType,
    code: item.code ?? '',
    enabled: isEventEnabled(item),
  })
  editingEventType.value = item.eventType
  drawerVisible.value = true
}

const onClose = () => {
  drawerVisible.value = false
  editingEventType.value = ''
}

const onSave = () => {
  const eventType = String(formData.eventType || '').trim()
  if (!eventType) {
    message.warning('事件类型无效')
    return
  }
  const isEdit = Boolean(editingEventType.value)
  commit({
    ...configuredMap.value,
    [eventType]: {
      name: String(formData.name || '').trim() || defaultEventHandlerName(eventType),
      eventType,
      code: formData.code ?? '',
      enabled: Boolean(formData.enabled),
    },
  })
  message.success(isEdit ? '修改成功' : '添加成功')
  onClose()
}

const onToggleEnabled = (eventType: string, value: boolean | string | number) => {
  const current = configuredMap.value[eventType]
  if (!current) return
  commit({
    ...configuredMap.value,
    [eventType]: {
      ...current,
      enabled: Boolean(value),
    },
  })
}

const onRemove = (eventType: string) => {
  const next = { ...configuredMap.value }
  Reflect.deleteProperty(next, eventType)
  commit(next)
  if (editingEventType.value === eventType) {
    onClose()
  }
  message.success('已删除')
}
</script>

<style lang="scss">
.page-events__menu {
  min-width: 200px !important;
}

.page-events__menu .el-dropdown-menu,
.page-events__menu.el-dropdown-menu {
  min-width: 200px !important;
  padding: 4px 0 !important;
}

.page-events__menu .page-events__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-width: 168px;
  box-sizing: border-box;
  line-height: 1.2;
  text-align: left;
}

.page-events__menu .page-events__option-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color, #303133);
  text-align: left;
}

.page-events__menu .page-events__option-type {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-color-secondary, #909399);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-align: right;
}

.page-events__menu .el-dropdown-menu__item {
  display: flex !important;
  align-items: center;
  justify-content: stretch;
  height: auto !important;
  padding: 7px 12px !important;
  line-height: 1.2 !important;
  text-align: left !important;
}

.page-events__menu .n-dropdown-menu {
  min-width: 200px;
  padding: 4px 0;
}

.page-events__menu .n-dropdown-option-body {
  padding: 7px 12px !important;
  text-align: left !important;
}

.page-events__menu .n-dropdown-option-body__label {
  width: 100% !important;
  text-align: left !important;
}
</style>
