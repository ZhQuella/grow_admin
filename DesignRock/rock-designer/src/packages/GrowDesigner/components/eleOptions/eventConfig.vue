<template>
  <div class="event-config">
    <div class="event-config__toolbar">
      <span class="event-config__title">已配置事件</span>
      <GrowDropdown
        trigger="click"
        placement="bottom-end"
        popper-class="event-config__menu"
        :disabled="!availableOptions.length"
        @command="onAddEvent"
      >
        <GrowButton
          size="small"
          type="primary"
          plain
          :disabled="!availableOptions.length"
          title="添加事件"
        >
          <GrowIconify icon="carbon:add" :size="14" />
          添加事件
        </GrowButton>
        <template #dropdown>
          <GrowDropdownMenu>
            <GrowDropdownItem
              v-for="option in availableOptions"
              :key="option.type"
              :command="option.type"
              :title="option.describe || option.type"
            >
              <div class="event-config__option">
                <span class="event-config__option-label">{{ option.label }}</span>
                <span class="event-config__option-type">{{ option.type }}</span>
              </div>
            </GrowDropdownItem>
          </GrowDropdownMenu>
        </template>
      </GrowDropdown>
    </div>

    <p v-if="!configuredList.length" class="event-config__empty">
      {{
        eventOptionsOverride?.length
          ? '暂无页面事件。可添加 onMounted 等生命周期。'
          : '暂无事件。点击右上角添加，每个事件只能配置一次。'
      }}
    </p>

    <div
      v-for="item in configuredList"
      :key="item.eventType"
      class="event-config__card"
    >
      <div class="event-config__card-head">
        <div class="event-config__card-meta">
          <span class="event-config__card-name">{{ item.name }}</span>
          <span class="event-config__card-type">
            {{ labelOf(item.eventType) }} · {{ item.eventType }}
          </span>
        </div>
        <div class="event-config__card-actions">
          <span class="event-config__enabled-label">启用绑定</span>
          <GrowSwitch
            size="small"
            :model-value="isEventEnabled(item)"
            @update:model-value="(v) => onToggleEnabled(item.eventType, v)"
          />
          <GrowButton text size="small" title="编辑" @click="onEdit(item)">
            <GrowIconify icon="carbon:edit" :size="14" />
          </GrowButton>
          <GrowButton
            text
            size="small"
            type="danger"
            title="删除"
            @click="onRemove(item.eventType)"
          >
            <GrowIconify icon="carbon:trash-can" :size="14" />
          </GrowButton>
        </div>
      </div>
      <pre class="event-config__preview">{{ previewCode(item) }}</pre>
    </div>

    <EventEditDialog
      v-model:visible="dialogVisible"
      :event-label="editingLabel"
      :model-value="editingItem"
      @confirm="onDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue'
import {
  defaultEventHandlerName,
  getComponentEventOptions,
} from '../../static/elementEvents'
import type { DesignerEventItem } from '../../static/elementEvents/types'
import { isEventEnabled } from '../../static/elementEvents/types'
import EventEditDialog from './EventEditDialog.vue'

defineOptions({ name: 'eventConfig' })

const props = defineProps({
  activeUUID: {
    type: String,
    default: '',
  },
  currentBasicConfig: {
    type: Object,
    default: () => ({}),
  },
  currentEventsConfig: {
    type: Object,
    default: () => ({}),
  },
  /** 覆盖组件事件清单（如页面生命周期） */
  eventOptionsOverride: {
    type: Array,
    default: undefined,
  },
})
const emit = defineEmits<{
  'update:currentEventsConfig': [value: Record<string, DesignerEventItem>]
}>()

const { currentBasicConfig, currentEventsConfig, eventOptionsOverride } = toRefs(props)

const dialogVisible = ref(false)
const editingItem = reactive<DesignerEventItem>({
  name: 'onClick',
  eventType: 'click',
  code: '',
  enabled: false,
})
const editingLabel = ref('')

const eventOptions = computed(() => {
  if (eventOptionsOverride.value?.length) return eventOptionsOverride.value
  return getComponentEventOptions(currentBasicConfig.value?.elTagName)
})

const configuredMap = computed(
  () => (currentEventsConfig.value || {}) as Record<string, DesignerEventItem>,
)

const configuredList = computed(() =>
  Object.values(configuredMap.value).filter(
    (item) => item && item.eventType,
  ),
)

const availableOptions = computed(() =>
  eventOptions.value.filter((opt) => !configuredMap.value[opt.type]),
)

const labelOf = (eventType: string) =>
  eventOptions.value.find((item) => item.type === eventType)?.label || eventType

const previewCode = (item: DesignerEventItem) => {
  const body = String(item.code || '').trim()
  if (!body) return '// 空函数体'
  return body.length > 160 ? `${body.slice(0, 160)}…` : body
}

const commit = (next: Record<string, DesignerEventItem>) => {
  emit('update:currentEventsConfig', next)
}

const onAddEvent = (eventType: string) => {
  if (!eventType || configuredMap.value[eventType]) return
  const option = eventOptions.value.find((item) => item.type === eventType)
  const nextItem: DesignerEventItem = {
    name: defaultEventHandlerName(eventType),
    eventType,
    code: '',
    enabled: false,
  }
  commit({
    ...configuredMap.value,
    [eventType]: nextItem,
  })
  Object.assign(editingItem, nextItem)
  editingLabel.value = option?.label || eventType
  dialogVisible.value = true
}

const onEdit = (item: DesignerEventItem) => {
  Object.assign(editingItem, {
    name: item.name,
    eventType: item.eventType,
    code: item.code ?? '',
    enabled: isEventEnabled(item),
  })
  editingLabel.value = labelOf(item.eventType)
  dialogVisible.value = true
}

const onDialogConfirm = (value: DesignerEventItem) => {
  const eventType = value.eventType
  if (!eventType) return
  commit({
    ...configuredMap.value,
    [eventType]: { ...value, eventType },
  })
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
}
</script>

<style scoped lang="scss">
.event-config {
  height: 100%;
  padding: 10px 12px 16px;
}

.event-config__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.event-config__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.event-config__empty {
  margin: 24px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}

.event-config__card {
  margin-bottom: 10px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--layout-container-background-color, #fff);
}

.event-config__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--layout-background-color, #f5f7fa);
}

.event-config__card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.event-config__card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.event-config__card-type {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.event-config__card-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.event-config__enabled-label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.event-config__preview {
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

<!-- 下拉挂到 body，需非 scoped 样式 -->
<style lang="scss">
.event-config__menu {
  min-width: 200px !important;
}

.event-config__menu .el-dropdown-menu,
.event-config__menu.el-dropdown-menu {
  min-width: 200px !important;
  padding: 4px 0 !important;
}

.event-config__menu .event-config__option {
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

.event-config__menu .event-config__option-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color, #303133);
  text-align: left;
}

.event-config__menu .event-config__option-type {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-color-secondary, #909399);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-align: right;
}

/* Element Plus */
.event-config__menu .el-dropdown-menu__item {
  display: flex !important;
  align-items: center;
  justify-content: stretch;
  height: auto !important;
  padding: 7px 12px !important;
  line-height: 1.2 !important;
  text-align: left !important;
}

/* Naive UI：popper-class 落在外层 */
.event-config__menu .n-dropdown-menu {
  min-width: 200px;
  padding: 4px 0;
}

.event-config__menu .n-dropdown-option-body {
  padding: 7px 12px !important;
  text-align: left !important;
}

.event-config__menu .n-dropdown-option-body__label {
  width: 100% !important;
  text-align: left !important;
}
</style>
