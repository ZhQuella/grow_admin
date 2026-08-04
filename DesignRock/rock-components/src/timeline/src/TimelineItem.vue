<script lang="ts" setup>
import {
  computed,
  defineComponent,
  h,
  markRaw,
  ref,
  useAttrs,
  useSlots,
} from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import GrowIconify from '../../iconify/src/Iconify.vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.TimelineItem,
  inheritAttrs: false,
})

const TimelineItem = useDriverComponent(RockComponent.TimelineItem)
const attrs = useAttrs()
const slots = useSlots()

/** 配置态多为 Iconify 名（如 carbon:checkmark）；底层 EP 需要 Component */
const iconName = computed(() => {
  const icon = attrs.icon
  return typeof icon === 'string' && icon.trim() ? icon.trim() : ''
})

const driverKind = computed(() => {
  const name = String(
    (TimelineItem as { name?: string; __name?: string } | undefined)?.name ||
      (TimelineItem as { __name?: string } | undefined)?.__name ||
      '',
  )
  if (name.includes('ElTimeline') || name === 'ElTimelineItem') return 'ep'
  if (name.startsWith('A') || name.includes('Ant')) return 'antd'
  return 'naive'
})

const epIconComponent = computed(() => {
  const name = iconName.value
  if (!name) {
    const raw = attrs.icon
    return raw && typeof raw !== 'string' ? raw : undefined
  }
  return markRaw(
    defineComponent({
      name: 'GrowTimelineItemIcon',
      setup: () => () => h(GrowIconify, { icon: name, size: 14 }),
    }),
  )
})

const boundAttrs = computed(() => {
  const { icon: _icon, ...rest } = attrs as Record<string, unknown>
  if (driverKind.value === 'ep' && epIconComponent.value) {
    return { ...rest, icon: epIconComponent.value }
  }
  // Naive / Ant Design 走插槽，避免把字符串 icon 落到 DOM
  return rest
})

const showIconSlot = computed(
  () => Boolean(iconName.value) && !slots.icon && driverKind.value === 'naive',
)

const showDotSlot = computed(
  () => Boolean(iconName.value) && !slots.dot && driverKind.value === 'antd',
)
</script>
<template>
  <component :is="TimelineItem" v-bind="boundAttrs" :ref="DriverRefKey">
    <template v-if="showIconSlot" #icon>
      <GrowIconify :icon="iconName" :size="14" />
    </template>
    <template v-if="showDotSlot" #dot>
      <GrowIconify :icon="iconName" :size="14" />
    </template>
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>
