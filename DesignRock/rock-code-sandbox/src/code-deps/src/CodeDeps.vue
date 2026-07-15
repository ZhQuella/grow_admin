<template>
  <div class="grow-code-deps flex h-full min-h-0 flex-col">
    <div class="mb-2 flex shrink-0 items-center justify-between gap-2 p-[10px]">
      <slot name="title">
        <span class="text-sm font-medium text-text">依赖注入</span>
      </slot>
      <GrowButton type="primary" size="small" @click="openCreate">
        添加
      </GrowButton>
    </div>

    <GrowWatchBox class="relative min-h-0 flex-1 overflow-hidden">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <ul v-if="displayList.length" class="m-0 list-none p-2">
            <li
              v-for="(item, index) in displayList"
              :key="`${item.source ?? 'npm'}-${item.name}-${index}`"
              class="mb-1 flex items-center justify-between gap-2 rounded bg-layout px-2 py-1.5 text-sm text-text"
            >
              <div
                class="flex min-w-0 flex-1 items-center gap-2 truncate"
                :class="item.locked ? 'opacity-90' : ''"
              >
                <GrowCheckbox
                  :model-value="item.locked || item.enabled !== false"
                  :disabled="Boolean(item.locked)"
                  @update:model-value="onToggle(index, Boolean($event))"
                />
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
              </div>
              <GrowButton
                size="small"
                type="text"
                :disabled="Boolean(item.locked)"
                :title="item.locked ? '默认依赖不可编辑' : '编辑'"
                @click="openEdit(index)"
              >
                编辑
              </GrowButton>
            </li>
          </ul>
          <p v-else class="m-0 px-2 text-sm text-text-secondary">暂无宿主注入依赖</p>
        </GrowScrollbar>

        <div
          v-if="formVisible"
          class="absolute inset-0 z-10 flex flex-col bg-component"
        >
          <div class="flex shrink-0 items-center border-b border-solid border-border px-3 py-2">
            <span class="text-sm font-medium text-text">
              {{ formMode === 'create' ? '添加依赖' : '编辑依赖' }}
            </span>
          </div>
          <div class="min-h-0 flex-1 overflow-auto p-3">
            <GrowForm label-position="top" label-width="auto">
              <GrowFormItem label="名称" required>
                <GrowInput
                  v-model="form.name"
                  clearable
                  placeholder="如 nanoid / GrowButton"
                  :disabled="formMode === 'edit' && Boolean(editingLocked)"
                />
              </GrowFormItem>
              <GrowFormItem label="版本">
                <GrowInput
                  v-model="form.version"
                  clearable
                  placeholder="npm 版本，如 5.1.5"
                />
              </GrowFormItem>
              <GrowFormItem label="来源">
                <GrowSelect
                  v-model="form.source"
                  class="w-full"
                  :options="sourceOptions"
                />
              </GrowFormItem>
              <GrowFormItem label="类型">
                <GrowSelect
                  v-model="form.kind"
                  class="w-full"
                  :options="kindOptions"
                />
              </GrowFormItem>
              <GrowFormItem
                v-if="form.source === 'npm' && form.kind === 'api'"
                label="注入方法名"
              >
                <GrowInput
                  v-model="form.injectAsText"
                  clearable
                  placeholder="逗号分隔，如 nanoid；默认包短名"
                />
              </GrowFormItem>
              <GrowFormItem label="启用">
                <GrowCheckbox v-model="form.enabled">启用该依赖</GrowCheckbox>
              </GrowFormItem>
              <p v-if="formError" class="m-0 text-xs text-[#d03050]">{{ formError }}</p>
            </GrowForm>
          </div>
          <div class="flex shrink-0 justify-end gap-2 border-t border-solid border-border px-3 py-2">
            <GrowButton size="small" @click="closeForm">取消</GrowButton>
            <GrowButton type="primary" size="small" @click="submitForm">保存</GrowButton>
          </div>
        </div>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { RockScrollbar as GrowScrollbar } from '@grow-admin-rock/components/scrollbar'
import type {
  CodeDependency,
  CodeDependencyKind,
  CodeDependencySource,
} from '#/types'
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

const sourceOptions = [
  { label: 'npm（CDN 动态加载）', value: 'npm' },
  { label: 'host（宿主注入）', value: 'host' },
]

const kindOptions = [
  { label: 'api（方法调用）', value: 'api' },
  { label: 'component（模板组件）', value: 'component' },
  { label: 'util（工具 / 模块）', value: 'util' },
]

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingIndex = ref(-1)
const formError = ref('')
const editingLocked = ref(false)

const form = reactive({
  name: '',
  version: '',
  source: 'npm' as CodeDependencySource,
  kind: 'api' as CodeDependencyKind,
  injectAsText: '',
  enabled: true,
})

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

function resetForm() {
  form.name = ''
  form.version = ''
  form.source = 'npm'
  form.kind = 'api'
  form.injectAsText = ''
  form.enabled = true
  formError.value = ''
  editingLocked.value = false
  editingIndex.value = -1
}

function openCreate() {
  resetForm()
  formMode.value = 'create'
  formVisible.value = true
}

function openEdit(index: number) {
  const item = displayList.value[index]
  if (!item || item.locked) return
  resetForm()
  formMode.value = 'edit'
  editingIndex.value = index
  editingLocked.value = Boolean(item.locked)
  form.name = item.name
  form.version = item.version ?? ''
  form.source = item.source ?? 'host'
  form.kind = item.kind ?? 'util'
  form.injectAsText = (item.injectAs ?? []).join(', ')
  form.enabled = item.enabled !== false
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
  resetForm()
}

function parseInjectAs(text: string): string[] | undefined {
  const list = text
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length ? list : undefined
}

function toDependency(): CodeDependency {
  const dep: CodeDependency = {
    name: form.name.trim(),
    source: form.source,
    kind: form.kind,
    enabled: form.enabled,
  }
  if (form.version.trim()) dep.version = form.version.trim()
  if (form.source === 'npm' && form.kind === 'api') {
    const injectAs = parseInjectAs(form.injectAsText)
    if (injectAs) dep.injectAs = injectAs
  }
  return dep
}

function submitForm() {
  formError.value = ''
  if (!form.name.trim()) {
    formError.value = '请填写依赖名称'
    return
  }

  const nextDep = toDependency()
  const current = [...displayList.value]

  const dupIndex = current.findIndex(
    (item, i) =>
      item.name === nextDep.name
      && (formMode.value === 'create' || i !== editingIndex.value),
  )
  if (dupIndex >= 0) {
    formError.value = `依赖「${nextDep.name}」已存在`
    return
  }

  if (formMode.value === 'create') {
    emitNormalized([...current, nextDep])
  } else {
    const idx = editingIndex.value
    if (idx < 0 || !current[idx] || current[idx]!.locked) {
      formError.value = '该项不可编辑'
      return
    }
    current[idx] = { ...current[idx], ...nextDep, locked: false }
    emitNormalized(current)
  }
  closeForm()
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
