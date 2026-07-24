<template>
  <div class="box-border flex flex-col px-[10px] gap-3">
    <div class="flex flex-col gap-1.5">
      <span class="text-xs text-text-secondary">区块标题</span>
      <div class="flex min-w-0 items-center gap-2">
        <GrowSwitch
          :model-value="item.showTitle"
          size="small"
          @update:model-value="onShowTitleChange"
        />
        <GrowInput
          class="min-w-0 flex-1"
          :model-value="item.title"
          size="small"
          placeholder="请输入标题"
          clearable
          :disabled="!item.showTitle"
          @update:model-value="onTitleChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportLayoutItem } from '../static/layout'

defineOptions({
  name: 'BasicConfigPanel',
})

defineProps<{
  item: ReportLayoutItem
}>()

const emit = defineEmits<{
  change: [patch: Partial<Pick<ReportLayoutItem, 'title' | 'showTitle'>>]
}>()

const onShowTitleChange = (value: boolean) => {
  emit('change', { showTitle: value })
}

const onTitleChange = (value: string | number | null) => {
  emit('change', { title: String(value ?? '') })
}
</script>
