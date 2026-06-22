<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import SettingPanel from './SettingPanel.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    size?: number
  }>(),
  {
    modelValue: false,
    size: 400,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const drawerTitle = computed(() => props.title ?? t('layout.setting.title'))
</script>

<template>
  <GrowDrawer v-model="model" :title="drawerTitle" :size="size" append-to-body>
    <SettingPanel @close="model = false" />
  </GrowDrawer>
</template>
