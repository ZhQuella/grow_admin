<template>
  <div class="box-border px-3 py-3">
    <GrowForm
      label-width="72px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <GrowFormItem label="区块标题">
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
      </GrowFormItem>
    </GrowForm>
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
