<template>
  <!-- 不要把 options 透传给 ElSelect，否则会与 ElOption 插槽冲突 -->
  <ElSelect v-bind="selectAttrs">
    <ElOption
      v-for="item in options"
      :key="String(item.value)"
      :label="item.label"
      :value="item.value"
    >
      <div v-if="item.description" class="grow-select-option">
        <span class="grow-select-option__label">{{ item.label }}</span>
        <span class="grow-select-option__desc">{{ item.description }}</span>
      </div>
      <template v-else>{{ item.label }}</template>
    </ElOption>
  </ElSelect>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { ElSelect, ElOption } from 'element-plus'

defineOptions({ name: 'ElSelect' })

type SelectOption = {
  label: string
  value: string | number | boolean
  description?: string
}

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

<style scoped>
.grow-select-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
  line-height: 1.3;
}

.grow-select-option__label {
  color: var(--el-text-color-primary);
  font-size: 13px;
}

.grow-select-option__desc {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  white-space: normal;
}
</style>
