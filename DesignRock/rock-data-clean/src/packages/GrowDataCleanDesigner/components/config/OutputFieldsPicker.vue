<template>
  <div class="clean-fields-picker">
    <div class="mb-2 flex items-center justify-between gap-2">
      <span class="text-xs font-medium text-text">{{ title }}</span>
      <div class="flex items-center gap-1">
        <GrowButton text size="small" :disabled="!candidates.length" @click="selectAll">
          全选
        </GrowButton>
        <GrowButton
          v-if="emptyMeans === 'none'"
          text
          size="small"
          :disabled="!candidates.length"
          @click="clearAll"
        >
          清空
        </GrowButton>
      </div>
    </div>

    <p v-if="hint" class="mb-2 mt-0 text-[11px] text-text-secondary">
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
 * - emptyMeans=`none`（表/输出）：`null`/`undefined`=默认全部；`[]`=不选
 * - emptyMeans=`all`（清洗算子）：`null`/`undefined`/`[]`=全部字段
 */
export type CleanFieldsSelection = string[] | null | undefined

defineOptions({
  name: 'CleanOutputFieldsPicker',
})

const props = withDefaults(
  defineProps<{
    modelValue: CleanFieldsSelection
    candidates: CleanFieldCandidate[]
    /** `none`：可清空；`all`：空配置表示作用全部字段 */
    emptyMeans?: 'all' | 'none'
    /**
     * 仅 emptyMeans=`none` 时生效：
     * true（表/输出）全选收成 null=默认全部；
     * false（分组等）全选写入完整字段列表。
     */
    defaultAll?: boolean
    title?: string
    hint?: string
    emptyText?: string
  }>(),
  {
    emptyMeans: 'none',
    defaultAll: true,
    title: '字段',
    hint: '',
    emptyText: '暂无可用字段（请先连接上游或选择数据表）',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[] | null]
}>()

const candidateKeys = computed(() =>
  (props.candidates || []).map((item) => item.key).filter(Boolean),
)

const isAllMode = computed(() => {
  if (props.emptyMeans === 'all') {
    return props.modelValue == null || !(props.modelValue || []).filter(Boolean).length
  }
  return props.defaultAll && props.modelValue == null
})

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

  if (props.emptyMeans === 'all') {
    emit('update:modelValue', sameAsAll || !next.length ? [] : next)
    return
  }

  if (sameAsAll && props.defaultAll) {
    emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', next)
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
  if (props.emptyMeans === 'all') {
    emit('update:modelValue', [])
    return
  }
  emit('update:modelValue', props.defaultAll ? null : [...candidateKeys.value])
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
