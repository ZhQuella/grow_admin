<template>
  <component
    :is="config.elType"
    v-if="config.elType"
    v-model="searchData[config.model]"
    v-bind="boundAttrs"
    class="w-full"
    style="width: 100%"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { RockComponent } from '#/RockComponent'
import type { AbstractEleConfig } from '../types'

defineOptions({
  name: RockComponent.AbstractEle,
  customOptions: {
    isPresetComponent: true,
  },
})

const props = withDefaults(
  defineProps<{
    searchData?: Recordable<any>
    config?: AbstractEleConfig
  }>(),
  {
    searchData: () => ({}),
    config: () => ({ model: '' }),
  },
)

const isSelect = computed(() => {
  const elType = props.config.elType
  return elType === 'GrowSelect' || elType === RockComponent.Select
})

const boundAttrs = computed(() => {
  const {
    elType: _elType,
    model: _model,
    labelText: _labelText,
    isDefault: _isDefault,
    noDelete: _noDelete,
    label,
    value,
    options,
    ...rest
  } = props.config as AbstractEleConfig & {
    isDefault?: boolean
    noDelete?: boolean
  }

  // 挂到 body，避免被 SearchBar 弹层/滚动容器裁切
  const attrs: Recordable<any> = {
    ...rest,
    teleported: true,
  }

  if (isSelect.value) {
    const labelKey = (label as string) || 'label'
    const valueKey = (value as string) || 'value'
    attrs.options = (options || []).map((item) => ({
      label: item[labelKey],
      value: item[valueKey],
    }))
  }

  return attrs
})
</script>
