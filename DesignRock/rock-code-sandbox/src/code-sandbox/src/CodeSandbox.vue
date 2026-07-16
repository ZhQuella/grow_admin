<template>
  <div class="grow-code-sandbox flex h-full min-h-0 flex-col overflow-hidden">
    <GrowWatchBox class="min-h-0 flex-1 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div :style="{ height: `${height}px` }">
            <slot name="preview">
              <div v-if="compileError" class="rounded bg-layout p-3 text-sm" style="color: #d03050">
                {{ compileError }}
              </div>
              <p v-else-if="loadingNpm" class="m-0 text-sm text-text-secondary">正在加载 npm 依赖…</p>
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
import {
  createPreviewComponent,
  resolveActiveExpose,
  resolveNpmDependencies,
} from '#/runtime'
import type { SandboxFiles } from '#/runtime'
import type { CodeDependency, SandboxExpose } from '#/types'
import type { Component } from 'vue'

defineOptions({
  name: 'GrowCodeSandbox',
})

const props = withDefaults(
  defineProps<{
    /** 单文件模式源码；多文件模式下作为 entry 内容的兼容字段（优先 files） */
    modelValue?: string
    /** 虚拟多文件（key 如 App.vue、utils.js） */
    files?: SandboxFiles
    /** 预览入口，默认 App.vue */
    entry?: string
    expose?: SandboxExpose
    dependencies?: CodeDependency[]
  }>(),
  {
    modelValue: '',
    files: undefined,
    entry: 'App.vue',
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
const loadingNpm = ref(false)
let rebuildToken = 0

const hostComponents = computed(
  () => (instance?.appContext.components ?? {}) as Record<string, Component>,
)

async function rebuild() {
  const token = ++rebuildToken
  loadingNpm.value = true
  compileError.value = null

  try {
    const base = resolveActiveExpose(
      props.expose,
      props.dependencies,
      hostComponents.value,
    )
    const npmExpose = await resolveNpmDependencies(props.dependencies)
    if (token !== rebuildToken) return

    const merged: SandboxExpose = {
      ...base,
      modules: {
        ...(base.modules ?? {}),
        ...npmExpose.modules,
      },
      apis: {
        ...(base.apis ?? {}),
        ...npmExpose.apis,
      },
    }

    const hasFiles = props.files && Object.keys(props.files).length > 0
    const entry = props.entry || 'App.vue'
    const source = hasFiles ? (props.files?.[entry] ?? props.modelValue) : props.modelValue

    const { component, error } = createPreviewComponent(source, merged, {
      files: hasFiles ? props.files : undefined,
      entry,
    })
    if (token !== rebuildToken) return
    previewComponent.value = component
    compileError.value = error
  } catch (e) {
    if (token !== rebuildToken) return
    previewComponent.value = null
    compileError.value = e instanceof Error ? e.message : String(e)
  } finally {
    if (token === rebuildToken) {
      loadingNpm.value = false
    }
  }
}

watch(
  () => [props.modelValue, props.files, props.entry, props.expose, props.dependencies] as const,
  () => {
    void rebuild()
  },
  { immediate: true, deep: true },
)
</script>
