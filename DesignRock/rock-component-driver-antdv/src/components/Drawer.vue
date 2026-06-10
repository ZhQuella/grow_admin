<template>
  <ADrawer v-model:open="model" v-bind="$attrs">
    <slot />
  </ADrawer>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { Drawer as ADrawer } from 'ant-design-vue'

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

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
