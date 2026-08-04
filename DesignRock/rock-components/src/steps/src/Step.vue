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
  name: RockComponent.Step,
  inheritAttrs: false,
})

const Step = useDriverComponent(RockComponent.Step)
const attrs = useAttrs()
const slots = useSlots()

const iconName = computed(() => {
  const icon = attrs.icon
  return typeof icon === 'string' && icon.trim() ? icon.trim() : ''
})

const driverKind = computed(() => {
  const name = String(
    (Step as { name?: string; __name?: string } | undefined)?.name ||
      (Step as { __name?: string } | undefined)?.__name ||
      '',
  )
  if (name.includes('ElStep') || name === 'ElStep') return 'ep'
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
      name: 'GrowStepIcon',
      setup: () => () => h(GrowIconify, { icon: name, size: 14 }),
    }),
  )
})

const boundAttrs = computed(() => {
  const { icon: _icon, name: _name, ...rest } = attrs as Record<string, unknown>
  if (rest.status === '' || rest.status == null) {
    Reflect.deleteProperty(rest, 'status')
  }
  if (driverKind.value === 'ep' && epIconComponent.value) {
    return { ...rest, icon: epIconComponent.value }
  }
  return rest
})

const showIconSlot = computed(
  () => Boolean(iconName.value) && !slots.icon && driverKind.value !== 'ep',
)
</script>

<template>
  <component :is="Step" v-bind="boundAttrs" :ref="DriverRefKey">
    <template v-if="showIconSlot" #icon>
      <GrowIconify :icon="iconName" :size="14" />
    </template>
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>
