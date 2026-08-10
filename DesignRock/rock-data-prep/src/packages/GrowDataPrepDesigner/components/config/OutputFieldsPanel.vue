<template>
  <div class="box-border flex h-full min-h-0 flex-col">
    <div class="shrink-0 border-b border-solid border-border px-3 py-2 text-xs text-text-secondary">
      勾选要输出的字段，并在下方拖拽调整列顺序。预览与对外输出均按此配置。
    </div>

    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <section v-if="detailGroups.length" class="mb-4">
          <h5 class="prep-output-section-title">明细字段</h5>
          <GrowCollapse
            class="prep-output-collapse"
            :model-value="expandedDetailNames"
            :expanded-names="expandedDetailNames"
            @update:model-value="onDetailExpandChange"
            @update:expanded-names="onDetailExpandChange"
          >
            <GrowCollapseItem
              v-for="group in detailGroups"
              :key="group.label"
              :name="group.label"
            >
              <template #title>
                <div class="prep-output-collapse__title-row">
                  <span class="prep-output-collapse__title" :title="group.label">
                    {{ group.label }}
                  </span>
                  <span class="prep-output-collapse__count">
                    已选 {{ selectedCountInGroup(group.fields) }}
                  </span>
                </div>
              </template>
              <template #header>
                <div class="prep-output-collapse__title-row">
                  <span class="prep-output-collapse__title" :title="group.label">
                    {{ group.label }}
                  </span>
                  <span class="prep-output-collapse__count">
                    已选 {{ selectedCountInGroup(group.fields) }}
                  </span>
                </div>
              </template>
              <label
                v-for="item in group.fields"
                :key="item.key"
                class="prep-output-option"
              >
                <GrowCheckbox
                  :model-value="isSelected(item.key)"
                  @update:model-value="(v) => onToggle(item.key, Boolean(v))"
                />
                <span class="min-w-0 flex-1 truncate" :title="item.key">{{ item.label }}</span>
                <span class="shrink-0 text-[11px] text-text-secondary">明细</span>
              </label>
            </GrowCollapseItem>
          </GrowCollapse>
        </section>

        <section v-if="measureFields.length" class="mb-4">
          <h5 class="prep-output-section-title">度量字段</h5>
          <label
            v-for="item in measureFields"
            :key="item.key"
            class="prep-output-option"
          >
            <GrowCheckbox
              :model-value="isSelected(item.key)"
              @update:model-value="(v) => onToggle(item.key, Boolean(v))"
            />
            <span class="min-w-0 flex-1 truncate" :title="item.key">{{ item.label }}</span>
            <span class="shrink-0 text-[11px] text-text-secondary">度量</span>
          </label>
        </section>

        <div
          v-if="!detailGroups.length && !measureFields.length"
          class="py-10 text-center text-xs text-text-secondary"
        >
          请先添加表或配置度量
        </div>

        <section v-if="dragList.length" class="mt-2">
          <h5 class="prep-output-section-title">
            已选字段（拖拽排序）
            <span class="prep-output-section-title__meta">· {{ dragList.length }}</span>
          </h5>
          <draggable
            v-model="dragList"
            item-key="key"
            handle=".prep-output-selected__handle"
            :animation="180"
            ghost-class="prep-output-selected--ghost"
            chosen-class="prep-output-selected--chosen"
            drag-class="prep-output-selected--drag"
            class="flex flex-col gap-1.5"
            @end="emitOrder"
          >
            <template #item="{ element }">
              <div class="prep-output-selected">
                <span class="prep-output-selected__handle" title="拖拽排序">
                  <GrowIconify icon="carbon:draggable" :size="14" />
                </span>
                <span class="min-w-0 flex-1 truncate" :title="element.key">{{ element.label }}</span>
                <span class="shrink-0 text-[11px] text-text-secondary">
                  {{ element.role === 'measure' ? '度量' : '明细' }}
                </span>
              </div>
            </template>
          </draggable>
        </section>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { DataPrepOutputFieldCandidate } from '../../utils/outputFields'

defineOptions({
  name: 'DataPrepOutputFieldsPanel',
})

const props = defineProps<{
  modelValue: string[]
  candidates: DataPrepOutputFieldCandidate[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedSet = computed(() => new Set(props.modelValue || []))

const candidateMap = computed(() => {
  const map = new Map<string, DataPrepOutputFieldCandidate>()
  for (const item of props.candidates || []) map.set(item.key, item)
  return map
})

const detailGroups = computed(() => {
  const map = new Map<string, DataPrepOutputFieldCandidate[]>()
  for (const item of props.candidates || []) {
    if (item.role !== 'detail') continue
    const list = map.get(item.groupLabel)
    if (list) list.push(item)
    else map.set(item.groupLabel, [item])
  }
  return [...map.entries()].map(([label, fields]) => ({ label, fields }))
})

const measureFields = computed(() =>
  (props.candidates || []).filter((item) => item.role === 'measure'),
)

/** 明细折叠：默认展开「有已选」的表；都没有则展开第一张 */
const expandedDetailNames = ref<string[]>([])

watch(
  detailGroups,
  (groups) => {
    const labels = groups.map((group) => group.label)
    const kept = expandedDetailNames.value.filter((name) => labels.includes(name))
    if (kept.length) {
      expandedDetailNames.value = kept
      return
    }
    const withSelected = groups
      .filter((group) => group.fields.some((field) => selectedSet.value.has(field.key)))
      .map((group) => group.label)
    expandedDetailNames.value = withSelected.length
      ? withSelected
      : labels.slice(0, 1)
  },
  { immediate: true },
)

function onDetailExpandChange(names: string | string[] | null | undefined) {
  if (Array.isArray(names)) {
    expandedDetailNames.value = names.map(String)
    return
  }
  expandedDetailNames.value = names != null && names !== '' ? [String(names)] : []
}

function selectedCountInGroup(fields: DataPrepOutputFieldCandidate[]) {
  return fields.filter((field) => selectedSet.value.has(field.key)).length
}

const dragList = ref<DataPrepOutputFieldCandidate[]>([])

function syncDragListFromModel() {
  dragList.value = (props.modelValue || [])
    .map((key) => candidateMap.value.get(key))
    .filter(Boolean) as DataPrepOutputFieldCandidate[]
}

watch(
  () => [props.modelValue, props.candidates] as const,
  () => {
    const nextKeys = dragList.value.map((item) => item.key)
    const modelKeys = props.modelValue || []
    const same =
      nextKeys.length === modelKeys.length &&
      nextKeys.every((key, index) => key === modelKeys[index])
    if (same && dragList.value.every((item) => candidateMap.value.has(item.key))) return
    syncDragListFromModel()
  },
  { immediate: true, deep: true },
)

function isSelected(key: string) {
  return selectedSet.value.has(key)
}

function onToggle(key: string, checked: boolean) {
  const next = [...(props.modelValue || [])]
  const index = next.indexOf(key)
  if (checked && index < 0) next.push(key)
  if (!checked && index >= 0) next.splice(index, 1)
  emit('update:modelValue', next)
}

function emitOrder() {
  emit(
    'update:modelValue',
    dragList.value.map((item) => item.key),
  )
}
</script>

<style scoped>
.prep-output-section-title {
  margin: 0 0 10px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.prep-output-section-title__meta {
  margin-left: 2px;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-weight: 400;
}

.prep-output-collapse__title-row {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 4px;
}

.prep-output-collapse__title {
  overflow: hidden;
  min-width: 0;
  flex: 1 1 auto;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prep-output-collapse__count {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 11px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Element Plus / Naive：跟随主题边框与背景，避免暗黑模式残留浅色底 */
.prep-output-collapse :deep(.el-collapse),
.prep-output-collapse :deep(.el-collapse-item__wrap),
.prep-output-collapse :deep(.el-collapse-item__header) {
  --el-collapse-border-color: var(--layout-border-color, var(--border-color));
  border-color: var(--layout-border-color, var(--border-color));
  background-color: transparent;
}

.prep-output-collapse :deep(.el-collapse-item__content) {
  color: var(--text-color);
  background-color: transparent;
}

.prep-output-collapse :deep(.n-collapse),
.prep-output-collapse :deep(.n-collapse-item) {
  --n-divider-color: var(--layout-border-color, var(--border-color));
  --n-title-text-color: var(--text-color-secondary, var(--text-secondary-color));
}

.prep-output-collapse :deep(.el-collapse-item__header) {
  height: auto;
  min-height: 36px;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
}

.prep-output-collapse :deep(.el-collapse-item__title) {
  flex: 1 1 auto;
  overflow: hidden;
}

.prep-output-collapse :deep(.n-collapse-item__header-main) {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--text-color-secondary, var(--text-secondary-color));
  font-size: 12px;
  font-weight: 400;
}

.prep-output-option {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-height: 32px;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}

.prep-output-option:hover {
  background: color-mix(in srgb, var(--text-color) 6%, transparent);
}

.prep-output-selected {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px;
  background: var(--component-background-color);
  color: var(--text-color);
  font-size: 13px;
  user-select: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.prep-output-selected__handle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary, var(--text-secondary-color));
  line-height: 0;
  cursor: grab;
}

.prep-output-selected__handle:active {
  cursor: grabbing;
}

.prep-output-selected--ghost {
  border-color: color-mix(in srgb, var(--primary-color) 45%, var(--layout-border-color, var(--border-color)));
  background: color-mix(in srgb, var(--primary-color) 8%, var(--component-background-color));
  opacity: 0.7;
}

.prep-output-selected--chosen {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.prep-output-selected--drag {
  opacity: 0.95;
  box-shadow: var(--card-shadow);
}
</style>
