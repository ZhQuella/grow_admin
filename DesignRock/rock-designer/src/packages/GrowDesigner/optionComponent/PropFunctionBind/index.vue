<template>
  <div class="prop-function-bind" :class="{ 'is-bound': isBound }">
    <GrowInput
      class="prop-function-bind__input"
      size="small"
      readonly
      :model-value="summary"
      :placeholder="placeholder"
    />
    <GrowButton
      class="prop-function-bind__btn"
      size="small"
      :type="isBound ? 'primary' : 'default'"
      :title="isBound ? '已绑定，点击编辑函数' : '绑定函数'"
      @click="dialogVisible = true"
    >
      <GrowIconify icon="carbon:function" :size="14" />
    </GrowButton>

    <FunctionBindDialog
      v-model:visible="dialogVisible"
      :title="label"
      :model-value="editorCode"
      :params="params"
      :example="example"
      @confirm="onConfirm"
      @remove="onRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  decodeFunctionPropValue,
  encodeFunctionPropValue,
} from '../../static/functionPropCodec'
import {
  isFunctionBindMode,
  PROP_BIND_MODE_FUNCTION,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import FunctionBindDialog from './FunctionBindDialog.vue'

defineOptions({ name: 'PropFunctionBind' })

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    /** 属性面板显示名，透传给弹窗标题 */
    label?: string
    placeholder?: string
    bindMode?: PropBindMode | string
    /** 文档形参名 */
    params?: string[]
    example?: string
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '点击右侧绑定函数',
    bindMode: PROP_BIND_MODE_TEXT,
    params: () => [],
    example: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:bindMode': [value: PropBindMode]
}>()

const dialogVisible = ref(false)

const decoded = computed(() => decodeFunctionPropValue(props.modelValue))

const isBound = computed(() => {
  const hasCode = Boolean(decoded.value.code.trim())
  if (isFunctionBindMode(props.bindMode)) return hasCode
  return hasCode
})

const summary = computed(() => {
  if (!isBound.value) return ''
  const code = decoded.value.code.trim()
  if (!code) return '已绑定函数'
  const first = code.split('\n').find((line) => line.trim()) || ''
  return first.length > 36 ? `${first.slice(0, 36)}…` : first
})

const editorCode = computed(() =>
  isBound.value ? decoded.value.code : '',
)

const onConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', '')
    return
  }
  emit('update:bindMode', PROP_BIND_MODE_FUNCTION)
  emit(
    'update:modelValue',
    encodeFunctionPropValue(next, props.params || []),
  )
}

const onRemove = () => {
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.prop-function-bind {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.prop-function-bind__input {
  flex: 1;
  min-width: 0;
}

.prop-function-bind.is-bound .prop-function-bind__input {
  :deep(.el-input__wrapper),
  :deep(.n-input),
  :deep(.ant-input),
  :deep(input) {
    cursor: default;
    background: var(--layout-background-color, #f5f7fa);
  }
}

.prop-function-bind__btn {
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
