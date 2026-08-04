<template>
  <div class="prop-steps-items">
    <div class="prop-steps-items__summary">
      <GrowBadge
        class="prop-steps-items__badge"
        :value="itemCount"
        :hidden="isBound || !isConfigured"
      >
        <GrowButton
          :type="isBound ? 'default' : isConfigured ? 'primary' : 'default'"
          size="small"
          :disabled="isBound"
          @click="visible = true"
        >
          设置步骤项
        </GrowButton>
      </GrowBadge>

      <GrowButton
        class="prop-steps-items__bind"
        size="small"
        :type="isBound ? 'primary' : 'default'"
        :title="isBound ? '已绑定，点击编辑表达式' : '绑定变量 / 表达式计算'"
        @click="dialogVisible = true"
      >
        <GrowIconify icon="carbon:function" :size="14" />
      </GrowButton>
    </div>

    <StepsItemsDialog
      v-model:visible="visible"
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
import { computed, inject, ref, type Ref } from 'vue'
import { findByUUID } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import StepsItemsDialog from './StepsItemsDialog.vue'
import VariableBindDialog from '../PropVariableBind/VariableBindDialog.vue'
import type { StepItemDraft } from './types'

defineOptions({ name: 'PropStepsItems' })

const props = withDefaults(
  defineProps<{
    /** 手动配置下可为空（以结构子节点为准）；绑定模式下为表达式字符串 */
    modelValue?: StepItemDraft[] | Record<string, unknown>[] | string | null
    bindMode?: PropBindMode | string
  }>(),
  {
    modelValue: null,
    bindMode: PROP_BIND_MODE_TEXT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: StepItemDraft[] | Record<string, unknown>[] | string]
  'update:bindMode': [value: PropBindMode]
}>()

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>
const visible = ref(false)
const dialogVisible = ref(false)

const parentStructure = computed(() =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value),
)

const isBound = computed(
  () => normalizePropBindMode(props.bindMode) === PROP_BIND_MODE_BIND,
)

const expressionText = computed(() => {
  if (!isBound.value) return ''
  if (props.modelValue == null) return ''
  return String(props.modelValue)
})

const itemCount = computed(() => {
  if (isBound.value) return 0
  return parentStructure.value?.children?.length || 0
})

const isConfigured = computed(() => itemCount.value > 0)

const clearStructureChildren = () => {
  const structure = parentStructure.value
  if (!structure || !Array.isArray(structure.children)) return
  for (const child of structure.children) {
    Reflect.deleteProperty(draggableConfig.styles, child.uuid)
    Reflect.deleteProperty(draggableConfig.props, child.uuid)
    Reflect.deleteProperty(draggableConfig.events, child.uuid)
    Reflect.deleteProperty(draggableConfig.renderArgument, child.uuid)
    Reflect.deleteProperty(draggableConfig.propBindModes, child.uuid)
  }
  structure.children = []
}

const onConfirm = (items: StepItemDraft[]) => {
  if (isBound.value) return
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  // 手动配置以结构子节点为准；清空 items 绑定值
  emit(
    'update:modelValue',
    items.map((item) => ({
      title: item.title,
      description: item.description,
      status: item.status,
      disabled: item.disabled,
      icon: item.icon,
    })),
  )
  visible.value = false
}

const onBindConfirm = (value: string) => {
  const next = value == null ? '' : String(value)
  if (!next.trim()) {
    emit('update:bindMode', PROP_BIND_MODE_TEXT)
    emit('update:modelValue', [])
    return
  }
  clearStructureChildren()
  emit('update:modelValue', next)
  emit('update:bindMode', PROP_BIND_MODE_BIND)
}

const onBindRemove = () => {
  emit('update:bindMode', PROP_BIND_MODE_TEXT)
  emit('update:modelValue', [])
}
</script>

<style scoped lang="scss">
.prop-steps-items {
  width: 100%;
}

.prop-steps-items__summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
}

.prop-steps-items__badge {
  flex-shrink: 0;
  line-height: 1;
}

.prop-steps-items__bind {
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
