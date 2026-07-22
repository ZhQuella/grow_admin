<template>
  <NRadioGroup v-bind="groupAttrs">
    <slot>
      <NSpace v-if="normalizedOptions.length">
        <NRadio
          v-for="item in normalizedOptions"
          :key="String(item.value)"
          :value="item.value"
        >
          {{ item.label }}
        </NRadio>
      </NSpace>
    </slot>
  </NRadioGroup>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { NRadio, NRadioGroup, NSpace } from 'naive-ui'

defineOptions({ name: 'RadioGroup', inheritAttrs: false })

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
