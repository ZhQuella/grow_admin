<template>
  <template v-if="!config || config.unsupported">
    <!-- 未接入组件：预览阶段跳过 -->
  </template>

  <!-- 基础元素（叶子） -->
  <component
    v-else-if="isBasicLeaf && basicTag"
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
          v-bind="tableBaseProps"
          :height="watchHeight > 0 ? watchHeight : undefined"
          class="w-full"
        />
      </template>
    </GrowWatchBox>
  </div>

  <!-- 模块叶子 -->
  <component
    v-else-if="isModuleLeaf && tag"
    :is="tag"
    v-bind="moduleProps"
    :class="[nodeClass, { 'w-full': isFormFullWidth }]"
    :style="nodeStyle"
  >
    <span v-if="tag === 'GrowButton'">{{ rawProps.content }}</span>
    <span v-else-if="tag === 'GrowLink'">{{ rawProps.content }}</span>
    <template v-else-if="tag === 'GrowEllipsis'">{{ rawProps.content }}</template>
  </component>
</template>

<script setup lang="ts">
import { computed, inject, provide, reactive, type ComputedRef } from 'vue'
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
  resolveBoundProps,
} from '../utils/resolveBoundProps'
import RenderPageLayout from './RenderPageLayout.vue'

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
const injectedRuntimeState = inject<ComputedRef<Record<string, unknown>> | null>(
  GROW_RUNTIME_STATE,
  null,
)
const runtimeState = computed(
  () =>
    injectedRuntimeState?.value ??
    buildRuntimeState(props.schema.dataSource),
)
/** 按 propBindModes 求值后的 props（绑定字段已解析为展示值） */
const rawProps = computed(() =>
  resolveBoundProps(
    props.schema.props?.[uuid.value] || {},
    props.schema.propBindModes?.[uuid.value],
    runtimeState.value,
  ),
)
const rawStyles = computed(() => props.schema.styles?.[uuid.value])

const tag = computed(() => config.value?.elTagName as string | undefined)
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
const basicProps = computed(() => normalizeBasicProps(tag.value || '', rawProps.value))
const basicText = computed(() => resolveBasicText(tag.value, rawProps.value))
const moduleProps = computed(() => {
  const info = normalizeModuleProps(tag.value || '', rawProps.value)
  if (tag.value === 'GrowTable' && useLayoutMainHeight.value) {
    // 走本地 WatchBox 分支时不在这里写 height
    Reflect.deleteProperty(info, 'height')
  }
  return info
})
/** 适应主区域时透传除 height 外的表格 props */
const tableBaseProps = computed(() => {
  const info = normalizeModuleProps('GrowTable', rawProps.value)
  Reflect.deleteProperty(info, 'height')
  Reflect.deleteProperty(info, 'fitLayoutMainHeight')
  return info
})
const scrollbarModuleProps = computed(() =>
  normalizeModuleProps(tag.value || '', rawProps.value),
)
/** 有自定义内容插槽时，不再传 content，避免与 default slot 冲突 */
const popoverModuleProps = computed(() => {
  const info = normalizeModuleProps(tag.value || '', rawProps.value)
  if (contentChildren.value.length) {
    Reflect.deleteProperty(info, 'content')
  }
  return info
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
</style>
