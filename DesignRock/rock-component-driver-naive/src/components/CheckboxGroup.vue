<template>
  <NCheckboxGroup v-bind="groupAttrs">
    <slot>
      <NSpace v-if="normalizedOptions.length">
        <NCheckbox
          v-for="item in normalizedOptions"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
        />
      </NSpace>
    </slot>
  </NCheckboxGroup>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { NCheckbox, NCheckboxGroup, NSpace } from 'naive-ui'

defineOptions({ name: 'CheckboxGroup', inheritAttrs: false })

const props = defineProps<{
  options?: Array<{ label: string; value: string | number | boolean }>
}>()

const attrs = useAttrs()
const groupAttrs = computed(() => {
  const { options: _options, ...rest } = attrs as Record<string, unknown>
  return rest
})

const normalizedOptions = computed(() =>
  Array.isArray(props.options) ? props.options : [],
)
</script>
