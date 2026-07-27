<script lang="ts" setup>
/**
 * GrowColorPicker：契约组件，Element Plus 驱动映射为 ElColorPicker。
 * 常用属性对齐 EP：show-alpha / size / color-format / predefine
 */
import { computed, ref, useAttrs } from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'

defineOptions({
  name: RockComponent.ColorPicker,
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
  }>(),
  {
    modelValue: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })

const ColorPicker = useDriverComponent(RockComponent.ColorPicker)
const attrs = useAttrs()

/** ElColorPicker 更习惯 string；空值用 null 交给面板清除逻辑 */
const resolvedValue = computed(() => props.modelValue ?? null)

const onUpdate = (next: string | null) => {
  emit('update:modelValue', next ?? null)
}
</script>

<template>
  <component
    :is="ColorPicker"
    v-bind="attrs"
    :ref="DriverRefKey"
    :model-value="resolvedValue"
    @update:model-value="onUpdate"
  >
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>
