<template>
  <!-- 不要把 options 透传给 ElSelect，否则会与 ElOption 插槽冲突 -->
  <ElSelect v-bind="selectAttrs">
    <ElOption
      v-for="item in options"
      :key="String(item.value)"
      :label="item.label"
      :value="item.value"
    />
  </ElSelect>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { ElSelect, ElOption } from 'element-plus'

defineOptions({ name: 'ElSelect' })

type SelectOption = { label: string; value: string | number | boolean }

const attrs = useAttrs()

const options = computed<SelectOption[]>(() => {
  const raw = attrs.options
  return Array.isArray(raw) ? (raw as SelectOption[]) : []
})

const selectAttrs = computed(() => {
  const { options: _options, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
