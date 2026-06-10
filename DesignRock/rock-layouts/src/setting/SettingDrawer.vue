<script setup lang="ts">
import { computed } from 'vue'
import SettingPanel from './SettingPanel.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    size?: number
  }>(),
  {
    modelValue: false,
    title: '项目配置',
    size: 320,
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

<template>
  <GrowDrawer v-model="model" :title="title" :size="size" append-to-body>
    <SettingPanel @close="model = false" />
  </GrowDrawer>
</template>
