<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

defineOptions({ name: 'Ellipsis', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    lineClamp?: number | string
    expandTrigger?: 'click' | string
    tooltip?: boolean | Record<string, unknown>
  }>(),
  {
    tooltip: true,
  },
)

const attrs = useAttrs()

const clamp = computed(() => {
  if (props.lineClamp == null || props.lineClamp === '') return undefined
  const n = Number(props.lineClamp)
  return Number.isFinite(n) && n > 0 ? n : undefined
})

const rootStyle = computed(() => {
  const style: Record<string, string> = {
    display: clamp.value && clamp.value > 1 ? '-webkit-box' : 'inline-block',
    overflow: 'hidden',
    maxWidth: '100%',
    verticalAlign: 'bottom',
  }
  if (clamp.value && clamp.value > 1) {
    style.webkitBoxOrient = 'vertical'
    style.webkitLineClamp = String(clamp.value)
    style.wordBreak = 'break-word'
    style.width = '100%'
  } else {
    style.textOverflow = 'ellipsis'
    style.whiteSpace = 'nowrap'
  }
  if (props.expandTrigger === 'click') {
    style.cursor = 'pointer'
  }
  return style
})

const title = computed(() => {
  if (props.tooltip === false) return undefined
  const slotText = typeof attrs.title === 'string' ? attrs.title : undefined
  return slotText
})
</script>

<template>
  <span
    class="grow-ellipsis"
    v-bind="attrs"
    :style="rootStyle"
    :title="title"
  >
    <slot />
  </span>
</template>
