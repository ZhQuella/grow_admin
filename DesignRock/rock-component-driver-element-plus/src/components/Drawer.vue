<template>
  <ElDrawer v-model="model" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </ElDrawer>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { ElDrawer } from 'element-plus'

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
