<template>
  <div class="search-field-edit">
    <div class="search-field-edit__row">
      <span class="search-field-edit__label">显示名</span>
      <GrowInput
        size="small"
        :model-value="modelValue.labelText"
        placeholder="如 状态"
        @update:model-value="(v) => patch({ labelText: String(v ?? '') })"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">字段 model</span>
      <GrowInput
        size="small"
        :model-value="modelValue.model"
        placeholder="如 status"
        @update:model-value="(v) => patch({ model: String(v ?? '') })"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">控件类型</span>
      <GrowSelect
        size="small"
        class="w-full"
        teleported
        popper-class="search-field-edit-select-popper"
        :model-value="modelValue.elType"
        :options="SEARCH_FIELD_EL_TYPE_OPTIONS"
        @update:model-value="onElTypeChange"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">占位提示</span>
      <GrowInput
        size="small"
        :model-value="modelValue.placeholder"
        placeholder="placeholder"
        @update:model-value="(v) => patch({ placeholder: String(v ?? '') })"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">默认可清空</span>
      <GrowSwitch
        size="small"
        :model-value="Boolean(modelValue.clearable)"
        @update:model-value="(v) => patch({ clearable: Boolean(v) })"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">默认展示</span>
      <GrowSwitch
        size="small"
        :model-value="Boolean(modelValue.isDefault)"
        @update:model-value="(v) => patch({ isDefault: Boolean(v) })"
      />
    </div>

    <div class="search-field-edit__row">
      <span class="search-field-edit__label">不可删除</span>
      <GrowSwitch
        size="small"
        :model-value="Boolean(modelValue.noDelete)"
        @update:model-value="(v) => patch({ noDelete: Boolean(v) })"
      />
    </div>

    <template v-if="modelValue.elType === 'GrowInputNumber'">
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">最小值</span>
        <GrowInputNumber
          size="small"
          class="w-full"
          controls-position="right"
          :model-value="toNumber(modelValue.min)"
          @update:model-value="(v) => patch({ min: v })"
        />
      </div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">最大值</span>
        <GrowInputNumber
          size="small"
          class="w-full"
          controls-position="right"
          :model-value="toNumber(modelValue.max)"
          @update:model-value="(v) => patch({ max: v })"
        />
      </div>
    </template>

    <template v-if="modelValue.elType === 'GrowDatePicker'">
      <div class="search-field-edit__section">日期选择器</div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">日期类型</span>
        <GrowSelect
          size="small"
          class="w-full"
          teleported
          popper-class="search-field-edit-select-popper"
          :model-value="modelValue.type || 'date'"
          :options="DATE_PICKER_TYPE_OPTIONS"
          @update:model-value="(v) => patch({ type: String(v ?? 'date') })"
        />
      </div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">值格式</span>
        <GrowInput
          size="small"
          :model-value="String(modelValue['value-format'] || modelValue.valueFormat || '')"
          placeholder="如 YYYY-MM-DD"
          @update:model-value="(v) => patch({ 'value-format': String(v ?? '') })"
        />
      </div>
    </template>

    <template v-if="modelValue.elType === 'GrowTimePicker'">
      <div class="search-field-edit__section">时间选择器</div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">显示格式</span>
        <GrowInput
          size="small"
          :model-value="String(modelValue.format || 'HH:mm:ss')"
          placeholder="如 HH:mm:ss"
          @update:model-value="(v) => patch({ format: String(v ?? 'HH:mm:ss') })"
        />
      </div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">值格式</span>
        <GrowInput
          size="small"
          :model-value="String(modelValue['value-format'] || modelValue.valueFormat || '')"
          placeholder="默认跟随显示格式"
          @update:model-value="(v) => patch({ 'value-format': String(v ?? '') })"
        />
      </div>
    </template>

    <template v-if="isOptionsWidget">
      <div class="search-field-edit__section">{{ optionsSectionTitle }}</div>

      <div v-if="modelValue.elType !== 'GrowCascader'" class="search-field-edit__row">
        <span class="search-field-edit__label">多选</span>
        <GrowSwitch
          size="small"
          :model-value="Boolean(modelValue.multiple)"
          @update:model-value="(v) => patch({ multiple: Boolean(v) })"
        />
      </div>
      <div class="search-field-edit__row">
        <span class="search-field-edit__label">可过滤</span>
        <GrowSwitch
          size="small"
          :model-value="Boolean(modelValue.filterable)"
          @update:model-value="(v) => patch({ filterable: Boolean(v) })"
        />
      </div>
      <div
        v-if="modelValue.elType === 'GrowSelect'"
        class="search-field-edit__row"
      >
        <span class="search-field-edit__label">远程搜索</span>
        <GrowSwitch
          size="small"
          :model-value="Boolean(modelValue.remote)"
          @update:model-value="onRemoteChange"
        />
      </div>
      <div
        v-if="modelValue.elType === 'GrowCascader'"
        class="search-field-edit__row"
      >
        <span class="search-field-edit__label">显示完整路径</span>
        <GrowSwitch
          size="small"
          :model-value="modelValue['show-all-levels'] !== false"
          @update:model-value="(v) => patch({ 'show-all-levels': Boolean(v) })"
        />
      </div>

      <template v-if="modelValue.elType === 'GrowSelect'">
        <div class="search-field-edit__row">
          <span class="search-field-edit__label">label 键</span>
          <GrowInput
            size="small"
            :model-value="modelValue.label || 'label'"
            placeholder="label"
            @update:model-value="(v) => patch({ label: String(v ?? 'label') })"
          />
        </div>
        <div class="search-field-edit__row">
          <span class="search-field-edit__label">value 键</span>
          <GrowInput
            size="small"
            :model-value="modelValue.value || 'value'"
            placeholder="value"
            @update:model-value="(v) => patch({ value: String(v ?? 'value') })"
          />
        </div>
      </template>

      <template v-if="modelValue.elType === 'GrowTreeSelect'">
        <div class="search-field-edit__row">
          <span class="search-field-edit__label">key 字段</span>
          <GrowInput
            size="small"
            :model-value="String(modelValue['key-field'] || modelValue.keyField || 'key')"
            placeholder="key"
            @update:model-value="(v) => patch({ 'key-field': String(v ?? 'key') })"
          />
        </div>
        <div class="search-field-edit__row">
          <span class="search-field-edit__label">label 字段</span>
          <GrowInput
            size="small"
            :model-value="String(modelValue['label-field'] || modelValue.labelField || 'label')"
            placeholder="label"
            @update:model-value="(v) => patch({ 'label-field': String(v ?? 'label') })"
          />
        </div>
        <div class="search-field-edit__row">
          <span class="search-field-edit__label">children 字段</span>
          <GrowInput
            size="small"
            :model-value="String(modelValue['children-field'] || modelValue.childrenField || 'children')"
            placeholder="children"
            @update:model-value="(v) => patch({ 'children-field': String(v ?? 'children') })"
          />
        </div>
      </template>

      <div class="search-field-edit__row search-field-edit__row--top">
        <span class="search-field-edit__label">选项数据</span>
        <div class="search-field-edit__field">
          <GrowRadioButtonGroup
            v-if="modelValue.elType === 'GrowSelect'"
            size="small"
            class="search-field-edit__source"
            :options="OPTIONS_SOURCE_OPTIONS"
            :model-value="optionsSource"
            @update:model-value="onOptionsSourceChange"
          />
          <p
            v-else
            class="search-field-edit__tip"
          >
            级联 / 树形数据建议绑定 state（树结构）
          </p>

          <div
            v-if="modelValue.elType === 'GrowSelect' && optionsSource === 'static'"
            class="search-field-edit__options"
          >
            <div
              v-for="(opt, index) in staticOptions"
              :key="index"
              class="search-field-edit__option-row"
            >
              <GrowInput
                size="small"
                :model-value="stringify(opt[labelKey])"
                placeholder="label"
                @update:model-value="(v) => patchStaticOption(index, labelKey, v)"
              />
              <GrowInput
                size="small"
                :model-value="stringify(opt[valueKey])"
                placeholder="value"
                @update:model-value="(v) => patchStaticOption(index, valueKey, v)"
              />
              <button
                type="button"
                class="search-field-edit__icon-btn"
                title="删除选项"
                @click="removeStaticOption(index)"
              >
                <GrowIconify icon="carbon:trash-can" :size="14" />
              </button>
            </div>
            <GrowButton size="small" @click="addStaticOption">添加选项</GrowButton>
          </div>

          <PropVariableBind
            v-else
            class="search-field-edit__bind"
            :model-value="optionsBindText"
            :bind-mode="optionsBindMode"
            placeholder="绑定 state.options / state.tree 等"
            @update:model-value="onOptionsBindValue"
            @update:bind-mode="onOptionsBindMode"
          />
        </div>
      </div>

      <div v-if="modelValue.elType === 'GrowSelect' && modelValue.remote" class="search-field-edit__row search-field-edit__row--top">
        <span class="search-field-edit__label">远程方法</span>
        <PropFunctionBind
          class="search-field-edit__bind"
          label="远程搜索方法"
          :model-value="remoteMethodText"
          :bind-mode="remoteMethodBindMode"
          :params="['query']"
          :example="REMOTE_METHOD_EXAMPLE"
          placeholder="根据 query 请求并写入 state.options"
          @update:model-value="onRemoteMethodValue"
          @update:bind-mode="onRemoteMethodBindMode"
        />
      </div>

      <div v-if="modelValue.elType === 'GrowSelect' && modelValue.remote" class="search-field-edit__row search-field-edit__row--top">
        <span class="search-field-edit__label">加载中</span>
        <PropVariableBind
          class="search-field-edit__bind"
          :model-value="loadingBindText"
          :bind-mode="loadingBindMode"
          placeholder="如 return state.loading"
          @update:model-value="onLoadingBindValue"
          @update:bind-mode="onLoadingBindMode"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DATE_PICKER_TYPE_OPTIONS,
  SEARCH_FIELD_EL_TYPE_LABEL,
  SEARCH_FIELD_EL_TYPE_OPTIONS,
  SEARCH_FIELD_OPTIONS_TYPES,
  type DesignerSearchField,
  type SearchFieldElType,
} from '../../static/searchFields'
import { switchSearchFieldElType } from '../../static/searchFieldUtils'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_FUNCTION,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import PropVariableBind from '../PropVariableBind/index.vue'
import PropFunctionBind from '../PropFunctionBind/index.vue'

defineOptions({ name: 'SearchFieldEditForm' })

const props = defineProps<{
  modelValue: DesignerSearchField
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DesignerSearchField]
}>()

const OPTIONS_SOURCE_OPTIONS = [
  { label: '静态', value: 'static' },
  { label: '绑定 state', value: 'bind' },
]

const REMOTE_METHOD_EXAMPLE = `// query 为搜索关键字；将结果写入 state，并与「选项数据」绑定同一 state
state.loading = true
try {
  // const list = await request({ keyword: query })
  // state.statusOptions = list
} finally {
  state.loading = false
}`

const patch = (partial: Partial<DesignerSearchField>) => {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const patchBindModes = (partial: Record<string, string | undefined>) => {
  const current = { ...(props.modelValue._bindModes || {}) }
  for (const [key, value] of Object.entries(partial)) {
    if (!value || value === PROP_BIND_MODE_TEXT) Reflect.deleteProperty(current, key)
    else current[key] = value
  }
  const next: DesignerSearchField = { ...props.modelValue }
  if (Object.keys(current).length) next._bindModes = current
  else Reflect.deleteProperty(next, '_bindModes')
  emit('update:modelValue', next)
}

const toNumber = (value: unknown) => {
  if (value == null || value === '') return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

const stringify = (value: unknown) => (value == null ? '' : String(value))

const onElTypeChange = (value: string | number | null | undefined) => {
  const elType = String(value || 'GrowInput') as SearchFieldElType
  emit('update:modelValue', switchSearchFieldElType(props.modelValue, elType))
}

const isOptionsWidget = computed(() =>
  SEARCH_FIELD_OPTIONS_TYPES.has(props.modelValue.elType),
)

const optionsSectionTitle = computed(
  () => SEARCH_FIELD_EL_TYPE_LABEL[props.modelValue.elType] || '选项',
)

const labelKey = computed(() => String(props.modelValue.label || 'label'))
const valueKey = computed(() => String(props.modelValue.value || 'value'))

const optionsSource = computed<'static' | 'bind'>(() => {
  if (props.modelValue.elType !== 'GrowSelect') return 'bind'
  const mode = normalizePropBindMode(props.modelValue._bindModes?.options)
  if (mode === PROP_BIND_MODE_BIND) return 'bind'
  if (typeof props.modelValue.options === 'string') return 'bind'
  return 'static'
})

const staticOptions = computed<Array<Record<string, unknown>>>(() => {
  if (!Array.isArray(props.modelValue.options)) return []
  return props.modelValue.options as Array<Record<string, unknown>>
})

const optionsBindText = computed(() => {
  if (typeof props.modelValue.options === 'string') return props.modelValue.options
  if (
    props.modelValue.elType === 'GrowTreeSelect' &&
    typeof props.modelValue.data === 'string'
  ) {
    return props.modelValue.data
  }
  return ''
})
const optionsBindMode = computed<PropBindMode>(() =>
  normalizePropBindMode(props.modelValue._bindModes?.options),
)

const remoteMethodText = computed(() =>
  String(props.modelValue['remote-method'] ?? props.modelValue.remoteMethod ?? ''),
)

const remoteMethodBindMode = computed<PropBindMode>(() => {
  const mode = props.modelValue._bindModes?.['remote-method']
  if (mode) return normalizePropBindMode(mode)
  return remoteMethodText.value.trim()
    ? PROP_BIND_MODE_FUNCTION
    : PROP_BIND_MODE_TEXT
})

const loadingBindText = computed(() => {
  const raw = props.modelValue.loading
  if (raw == null) return ''
  return String(raw)
})

const loadingBindMode = computed<PropBindMode>(() =>
  normalizePropBindMode(props.modelValue._bindModes?.loading),
)

const onOptionsSourceChange = (value: string | number | null | undefined) => {
  if (value === 'bind') {
    const next: DesignerSearchField = {
      ...props.modelValue,
      options:
        typeof props.modelValue.options === 'string'
          ? props.modelValue.options
          : '',
      _bindModes: {
        ...(props.modelValue._bindModes || {}),
        options: PROP_BIND_MODE_BIND,
      },
    }
    emit('update:modelValue', next)
    return
  }
  const next: DesignerSearchField = {
    ...props.modelValue,
    options: Array.isArray(props.modelValue.options)
      ? props.modelValue.options
      : [],
  }
  const nextModes = { ...(props.modelValue._bindModes || {}) }
  Reflect.deleteProperty(nextModes, 'options')
  if (Object.keys(nextModes).length) next._bindModes = nextModes
  else Reflect.deleteProperty(next, '_bindModes')
  emit('update:modelValue', next)
}

const onOptionsBindValue = (value: string) => {
  if (props.modelValue.elType === 'GrowTreeSelect') {
    patch({ options: value, data: value })
    return
  }
  patch({ options: value })
}

const onOptionsBindMode = (mode: PropBindMode) => {
  patchBindModes({ options: mode })
}

const addStaticOption = () => {
  const list = [...staticOptions.value]
  list.push({
    [labelKey.value]: `选项 ${list.length + 1}`,
    [valueKey.value]: String(list.length + 1),
  })
  patch({ options: list })
}

const removeStaticOption = (index: number) => {
  const list = staticOptions.value.filter((_, i) => i !== index)
  patch({ options: list })
}

const patchStaticOption = (
  index: number,
  key: string,
  value: string | null,
) => {
  const list = staticOptions.value.map((item, i) =>
    i === index ? { ...item, [key]: value == null ? '' : String(value) } : item,
  )
  patch({ options: list })
}

const onRemoteChange = (value: boolean) => {
  const next: Partial<DesignerSearchField> = {
    remote: Boolean(value),
    filterable: value ? true : props.modelValue.filterable,
  }
  if (value && optionsSource.value === 'static') {
    // 远程搜索通常配合 options 绑 state
    next.options = ''
    next._bindModes = {
      ...(props.modelValue._bindModes || {}),
      options: PROP_BIND_MODE_BIND,
    }
  }
  patch(next)
}

const onRemoteMethodValue = (value: string) => {
  patch({ 'remote-method': value, remoteMethod: value })
}

const onRemoteMethodBindMode = (mode: PropBindMode) => {
  patchBindModes({ 'remote-method': mode })
  if (mode === PROP_BIND_MODE_TEXT) {
    patch({ 'remote-method': '', remoteMethod: '' })
  }
}

const onLoadingBindValue = (value: string) => {
  patch({ loading: value })
}

const onLoadingBindMode = (mode: PropBindMode) => {
  patchBindModes({ loading: mode })
  if (mode === PROP_BIND_MODE_TEXT) {
    patch({ loading: '' })
  }
}
</script>

<style scoped lang="scss">
.search-field-edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text-color);
}

.search-field-edit__section {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--layout-border-color);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
}

.search-field-edit__row {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 8px;
  align-items: center;

  &--top {
    align-items: start;
  }
}

.search-field-edit__label {
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 28px;
}

.search-field-edit__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.search-field-edit__source {
  width: 100%;
}

.search-field-edit__options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--layout-container-background-color);
}

.search-field-edit__option-row {
  display: grid;
  grid-template-columns: 1fr 1fr 28px;
  gap: 6px;
  align-items: center;
}

.search-field-edit__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  line-height: 0;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--error-color);
    background: color-mix(in srgb, var(--error-color) 12%, transparent);
  }
}

.search-field-edit__bind {
  width: 100%;
}

.search-field-edit__tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color-secondary);
}
</style>

<!-- 弹层需高于搜索字段配置弹窗（z-index: 4000） -->
<style lang="scss">
.search-field-edit-select-popper {
  z-index: 5100 !important;
}
</style>
