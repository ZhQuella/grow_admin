<template>
  <div class="prop-variable-bind" :class="{ 'is-bound': isBound }">
    <GrowInput
      class="prop-variable-bind__input"
      size="small"
      :clearable="!isBound"
      :readonly="isBound"
      :placeholder="placeholder"
      :model-value="displayValue"
      @update:model-value="onInput"
    />
    <GrowButton
      class="prop-variable-bind__bind"
      size="small"
      :type="isBound ? 'primary' : 'default'"
      :title="isBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
      @click="visible = true"
    >
      <GrowIconify icon="carbon:function" :size="14" />
    </GrowButton>

    <VariableBindDialog
      v-model:visible="visible"
      :model-value="displayValue"
      :bound="isBound"
      @confirm="onBindConfirm"
      @remove="onBindRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import VariableBindDialog from './VariableBindDialog.vue'

defineOptions({ name: 'PropVariableBind' })

const props = withDefaults(
  defineProps<{
    modelValue?: string | boolean | number | null
    placeholder?: string
    /** 持久化的输入模式：text | bind */
    bindMode?: PropBindMode | string
  }>(),
  {
    modelValue: '',
    placeholder: '请输入或绑定变量',
    bindMode: PROP_BIND_MODE_TEXT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:bindMode': [value: PropBindMode]
}>()

const visible = ref(false)

const isBound = computed(
  () => normalizePropBindMode(props.bindMode) === PROP_BIND_MODE_BIND,
)

const displayValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue),
)

const onInput = (value: string | null) => {
  if (isBound.value) return
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', value == null ? '' : String(value))
}

const onBindConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', '')
    return
  }
  emit('update:bindMode', PROP_BIND_MODE_BIND)
  emit('update:modelValue', next)
}

const onBindRemove = () => {
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.prop-variable-bind {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.prop-variable-bind__input {
  flex: 1;
  min-width: 0;
}

.prop-variable-bind.is-bound .prop-variable-bind__input {
  :deep(.el-input__wrapper),
  :deep(.n-input),
  :deep(.ant-input),
  :deep(input) {
    cursor: default;
    background: var(--layout-background-color, #f5f7fa);
  }
}

.prop-variable-bind__bind {
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
