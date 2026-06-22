<template>
  <NDrawer v-model:show="model" v-bind="$attrs">
    <slot />
  </NDrawer>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { NDrawer } from 'naive-ui'

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
