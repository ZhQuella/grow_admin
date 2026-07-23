<template>
  <template v-if="!config || config.unsupported">
    <!-- 未接入组件：预览阶段跳过 -->
  </template>

  <!-- render=false → 不创建；visible=false → 隐藏 -->
  <div
    v-else-if="isNodeRenderable"
    class="grow-render-node"
    :class="{ 'grow-render-node--hidden': !isNodeVisible }"
  >
  <!-- 基础元素（叶子） -->
  <component
    v-if="isBasicLeaf && basicTag"
    :is="basicTag"
    v-bind="basicProps"
    :class="nodeClass"
    :style="nodeStyle"
  >
    {{ basicText }}
  </component>

  <!-- 容器：div -->
  <div
    v-else-if="isChild && tag === 'div'"
    v-bind="runtimeEventProps"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <RenderNode
      v-for="child in children"
      :key="child.uuid"
      :node="child"
      :schema="schema"
    />
  </div>

  <!-- GrowCondition：条件为真时渲染子节点 -->
  <template v-else-if="isChild && tag === 'GrowCondition'">
    <template v-if="conditionPassed">
      <RenderNode
        v-for="child in children"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
  </template>

  <!-- GrowLoop：按列表重复渲染子节点，并向子树注入 item / index -->
  <template v-else-if="isChild && tag === 'GrowLoop'">
    <RenderScopedState
      v-for="entry in loopEntries"
      :key="entry.key"
      :extra="entry.extra"
    >
      <RenderNode
        v-for="child in children"
        :key="`${entry.key}:${child.uuid}`"
        :node="child"
        :schema="schema"
      />
    </RenderScopedState>
  </template>

  <!-- GrowCard：可选 header 操作区 + 正文 + 可选 footerSlot -->
  <component
    v-else-if="isChild && tag === 'GrowCard'"
    :is="tag"
    v-bind="moduleProps"
    :class="[nodeClass, { 'w-full': isFormFullWidth }]"
    :style="nodeStyle"
  >
    <template v-if="showHeaderExtra" #header>
      <div class="grow-card-header-extra">
        <div class="grow-card-header-extra__title">{{ rawProps.header }}</div>
        <div class="grow-card-header-extra__option">
          <RenderNode
            v-for="child in optionChildren"
            :key="child.uuid"
            :node="child"
            :schema="schema"
          />
        </div>
      </div>
    </template>
    <RenderNode
      v-for="child in children"
      :key="child.uuid"
      :node="child"
      :schema="schema"
    />
    <template v-if="showFooter" #footer>
      <RenderNode
        v-for="child in footerChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
  </component>

  <!-- GrowScrollbar -->
  <div
    v-else-if="isChild && tag === 'GrowScrollbar'"
    class="grow-scrollbar-frame"
    :class="nodeClass"
  >
    <component
      :is="tag"
      v-bind="scrollbarModuleProps"
      class="grow-scrollbar-host"
    >
      <div class="grow-scrollbar-body" :style="scrollbarBodyStyle">
        <RenderNode
          v-for="child in children"
          :key="child.uuid"
          :node="child"
          :schema="schema"
        />
      </div>
    </component>
  </div>

  <!-- GrowLayout：按 layout 预设组装 Header / Aside / Main / Footer -->
  <RenderPageLayout
    v-else-if="isChild && tag === 'GrowLayout'"
    :layout="rawProps.layout"
    :header-height="rawProps.headerHeight"
    :aside-width="rawProps.asideWidth"
    :footer-height="rawProps.footerHeight"
    :node-class="nodeClass"
    :node-style="nodeStyle"
  >
    <template #header>
      <RenderNode
        v-for="child in headerChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
    <template #aside>
      <RenderNode
        v-for="child in asideChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
    <template #main="mainSize">
      <RenderNode
        v-for="child in children"
        :key="child.uuid"
        :node="child"
        :schema="schema"
        :layout-main-height="mainSize?.height || 0"
      />
    </template>
    <template #footer>
      <RenderNode
        v-for="child in footerChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
  </RenderPageLayout>

  <!-- GrowTooltip：默认插槽为触发元素 -->
  <component
    v-else-if="isChild && tag === 'GrowTooltip'"
    :is="tag"
    v-bind="moduleProps"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <div class="grow-tooltip-trigger">
      <template v-if="children.length">
        <RenderNode
          v-for="child in children"
          :key="child.uuid"
          :node="child"
          :schema="schema"
        />
      </template>
      <span v-else class="grow-tooltip-trigger__placeholder">触发元素</span>
    </div>
  </component>

  <!-- GrowUpload：行内块；默认插槽为触发内容 -->
  <component
    v-else-if="isChild && tag === 'GrowUpload'"
    :is="tag"
    v-bind="moduleProps"
    :class="nodeClass"
    :style="nodeStyle"
    @update:model-value="onModelUpdate"
    @update:value="onModelUpdate"
    @update:file-list="onModelUpdate"
    @update:fileList="onModelUpdate"
  >
    <div class="grow-upload-trigger">
      <template v-if="children.length">
        <RenderNode
          v-for="child in children"
          :key="child.uuid"
          :node="child"
          :schema="schema"
        />
      </template>
      <span v-else class="grow-upload-trigger__placeholder">上传触发内容</span>
    </div>
  </component>

  <!-- GrowPopover：#reference 触发；default 弹出内容 -->
  <component
    v-else-if="isChild && tag === 'GrowPopover'"
    :is="tag"
    v-bind="popoverModuleProps"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <template #reference>
      <div v-if="children.length" class="grow-popover-trigger">
        <RenderNode
          v-for="child in children"
          :key="child.uuid"
          :node="child"
          :schema="schema"
        />
      </div>
    </template>
    <template v-if="contentChildren.length">
      <RenderNode
        v-for="child in contentChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
  </component>

  <!-- GrowModal / GrowDrawer：按 modelValue 显隐；可选 footerSlot -->
  <component
    v-else-if="isChild && (tag === 'GrowModal' || tag === 'GrowDrawer')"
    :is="tag"
    v-bind="moduleProps"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <RenderNode
      v-for="child in children"
      :key="child.uuid"
      :node="child"
      :schema="schema"
    />
    <template v-if="showFooter" #footer>
      <RenderNode
        v-for="child in footerChildren"
        :key="child.uuid"
        :node="child"
        :schema="schema"
      />
    </template>
  </component>

  <!-- 容器：表单 / 栅格 / Tabs / 弹层等（isChild） -->
  <component
    v-else-if="isChild && tag"
    :is="tag"
    v-bind="moduleProps"
    :class="[nodeClass, { 'w-full': isFormFullWidth }]"
    :style="nodeStyle"
    @update:model-value="onModelUpdate"
    @update:value="onModelUpdate"
  >
    <RenderNode
      v-for="child in children"
      :key="child.uuid"
      :node="child"
      :schema="schema"
    />
  </component>

  <!-- GrowTable：适应主区域高度时，在本地 WatchBox 内测高并绑定 -->
  <div
    v-else-if="isModuleLeaf && tag === 'GrowTable' && useLayoutMainHeight"
    class="grow-table-layout-main"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <GrowWatchBox class="grow-table-layout-main__watch">
      <template #default="{ height: watchHeight }">
        <component
          :is="tag"
          :key="tableColumnsKey"
          v-bind="tableBaseProps"
          :height="watchHeight > 0 ? watchHeight : undefined"
          class="w-full"
        >
          <TableColumnNodes :columns="rawProps.columns || []" />
        </component>
      </template>
    </GrowWatchBox>
  </div>

  <!-- GrowTable：普通渲染（带多级表头） -->
  <component
    v-else-if="isModuleLeaf && tag === 'GrowTable'"
    :is="tag"
    :key="tableColumnsKey"
    v-bind="moduleProps"
    :class="[nodeClass, { 'w-full': isFormFullWidth }]"
    :style="nodeStyle"
  >
    <TableColumnNodes :columns="rawProps.columns || []" />
  </component>

  <!-- 模块叶子 -->
  <component
    v-else-if="isModuleLeaf && tag"
    :is="tag"
    v-bind="moduleProps"
    :class="[nodeClass, { 'w-full': isFormFullWidth }]"
    :style="nodeStyle"
    @update:model-value="onModelUpdate"
    @update:value="onModelUpdate"
    @update:file-list="onModelUpdate"
    @update:fileList="onModelUpdate"
  >
    <span v-if="tag === 'GrowButton'">{{ rawProps.content }}</span>
    <span v-else-if="tag === 'GrowLink'">{{ rawProps.content }}</span>
    <template v-else-if="tag === 'GrowEllipsis'">{{ rawProps.content }}</template>
  </component>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide, reactive } from 'vue'
import { FORM_MODULE_FULL_WIDTH_TAGS } from '../../GrowDesigner/static/moduleMap'
import {
  GROW_RUNTIME_STATE,
  LAYOUT_MAIN_SIZE,
  type LayoutMainSize,
} from '../../GrowDesigner/config/designation'
import type { DesignerSchema, DesignerStructureNode } from '../types'
import {
  normalizeBasicProps,
  normalizeModuleProps,
  resolveBasicTag,
  resolveBasicText,
  resolveNodeClass,
  resolveNodeStyle,
  toRendererRelativeSize,
} from '../utils/normalizeProps'
import {
  buildRuntimeState,
  coerceBool,
  resolveBoundProps,
  resolveContainerActiveValue,
  writeBoundPropValue,
  writeContainerActiveValue,
  writeModelBinding,
} from '../utils/resolveBoundProps'
import {
  applyColumnBarVisibleToTableColumns,
  tableColumnsSignature,
  toColumnBarItems,
} from '../../GrowDesigner/static/tableColumnUtils'
import { buildRuntimeEventProps } from '../utils/runDesignerEvent'
import RenderPageLayout from './RenderPageLayout.vue'
import RenderScopedState from './RenderScopedState.vue'
import TableColumnNodes from '../../GrowDesigner/components/shared/TableColumnNodes.vue'

defineOptions({ name: 'RenderNode' })

const props = defineProps<{
  node: DesignerStructureNode
  schema: DesignerSchema
  /** 布局容器主区域 WatchBox 测得的高度（预览插槽透传） */
  layoutMainHeight?: number
}>()

const uuid = computed(() => props.node.uuid)
const children = computed(() => props.node.children || [])
const footerChildren = computed(() => props.node.footerSlot || [])
const optionChildren = computed(() => props.node.optionSlot || [])
const contentChildren = computed(() => props.node.contentSlot || [])
const headerChildren = computed(() => props.node.headerSlot || [])
const asideChildren = computed(() => props.node.asideSlot || [])
const config = computed(() => props.schema.renderArgument?.[uuid.value])
const injectedRuntimeState = inject<Record<string, unknown> | null>(
  GROW_RUNTIME_STATE,
  null,
)
const runtimeState = computed(
  () => injectedRuntimeState ?? buildRuntimeState(props.schema.dataSource),
)
/** 按 propBindModes 求值后的 props（绑定字段已解析为展示值） */
const rawProps = computed(() =>
  resolveBoundProps(
    props.schema.props?.[uuid.value] || {},
    props.schema.propBindModes?.[uuid.value],
    runtimeState.value,
  ),
)

/** 渲染（v-if）：默认 true */
const isNodeRenderable = computed(() => coerceBool(rawProps.value?.render, true))
/** 显示（v-show）：默认 true */
const isNodeVisible = computed(() => coerceBool(rawProps.value?.visible, true))

/** enabled=true 的事件 → onXxx，合并进组件 props */
const runtimeEventProps = computed(() =>
  buildRuntimeEventProps(
    props.schema.events?.[uuid.value] as any,
    runtimeState.value,
  ),
)

const rawStyles = computed(() => props.schema.styles?.[uuid.value])

const tag = computed(() => config.value?.elTagName as string | undefined)

/** model 双向绑定：控件变更写回 runtime state */
const onModelUpdate = (value: unknown) => {
  const raw = props.schema.props?.[uuid.value]
  const modes = props.schema.propBindModes?.[uuid.value]
  if (tag.value === 'GrowTabs' || tag.value === 'GrowCollapse') {
    writeContainerActiveValue(injectedRuntimeState, raw, modes, value)
    return
  }
  writeModelBinding(injectedRuntimeState, raw, modes, value)
}

/** ColumnBar 确认：回写自身 columns，并同步关联表格可见列 */
const onColumnBarConfirm = (columns: unknown) => {
  const raw = props.schema.props?.[uuid.value]
  if (!raw || !Array.isArray(columns)) return

  const modes = props.schema.propBindModes?.[uuid.value]
  const nextColumns = columns.map((item) =>
    item && typeof item === 'object' ? { ...(item as object) } : item,
  )

  const written = writeBoundPropValue(
    injectedRuntimeState,
    raw,
    modes,
    'columns',
    nextColumns,
  )
  if (!written) {
    // 新引用，确保列设置组件重新按 visible 恢复勾选
    raw.columns = nextColumns
  }

  if (raw.columnsSource === 'table' && raw.tableUuid) {
    const tableProps = props.schema.props?.[String(raw.tableUuid)]
    if (tableProps && Array.isArray(tableProps.columns)) {
      tableProps.columns = applyColumnBarVisibleToTableColumns(
        tableProps.columns,
        nextColumns as any,
        String(raw.nodeKey || 'field'),
      )
      // 与表格最终可见性对齐，避免列设置仍显示旧勾选
      raw.columns = toColumnBarItems(tableProps.columns)
    }
  }
}

const isChild = computed(() => Boolean(config.value?.isChild))
const isBasicLeaf = computed(
  () => config.value?.elType === 'basic' && !config.value?.isChild,
)
const isModuleLeaf = computed(
  () => config.value?.elType === 'eleModule' && !config.value?.isChild,
)
const showFooter = computed(() => Boolean(rawProps.value.showFooter))
const showHeaderExtra = computed(() => Boolean(rawProps.value.showHeaderExtra))

const useLayoutMainHeight = computed(
  () =>
    tag.value === 'GrowTable' &&
    (rawProps.value?.height === 'layout-main' || Boolean(rawProps.value?.fitLayoutMainHeight)),
)

/**
 * 布局容器在本节点 provide 主区域尺寸（设计器 inject 备用）
 */
const layoutMainSizeBridge = reactive<LayoutMainSize>({ width: 0, height: 0 })
const nodeTagAtSetup =
  props.schema.renderArgument?.[props.node.uuid]?.elTagName
if (nodeTagAtSetup === 'GrowLayout') {
  provide(LAYOUT_MAIN_SIZE, layoutMainSizeBridge)
}

const layoutMainSize = inject<LayoutMainSize | null>(LAYOUT_MAIN_SIZE, null)

const basicTag = computed(() => resolveBasicTag(tag.value, rawProps.value))
const basicProps = computed(() => ({
  ...normalizeBasicProps(tag.value || '', rawProps.value),
  ...runtimeEventProps.value,
}))
const basicText = computed(() => resolveBasicText(tag.value, rawProps.value))
const moduleProps = computed(() => {
  const modes = props.schema.propBindModes?.[uuid.value]
  const sourceRaw = props.schema.props?.[uuid.value] || {}
  let source = rawProps.value
  if (tag.value === 'GrowTabs' || tag.value === 'GrowCollapse') {
    const active = resolveContainerActiveValue(
      sourceRaw,
      modes,
      runtimeState.value,
      { collapse: tag.value === 'GrowCollapse' },
    )
    source = { ...rawProps.value, modelValue: active }
  }
  const info = normalizeModuleProps(tag.value || '', source)
  if (tag.value === 'GrowTable' && useLayoutMainHeight.value) {
    // 走本地 WatchBox 分支时不在这里写 height
    Reflect.deleteProperty(info, 'height')
  }
  const eventProps = { ...runtimeEventProps.value }
  if (tag.value === 'GrowColumnBar') {
    const userConfirm = eventProps.onConfirm
    eventProps.onConfirm = (...args: unknown[]) => {
      onColumnBarConfirm(args[0])
      if (typeof userConfirm === 'function') userConfirm(...args)
    }
  }
  return {
    ...info,
    ...eventProps,
  }
})
/** 适应主区域时透传除 height 外的表格 props */
const tableBaseProps = computed(() => {
  const info = normalizeModuleProps('GrowTable', rawProps.value)
  Reflect.deleteProperty(info, 'height')
  Reflect.deleteProperty(info, 'fitLayoutMainHeight')
  return {
    ...info,
    ...runtimeEventProps.value,
  }
})
/** 列配置变化时强制重建表格，确保列属性生效 */
const tableColumnsKey = computed(
  () => `cols:${tableColumnsSignature(rawProps.value?.columns)}`,
)
const scrollbarModuleProps = computed(() => ({
  ...normalizeModuleProps(tag.value || '', rawProps.value),
  ...runtimeEventProps.value,
}))
/** 有自定义内容插槽时，不再传 content，避免与 default slot 冲突 */
const popoverModuleProps = computed(() => {
  const info = normalizeModuleProps(tag.value || '', rawProps.value)
  if (contentChildren.value.length) {
    Reflect.deleteProperty(info, 'content')
  }
  return {
    ...info,
    ...runtimeEventProps.value,
  }
})

const nodeStyle = computed(() => resolveNodeStyle(rawStyles.value))
const nodeClass = computed(() => resolveNodeClass(rawStyles.value))
const scrollbarBodyStyle = computed(() => {
  const height = toRendererRelativeSize(rawProps.value?.height)
  const maxHeight = toRendererRelativeSize(rawProps.value?.['max-height'])
  return {
    minHeight: height || maxHeight || '200px',
  }
})
const isFormFullWidth = computed(() =>
  Boolean(tag.value && FORM_MODULE_FULL_WIDTH_TAGS.has(tag.value)),
)

/** 判断：条件求值结果 */
const conditionPassed = computed(() => coerceBool(rawProps.value?.when, false))

/** 循环：规范化列表并生成带 item/index 的作用域 */
const loopEntries = computed(() => {
  const raw = rawProps.value?.data
  const list = Array.isArray(raw) ? raw : []
  const itemKey = String(rawProps.value?.itemKey || 'item').trim() || 'item'
  const indexKey = String(rawProps.value?.indexKey || 'index').trim() || 'index'
  return list.map((item, index) => ({
    key: `${uuid.value}:${index}`,
    extra: {
      [itemKey]: item,
      [indexKey]: index,
    } as Record<string, unknown>,
  }))
})
</script>

<style scoped>
.grow-card-header-extra {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  box-sizing: border-box;
}

.grow-card-header-extra__title {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grow-card-header-extra__option {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  box-sizing: border-box;
}

.grow-scrollbar-frame {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.grow-scrollbar-host {
  width: 100%;
  box-sizing: border-box;
}

.grow-scrollbar-body {
  box-sizing: border-box;
  width: 100%;
}

.grow-tooltip-trigger {
  display: inline-block;
  vertical-align: top;
  max-width: 100%;
  box-sizing: border-box;
}

.grow-tooltip-trigger__placeholder {
  display: inline-block;
  padding: 4px 10px;
  border: 1px dashed var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.grow-upload-trigger {
  display: inline-block;
  vertical-align: top;
  max-width: 100%;
  box-sizing: border-box;
}

.grow-upload-trigger__placeholder {
  display: inline-block;
  padding: 4px 10px;
  border: 1px dashed var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-color-secondary, #909399);
}

.grow-popover-trigger {
  display: inline-block;
  vertical-align: top;
  max-width: 100%;
  box-sizing: border-box;
}

.grow-table-layout-main {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 120px;
}

.grow-table-layout-main__watch {
  position: absolute !important;
  inset: 0;
  width: auto !important;
  height: auto !important;
  min-width: 0;
  min-height: 0;
}

.grow-table-layout-main :deep(.grow-watch-box) {
  position: absolute !important;
  inset: 0;
  width: auto !important;
  height: auto !important;
  min-width: 0;
  min-height: 0;
}

/* display:contents 不打断布局；hidden 等价 v-show=false */
.grow-render-node {
  display: contents;
}

.grow-render-node--hidden {
  display: none !important;
}
</style>
