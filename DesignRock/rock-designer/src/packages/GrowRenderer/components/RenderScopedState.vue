<script setup lang="ts">
/** 为循环子树注入带 item / index 的 runtime state */
import { inject, provide, reactive, watch } from 'vue'
import { GROW_RUNTIME_STATE } from '../../GrowDesigner/config/designation'
import { applyLoopScopeToState } from '../../GrowDesigner/static/loopScope'

defineOptions({ name: 'RenderScopedState' })

const props = defineProps<{
  extra?: Record<string, unknown>
}>()

const parentState = inject<Record<string, unknown> | null>(GROW_RUNTIME_STATE, null)
const scopedState = reactive<Record<string, unknown>>({})

watch(
  () => [parentState, props.extra] as const,
  () => applyLoopScopeToState(scopedState, parentState, props.extra || {}),
  { immediate: true, deep: true },
)

provide(GROW_RUNTIME_STATE, scopedState)
</script>

<template>
  <slot />
</template>
