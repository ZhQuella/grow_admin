<template>
  <div class="grow-code-sandbox flex h-full min-h-0 flex-col overflow-hidden">
    <GrowWatchBox class="min-h-0 flex-1 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div class="box-border min-h-full p-2">
            <slot name="preview">
              <div v-if="compileError" class="rounded bg-layout p-3 text-sm" style="color: #d03050">
                {{ compileError }}
              </div>
              <component :is="previewComponent" v-else-if="previewComponent" />
              <p v-else class="m-0 text-sm text-text-secondary">请在左侧编辑 Vue SFC 以预览</p>
            </slot>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { RockScrollbar as GrowScrollbar } from '@grow-admin-rock/components/scrollbar'
import { createPreviewComponent, resolveActiveExpose } from '#/runtime'
import type { CodeDependency, CodeLanguage, SandboxExpose } from '#/types'
import type { Component } from 'vue'

defineOptions({
  name: 'GrowCodeSandbox',
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: CodeLanguage
    expose?: SandboxExpose
    dependencies?: CodeDependency[]
  }>(),
  {
    modelValue: '',
    language: 'vue',
    expose: () => ({}),
    dependencies: () => [],
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const instance = getCurrentInstance()
const previewComponent = ref<Component | null>(null)
const compileError = ref<string | null>(null)

const hostComponents = computed(
  () => (instance?.appContext.components ?? {}) as Record<string, Component>,
)

const activeExpose = computed(() =>
  resolveActiveExpose(props.expose, props.dependencies, hostComponents.value),
)

function rebuild() {
  const { component, error } = createPreviewComponent(props.modelValue, activeExpose.value)
  previewComponent.value = component
  compileError.value = error
}

watch(
  () => [props.modelValue, activeExpose.value] as const,
  () => rebuild(),
  { immediate: true, deep: true },
)
</script>
