<template>
  <div class="prop-search-fields">
    <div class="prop-search-fields__summary">
      <GrowBadge
        class="prop-search-fields__badge"
        :value="fieldCount"
        :hidden="isBound || fieldCount <= 0"
      >
        <GrowButton
          :type="isBound ? 'default' : 'primary'"
          size="small"
          :disabled="isBound"
          @click="visible = true"
        >
          设置字段
        </GrowButton>
      </GrowBadge>

      <GrowButton
        class="prop-search-fields__bind"
        size="small"
        :type="isBound ? 'primary' : 'default'"
        :title="isBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
        @click="dialogVisible = true"
      >
        <GrowIconify icon="carbon:function" :size="14" />
      </GrowButton>
    </div>

    <SearchFieldsDialog
      v-model:visible="visible"
      :model-value="manualFields"
      @confirm="onConfirm"
    />

    <VariableBindDialog
      v-model:visible="dialogVisible"
      :model-value="expressionText"
      :bound="isBound"
      @confirm="onBindConfirm"
      @remove="onBindRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DesignerSearchField } from '../../static/searchFields'
import {
  createDefaultSearchFields,
  toDesignerSearchFields,
  toPersistedSearchFields,
} from '../../static/searchFieldUtils'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import SearchFieldsDialog from './SearchFieldsDialog.vue'
import VariableBindDialog from '../PropVariableBind/VariableBindDialog.vue'

defineOptions({ name: 'PropSearchFields' })

const props = withDefaults(
  defineProps<{
    /** 手动配置为字段数组；绑定模式下为表达式字符串 */
    modelValue?: DesignerSearchField[] | Record<string, unknown>[] | string | null
    bindMode?: PropBindMode | string
  }>(),
  {
    modelValue: () => [],
    bindMode: PROP_BIND_MODE_TEXT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[] | string]
  'update:bindMode': [value: PropBindMode]
}>()

const visible = ref(false)
const dialogVisible = ref(false)

const isBound = computed(
  () => normalizePropBindMode(props.bindMode) === PROP_BIND_MODE_BIND,
)

const expressionText = computed(() => {
  if (!isBound.value) return ''
  if (props.modelValue == null) return ''
  return String(props.modelValue)
})

const manualFields = computed<DesignerSearchField[]>(() => {
  if (isBound.value) return []
  return toDesignerSearchFields(props.modelValue)
})

const fieldCount = computed(() => manualFields.value.length)

const onConfirm = (next: DesignerSearchField[]) => {
  if (isBound.value) return
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', toPersistedSearchFields(next))
}

const onBindConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', toPersistedSearchFields(createDefaultSearchFields()))
    return
  }
  emit('update:modelValue', next)
  emit('update:bindMode', PROP_BIND_MODE_BIND)
}

const onBindRemove = () => {
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', toPersistedSearchFields(createDefaultSearchFields()))
}
</script>

<style scoped lang="scss">
.prop-search-fields {
  width: 100%;
}

.prop-search-fields__summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
}

.prop-search-fields__badge {
  flex-shrink: 0;
  line-height: 1;
}

.prop-search-fields__bind {
  flex-shrink: 0;
  padding: 0 8px;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    margin: auto;
    line-height: 0;
  }
}
</style>
