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
      :style="styleInfo"
    >
      <span v-if="config.elTagName === 'GrowButton'">{{ propsInfo.content }}</span>
      <span v-else-if="config.elTagName === 'GrowLink'">{{ propsInfo.content }}</span>
      <template v-else-if="config.elTagName === 'GrowEllipsis'">{{ propsInfo.content }}</template>
    </component>
  </template>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

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

const isUnsupported = computed(() => Boolean(config.value.unsupported))

const isSocket = computed(() => {
  const slotMap = ['GrowCard', 'GrowTabs', 'GrowRow']
  return slotMap.includes(config.value.elTagName)
})

const bindProps = computed(() => {
  const info = { ...(propsInfo.value || {}) }
  if (['GrowButton', 'GrowLink', 'GrowEllipsis'].includes(config.value?.elTagName)) {
    Reflect.deleteProperty(info, 'content')
  }
  // Naive UI Ellipsis：空的 expand-trigger 表示不启用点击展开
  if (config.value?.elTagName === 'GrowEllipsis') {
    if (info['expand-trigger'] === '' || info['expand-trigger'] == null) {
      Reflect.deleteProperty(info, 'expand-trigger')
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
  // Naive UI TreeSelect：options + value；Element Plus 兼容 data（key → value）
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
  // Naive UI Mention：value + separator；Element Plus 兼容 modelValue + split
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
  // Naive UI Time：保证 time / to 为可用的数字时间戳
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
