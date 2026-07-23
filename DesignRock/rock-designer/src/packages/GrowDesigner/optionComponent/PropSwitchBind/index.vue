<template>
  <div class="prop-switch-bind" :class="{ 'is-bound': isBound }">
    <GrowSwitch
      v-if="!isBound"
      class="prop-switch-bind__switch"
      size="small"
      :model-value="switchValue"
      @update:model-value="onSwitch"
    />
    <GrowInput
      v-else
      class="prop-switch-bind__input"
      size="small"
      readonly
      :model-value="expressionText"
      placeholder="已绑定表达式"
    />
    <GrowButton
      class="prop-switch-bind__bind"
      size="small"
      :type="isBound ? 'primary' : 'default'"
      :title="isBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
      @click="openBindDialog"
    >
      <GrowIconify icon="carbon:function" :size="14" />
    </GrowButton>

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
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import VariableBindDialog from '../PropVariableBind/VariableBindDialog.vue'

defineOptions({ name: 'PropSwitchBind' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean | string | number | null
    /** 持久化的输入模式：text | bind */
    bindMode?: PropBindMode | string
    /** 解除绑定或清空时的默认开关值 */
    defaultValue?: boolean
  }>(),
  {
    modelValue: true,
    bindMode: PROP_BIND_MODE_TEXT,
    defaultValue: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string]
  'update:bindMode': [value: PropBindMode]
}>()

const dialogVisible = ref(false)
/** 绑定切换瞬间忽略 Switch 卸载时的残留事件，避免把表达式覆盖成布尔值 */
const ignoreSwitch = ref(false)

const isBound = computed(
  () => normalizePropBindMode(props.bindMode) === PROP_BIND_MODE_BIND,
)

/** 供展示 / 再次编辑：保留原始表达式字符串 */
const expressionText = computed(() => {
  if (!isBound.value) return ''
  if (props.modelValue == null) return ''
  return String(props.modelValue)
})

const switchValue = computed(() => {
  const raw = props.modelValue
  if (raw === undefined || raw === null || raw === '') return props.defaultValue
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'number') return raw !== 0
  const text = String(raw).trim().toLowerCase()
  if (text === 'false' || text === '0') return false
  if (text === 'true' || text === '1') return true
  return Boolean(raw)
})

const openBindDialog = () => {
  dialogVisible.value = true
}

const onSwitch = (value: boolean | string | number) => {
  if (isBound.value || ignoreSwitch.value) return
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', Boolean(value))
}

const onBindConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    ignoreSwitch.value = true
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', props.defaultValue)
    queueMicrotask(() => {
      ignoreSwitch.value = false
    })
    return
  }
  // 先写表达式再切 bind，并忽略 Switch 卸载残留事件
  ignoreSwitch.value = true
  emit('update:modelValue', next)
  emit('update:bindMode', PROP_BIND_MODE_BIND)
  queueMicrotask(() => {
    ignoreSwitch.value = false
  })
}

const onBindRemove = () => {
  ignoreSwitch.value = true
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', props.defaultValue)
  queueMicrotask(() => {
    ignoreSwitch.value = false
  })
}
</script>

<style scoped lang="scss">
.prop-switch-bind {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 32px;
}

.prop-switch-bind__switch {
  flex: 0 0 auto;
}

.prop-switch-bind__input {
  flex: 1 1 auto;
  min-width: 0;
}

.prop-switch-bind__bind {
  flex: 0 0 auto;
  padding: 0 8px;
}

.prop-switch-bind.is-bound .prop-switch-bind__input {
  :deep(.el-input__wrapper),
  :deep(.n-input) {
    background: var(--color-primary-a04, rgba(64, 158, 255, 0.08));
  }
}
</style>
