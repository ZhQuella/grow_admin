<template>
  <template v-if="!isSocket">
    <div
      v-if="isUnsupported"
      class="designer-unsupported"
    >
      {{ config.elName || config.elTagName }}（暂未接入）
    </div>
    <component
      v-else-if="config.elTagName"
      :is="config.elTagName"
      v-bind="bindProps"
      :key="moduleRenderKey"
      :class="{ 'w-full': isFormFullWidth }"
      :style="styleInfo"
      @update:current-page="onPaginationCurrentPage"
      @update:page-size="onPaginationPageSize"
    >
      <span v-if="config.elTagName === 'GrowButton'">{{ propsInfo.content }}</span>
      <span v-else-if="config.elTagName === 'GrowLink'">{{ propsInfo.content }}</span>
      <span v-else-if="config.elTagName === 'GrowTag'">{{ propsInfo.content }}</span>
      <template v-else-if="config.elTagName === 'GrowEllipsis'">{{ propsInfo.content }}</template>
      <TableColumnNodes
        v-else-if="config.elTagName === 'GrowTable'"
        :columns="propsInfo.columns || []"
      />
    </component>
  </template>
</template>

<script setup lang="ts">
import { computed, inject, toRefs } from 'vue'
import { FORM_MODULE_FULL_WIDTH_TAGS } from '../../../../static/moduleMap'
import {
  GROW_RUNTIME_STATE,
  LAYOUT_MAIN_SIZE,
  type LayoutMainSize,
} from '../../../../config/designation'
import { tableColumnsSignature } from '../../../../static/tableColumnUtils'
import { writePaginationProp } from '../../../../../GrowRenderer/utils/resolveBoundProps'
import { normalizeModulePropsByTag } from '../../../../../GrowRenderer/utils/modulePropsNormalizers'
import { resolveSearchBarFields } from '@grow-admin-rock/hooks'
import TableColumnNodes from '../../../shared/TableColumnNodes.vue'

interface PropsType {
  config: any
  propsInfo: any
  styleInfo?: Record<string, any>
  /** schema 原始 props（含 bind 表达式），用于分页写回 */
  rawPropsInfo?: Record<string, any>
  bindModes?: Record<string, string>
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({}),
  styleInfo: () => ({}),
  rawPropsInfo: () => ({}),
  bindModes: () => ({}),
})

const { config, propsInfo, styleInfo, rawPropsInfo, bindModes } = toRefs(props)

const layoutMainSize = inject<LayoutMainSize | null>(LAYOUT_MAIN_SIZE, null)
const injectedRuntimeState = inject<Record<string, unknown> | null>(
  GROW_RUNTIME_STATE,
  null,
)

const isUnsupported = computed(() => Boolean(config.value.unsupported))

const isFormFullWidth = computed(() =>
  FORM_MODULE_FULL_WIDTH_TAGS.has(config.value?.elTagName),
)

/** 表格列 / 分页关键配置变化时强制重建 */
const moduleRenderKey = computed(() => {
  const tag = config.value?.elTagName
  if (tag === 'GrowTable') {
    return `GrowTable:${tableColumnsSignature(propsInfo.value?.columns)}`
  }
  if (tag === 'GrowPagination') {
    const p = propsInfo.value || {}
    return [
      'GrowPagination',
      p['page-size'],
      p['current-page'],
      p.total,
      p['page-count'],
      JSON.stringify(p['page-sizes'] ?? null),
      p.layout,
      p.background,
      p.small,
      p.size,
      p.disabled,
      p['hide-on-single-page'],
      p['pager-count'],
    ].join(':')
  }
  return tag || 'module'
})

const isSocket = computed(() => {
  const slotMap = [
    'GrowCard',
    'GrowTabs',
    'GrowRow',
    'GrowScrollbar',
  'GrowTooltip',
  'GrowDropdown',
  'GrowPopover',
  'GrowModal',
  'GrowDrawer',
  'GrowLayout',
  'GrowUpload',
]
  return slotMap.includes(config.value.elTagName)
})

const onPaginationCurrentPage = (value: number) => {
  if (config.value?.elTagName !== 'GrowPagination') return
  writePaginationProp(
    injectedRuntimeState,
    rawPropsInfo.value,
    bindModes.value,
    'current-page',
    value,
  )
}

const onPaginationPageSize = (value: number) => {
  if (config.value?.elTagName !== 'GrowPagination') return
  writePaginationProp(
    injectedRuntimeState,
    rawPropsInfo.value,
    bindModes.value,
    'page-size',
    value,
  )
}

const bindProps = computed(() => {
  const tag = config.value?.elTagName || ''
  const raw = propsInfo.value || {}
  const info = { ...raw }

  // 设计器 SearchBar：先解析字段表达式，再走通用归一化
  if (tag === 'GrowSearchBar') {
    info.search = resolveSearchBarFields(
      Array.isArray(info.search) ? info.search : [],
      injectedRuntimeState || {},
    )
  }

  return normalizeModulePropsByTag(tag, info, raw, {
    disableColumnBar: true,
    fitLayoutMainHeight: Boolean(raw.fitLayoutMainHeight),
    layoutMainHeight: layoutMainSize?.height,
  })
})
</script>

<style scoped>
.designer-unsupported {
  padding: 12px 8px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style>
