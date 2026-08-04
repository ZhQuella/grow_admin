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

const isCascader = computed(() => {
  const elType = props.config.elType
  return elType === 'GrowCascader' || elType === RockComponent.Cascader
})

const isTreeSelect = computed(() => {
  const elType = props.config.elType
  return elType === 'GrowTreeSelect' || elType === RockComponent.TreeSelect
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
    data,
    ...rest
  } = props.config as AbstractEleConfig & {
    isDefault?: boolean
    noDelete?: boolean
    data?: unknown
  }

  // 挂到 body，避免被 SearchBar 弹层/滚动容器裁切
  const attrs: Recordable<any> = {
    ...rest,
    teleported: true,
  }

  if (isSelect.value) {
    const labelKey = (label as string) || 'label'
    const valueKey = (value as string) || 'value'
    const list = Array.isArray(options) ? options : []
    attrs.options = list.map((item) => ({
      label: item?.[labelKey],
      value: item?.[valueKey],
    }))
  } else if (isCascader.value) {
    attrs.options = Array.isArray(options) ? options : []
  } else if (isTreeSelect.value) {
    const list = Array.isArray(options)
      ? options
      : Array.isArray(data)
        ? data
        : []
    attrs.data = list
    attrs.options = list
  }

  return attrs
})
</script>
