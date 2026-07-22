<template>
  <template v-if="!isSocket">
    <div
      v-if="isUnsupported"
      class="designer-unsupported"
    >
      {{ config.elName || config.elTagName }}（暂未接入）
    </div>
    <component
      v-else-if="config.elTagName"
      :is="config.elTagName"
      v-bind="bindProps"
      :key="moduleRenderKey"
      :class="{ 'w-full': isFormFullWidth }"
      :style="styleInfo"
    >
      <span v-if="config.elTagName === 'GrowButton'">{{ propsInfo.content }}</span>
      <span v-else-if="config.elTagName === 'GrowLink'">{{ propsInfo.content }}</span>
      <template v-else-if="config.elTagName === 'GrowEllipsis'">{{ propsInfo.content }}</template>
      <TableColumnNodes
        v-else-if="config.elTagName === 'GrowTable'"
        :columns="propsInfo.columns || []"
      />
    </component>
  </template>
</template>

<script setup lang="ts">
import { computed, inject, toRefs } from 'vue'
import { FORM_MODULE_FULL_WIDTH_TAGS } from '../../../../static/moduleMap'
import {
  LAYOUT_MAIN_SIZE,
  type LayoutMainSize,
} from '../../../../config/designation'
import { tableColumnsSignature } from '../../../../static/tableColumnUtils'
import TableColumnNodes from '../../../shared/TableColumnNodes.vue'

interface PropsType {
  config: any
  propsInfo: any
  styleInfo?: Record<string, any>
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({}),
  styleInfo: () => ({}),
})

const { config, propsInfo, styleInfo } = toRefs(props)

const layoutMainSize = inject<LayoutMainSize | null>(LAYOUT_MAIN_SIZE, null)

const isUnsupported = computed(() => Boolean(config.value.unsupported))

const isFormFullWidth = computed(() =>
  FORM_MODULE_FULL_WIDTH_TAGS.has(config.value?.elTagName),
)

/** 表格列配置变化时强制重建，确保 align / fixed 等列属性生效 */
const moduleRenderKey = computed(() => {
  if (config.value?.elTagName !== 'GrowTable') {
    return config.value?.elTagName || 'module'
  }
  return `GrowTable:${tableColumnsSignature(propsInfo.value?.columns)}`
})

const isSocket = computed(() => {
  const slotMap = [
    'GrowCard',
    'GrowTabs',
    'GrowRow',
    'GrowScrollbar',
    'GrowTooltip',
    'GrowPopover',
    'GrowModal',
    'GrowDrawer',
    'GrowLayout',
    'GrowUpload',
  ]
  return slotMap.includes(config.value.elTagName)
})

const bindProps = computed(() => {
  const info = { ...(propsInfo.value || {}) }
  // 设计器表单字段名，不透传给底层组件
  Reflect.deleteProperty(info, 'model')
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')
  if (['GrowButton', 'GrowLink', 'GrowEllipsis'].includes(config.value?.elTagName)) {
    Reflect.deleteProperty(info, 'content')
  }
  if (config.value?.elTagName === 'GrowEllipsis') {
    if (info['expand-trigger'] === '' || info['expand-trigger'] == null) {
      Reflect.deleteProperty(info, 'expand-trigger')
    }
  }
  if (config.value?.elTagName === 'GrowUpload') {
    if (
      info.modelValue != null &&
      (info['file-list'] == null || info['file-list'] === '')
    ) {
      info['file-list'] = info.modelValue
    }
    if (
      info.modelValue != null &&
      (info.fileList == null || info.fileList === '')
    ) {
      info.fileList = info.modelValue
    }
  }
  if (config.value?.elTagName === 'GrowCalendar') {
    const start = info['range-start']
    const end = info['range-end']
    Reflect.deleteProperty(info, 'range-start')
    Reflect.deleteProperty(info, 'range-end')
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        info.range = [startDate, endDate]
      }
    }
    if (typeof info.modelValue === 'string' && info.modelValue) {
      const date = new Date(info.modelValue)
      if (!Number.isNaN(date.getTime())) {
        info.modelValue = date
      }
    }
  }
  if (config.value?.elTagName === 'GrowTreeSelect') {
    if (info.options && !info.data) {
      const mapNodes = (nodes: any[]): any[] =>
        (nodes || []).map((node) => ({
          ...node,
          value: node.value ?? node.key,
          children: node.children ? mapNodes(node.children) : undefined,
        }))
      info.data = mapNodes(info.options)
    }
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
  }
  if (config.value?.elTagName === 'GrowMention') {
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
    if (info.split === undefined && info.separator !== undefined) {
      info.split = info.separator
    }
  }
  if (config.value?.elTagName === 'GrowTimePicker') {
    if (info.value === undefined && info.modelValue !== undefined) {
      info.value = info.modelValue
    }
    if (info.modelValue === undefined && info.value !== undefined) {
      info.modelValue = info.value
    }
    if (info['time-zone'] === '' || info['time-zone'] == null) {
      Reflect.deleteProperty(info, 'time-zone')
    }
    if (info.timeZone === '' || info.timeZone == null) {
      Reflect.deleteProperty(info, 'timeZone')
    }
  }
  if (config.value?.elTagName === 'GrowTime') {
    const coerceTime = (raw: unknown) => {
      if (raw == null || raw === '') return undefined
      if (raw instanceof Date) return raw.getTime()
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw
      const num = Number(String(raw).trim())
      return Number.isNaN(num) ? undefined : num
    }
    const time = coerceTime(info.time)
    const to = coerceTime(info.to)
    if (time !== undefined) info.time = time
    else Reflect.deleteProperty(info, 'time')
    if (to !== undefined) info.to = to
    else Reflect.deleteProperty(info, 'to')
    if (info['time-zone'] === '' || info['time-zone'] == null) {
      Reflect.deleteProperty(info, 'time-zone')
    }
    if (info.timeZone === '' || info.timeZone == null) {
      Reflect.deleteProperty(info, 'timeZone')
    }
  }
  // 设计器：表格真实子树可 inject 主区域高度
  if (config.value?.elTagName === 'GrowTable') {
    Reflect.deleteProperty(info, 'fitLayoutMainHeight')
    Reflect.deleteProperty(info, 'columns')
    if (info.height === 'layout-main' || propsInfo.value?.fitLayoutMainHeight) {
      Reflect.deleteProperty(info, 'height')
      if (layoutMainSize && layoutMainSize.height > 0) {
        info.height = layoutMainSize.height
      }
    }
  }
  return info
})
</script>

<style scoped>
.designer-unsupported {
  padding: 12px 8px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style>
