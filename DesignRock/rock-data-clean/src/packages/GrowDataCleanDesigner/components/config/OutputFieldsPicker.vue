<template>
  <div class="clean-fields-picker">
    <div class="mb-2 flex items-center justify-between gap-2">
      <span class="text-xs font-medium text-text">{{ title }}</span>
      <div class="flex items-center gap-1">
        <GrowButton text size="small" :disabled="!candidates.length" @click="selectAll">
          全选
        </GrowButton>
        <GrowButton text size="small" :disabled="!candidates.length" @click="clearAll">
          清空
        </GrowButton>
      </div>
    </div>

    <p class="mb-2 mt-0 text-[11px] text-text-secondary">
      {{ hint }}
    </p>

    <div
      v-if="!candidates.length"
      class="rounded border border-dashed border-border px-2.5 py-4 text-center text-xs text-text-secondary"
    >
      {{ emptyText }}
    </div>

    <div v-else class="flex flex-col gap-0.5">
      <label
        v-for="item in candidates"
        :key="item.key"
        class="clean-fields-picker__option"
      >
        <GrowCheckbox
          :model-value="isSelected(item.key)"
          @update:model-value="(v) => onToggle(item.key, Boolean(v))"
        />
        <span class="min-w-0 flex-1 truncate" :title="item.key">
          {{ item.title || item.key }}
        </span>
        <span
          v-if="item.dataType"
          class="shrink-0 text-[11px] text-text-secondary"
        >
          {{ item.dataType }}
        </span>
      </label>
    </div>

    <div class="mt-2 text-[11px] text-text-secondary">
      已选 {{ selectedCount }} / {{ candidates.length }}
      <template v-if="isAllMode"> · 默认全部</template>
      <template v-else-if="!selectedCount"> · 未选字段</template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type CleanFieldCandidate = {
  key: string
  title?: string
  dataType?: string
}

/**
 * 输出字段选择：
 * - `null` / `undefined` = 默认全部
 * - `[]` = 明确不输出任何字段
 * - `string[]` = 仅这些字段
 */
export type CleanFieldsSelection = string[] | null | undefined

defineOptions({
  name: 'CleanOutputFieldsPicker',
})

const props = withDefaults(
  defineProps<{
    modelValue: CleanFieldsSelection
    candidates: CleanFieldCandidate[]
    title?: string
    hint?: string
    emptyText?: string
  }>(),
  {
    title: '输出字段',
    hint: '勾选要输出的字段；未配置时默认全部，也可全部取消。',
    emptyText: '暂无可用字段（请先连接上游或选择数据表）',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[] | null]
}>()

const candidateKeys = computed(() =>
  (props.candidates || []).map((item) => item.key).filter(Boolean),
)

/** 未配置（null/undefined）视为默认全选；空数组是用户清空 */
const isAllMode = computed(() => props.modelValue == null)

const selectedSet = computed(() => {
  if (isAllMode.value) return new Set(candidateKeys.value)
  return new Set((props.modelValue || []).filter(Boolean))
})

const selectedCount = computed(() =>
  candidateKeys.value.filter((key) => selectedSet.value.has(key)).length,
)

function isSelected(key: string) {
  return selectedSet.value.has(key)
}

function emitSelection(keys: string[]) {
  const all = candidateKeys.value
  const next = keys.filter((key) => all.includes(key))
  const sameAsAll =
    next.length === all.length && all.every((key) => next.includes(key))
  // 勾回全部 → 回到默认（null）；清空 → []；其余显式列表
  emit('update:modelValue', sameAsAll ? null : next)
}

function onToggle(key: string, checked: boolean) {
  const current = isAllMode.value
    ? [...candidateKeys.value]
    : (props.modelValue || []).filter(Boolean)
  const next = [...current]
  const index = next.indexOf(key)
  if (checked && index < 0) next.push(key)
  if (!checked && index >= 0) next.splice(index, 1)
  emitSelection(next)
}

function selectAll() {
  emit('update:modelValue', null)
}

function clearAll() {
  emit('update:modelValue', [])
}
</script>

<style scoped>
.clean-fields-picker__option {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-height: 30px;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}

.clean-fields-picker__option:hover {
  background: color-mix(in srgb, var(--text-color) 6%, transparent);
}
</style>
