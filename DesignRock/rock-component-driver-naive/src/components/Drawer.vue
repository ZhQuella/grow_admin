<template>
  <NDrawer v-model:show="model" v-bind="$attrs">
    <NDrawerContent v-if="hasChromeSlots">
      <slot />
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </NDrawerContent>
    <slot v-else />
  </NDrawer>
</template>
<script lang="ts" setup>
import { computed, useSlots } from 'vue'
import { NDrawer, NDrawerContent } from 'naive-ui'

defineOptions({ name: 'Drawer' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const slots = useSlots()
const hasChromeSlots = computed(() => Boolean(slots.footer || slots.header))

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
