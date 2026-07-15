<template>
  <div class="grow-code-deps flex h-full min-h-0 flex-col">
    <div class="mb-2 flex shrink-0 items-center justify-between gap-2 p-[10px]">
      <slot name="title">
        <span class="text-sm font-medium text-text">依赖注入</span>
      </slot>
    </div>

    <GrowWatchBox class="min-h-0 flex-1 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <ul v-if="displayList.length" class="m-0 list-none p-2">
            <li
              v-for="(item, index) in displayList"
              :key="`${item.source ?? 'npm'}-${item.name}-${index}`"
              class="mb-1 flex items-center justify-between gap-2 rounded bg-layout px-2 py-1.5 text-sm text-text"
            >
              <label
                class="flex min-w-0 flex-1 items-center gap-2 truncate"
                :class="item.locked ? 'cursor-default opacity-90' : 'cursor-pointer'"
              >
                <input
                  type="checkbox"
                  :checked="item.locked || item.enabled !== false"
                  :disabled="Boolean(item.locked)"
                  @change="onToggle(index, ($event.target as HTMLInputElement).checked)"
                >
                <span class="truncate">{{ item.name }}</span>
                <span
                  v-if="item.locked"
                  class="shrink-0 rounded bg-component px-1 text-xs text-text-secondary"
                >默认</span>
                <span v-if="item.version" class="text-text-secondary">@{{ item.version }}</span>
                <span
                  v-if="item.kind || item.source"
                  class="rounded bg-component px-1 text-xs text-text-secondary"
                >{{ item.kind || item.source }}</span>
              </label>
            </li>
          </ul>
          <p v-else class="m-0 px-2 text-sm text-text-secondary">暂无宿主注入依赖</p>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { RockScrollbar as GrowScrollbar } from '@grow-admin-rock/components/scrollbar'
import type { CodeDependency } from '#/types'
import {
  DEFAULT_SANDBOX_DEPENDENCIES,
  normalizeDependencies,
} from '#/runtime/defaultDependencies'

defineOptions({
  name: 'GrowCodeDeps',
})

const props = withDefaults(
  defineProps<{
    modelValue?: CodeDependency[]
    /** 默认锁定依赖，不可取消 / 删除 */
    defaultDependencies?: CodeDependency[]
  }>(),
  {
    modelValue: () => [],
    defaultDependencies: () => DEFAULT_SANDBOX_DEPENDENCIES,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: CodeDependency[]]
  change: [value: CodeDependency[]]
}>()

const displayList = computed(() =>
  normalizeDependencies(props.modelValue, props.defaultDependencies),
)

function emitNormalized(list: CodeDependency[]) {
  const next = normalizeDependencies(list, props.defaultDependencies)
  emit('update:modelValue', next)
  emit('change', next)
}

function onToggle(index: number, enabled: boolean) {
  const current = displayList.value
  const target = current[index]
  if (!target || target.locked) return
  const next = current.map((item, i) =>
    i === index ? { ...item, enabled } : item,
  )
  emitNormalized(next)
}

watch(
  displayList,
  (list) => {
    const sameLength = list.length === props.modelValue.length
    const sameLocked =
      sameLength
      && list.every((item, i) => {
        const prev = props.modelValue[i]
        return (
          prev
          && prev.name === item.name
          && Boolean(prev.locked) === Boolean(item.locked)
          && (prev.enabled !== false) === (item.enabled !== false)
        )
      })
    if (!sameLocked) {
      emit('update:modelValue', list)
    }
  },
  { immediate: true },
)
</script>
