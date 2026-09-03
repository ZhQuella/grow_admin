<script setup lang="ts">
import { computed, ref } from 'vue'
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
const settingPanelRef = ref<InstanceType<typeof SettingPanel>>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const drawerTitle = computed(() => props.title ?? t('layout.setting.title'))

function handleReset() {
  settingPanelRef.value?.resetConfig()
}
</script>

<template>
  <GrowDrawer
    v-model="model"
    class="setting-drawer"
    :title="drawerTitle"
    :size="size"
    append-to-body
  >
    <GrowWatchBox class="h-full overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <SettingPanel ref="settingPanelRef" />
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <div class="flex justify-end gap-2">
        <GrowButton @click="handleReset">{{ t('layout.setting.reset') }}</GrowButton>
        <GrowButton type="primary" @click="model = false">{{ t('layout.setting.close') }}</GrowButton>
      </div>
    </template>
  </GrowDrawer>
</template>

<style>
.setting-drawer .el-drawer__body,
.setting-drawer .n-drawer-body,
.setting-drawer .ant-drawer-body {
  overflow: hidden;
}
</style>
