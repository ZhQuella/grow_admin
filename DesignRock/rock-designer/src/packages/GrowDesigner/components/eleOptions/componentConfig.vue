<template>
  <div class="component-config">
    <GrowForm
      v-if="renderList.length"
      label-width="130px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <template v-for="(item, index) in renderList" :key="index">
        <div
          v-if="item.eleType === 'PropSection'"
          class="component-config__section"
        >
          <div class="component-config__section-title">{{ item.name }}</div>
          <p v-if="item.describe" class="component-config__section-desc">
            {{ item.describe }}
          </p>
        </div>
        <GrowFormItem
          v-else
          :class="{ 'component-config__item--custom': isCustomOption(item) }"
        >
        <template #label>
          {{ item.name }}
          <GrowTooltip v-if="item.describe" :content="item.describe" placement="left">
            <div class="component-config__help">
              <GrowIconify icon="carbon:help" :size="14" />
            </div>
          </GrowTooltip>
        </template>
        <template #default>
          <ChildPaneNames
            v-if="item.eleType === 'ChildPaneNames'"
            v-bind="item.props || {}"
          />
          <ChildColSpans
            v-else-if="item.eleType === 'ChildColSpans'"
            v-bind="item.props || {}"
          />
          <PropDimensionInput
            v-else-if="item.eleType === 'PropDimensionInput'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
          />
          <PropTableHeight
            v-else-if="item.eleType === 'PropTableHeight'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
          />
          <PropTableColumns
            v-else-if="item.eleType === 'PropTableColumns'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <PropPaginationLayout
            v-else-if="item.eleType === 'PropPaginationLayout'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
          />
          <PropColumnBarColumns
            v-else-if="item.eleType === 'PropColumnBarColumns'"
            v-bind="item.props || {}"
          />
          <PropSearchFields
            v-else-if="item.eleType === 'PropSearchFields'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <PropCarouselItems
            v-else-if="item.eleType === 'PropCarouselItems'"
            v-bind="item.props || {}"
          />
          <PropStepsItems
            v-else-if="item.eleType === 'PropStepsItems'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <PropDropdownItems
            v-else-if="item.eleType === 'PropDropdownItems'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
          />
          <PropVariableBind
            v-else-if="item.eleType === 'PropVariableBind'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <PropSwitchBind
            v-else-if="item.eleType === 'PropSwitchBind'"
            v-bind="item.props || {}"
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <PropFunctionBind
            v-else-if="item.eleType === 'PropFunctionBind'"
            v-bind="item.props || {}"
            :model-value="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
            @update:model-value="(v) => setPropValue(item.modelKey, v)"
            @update:bind-mode="(mode) => setBindMode(item.modelKey, mode)"
          />
          <component
            v-else
            :is="item.eleType"
            v-bind="item.props || {}"
            class="component-config__control w-full"
            clearable
            v-model="currentPropsConfig[item.modelKey]"
          />
        </template>
        </GrowFormItem>
      </template>
    </GrowForm>
    <p v-else class="component-config__empty">当前组件暂无属性配置</p>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { elementPropsMap } from '../../static/elementInfo'
import ChildPaneNames from '../../optionComponent/ChildPaneNames/index.vue'
import ChildColSpans from '../../optionComponent/ChildColSpans/index.vue'
import PropDimensionInput from '../../optionComponent/PropDimensionInput/index.vue'
import PropTableHeight from '../../optionComponent/PropTableHeight/index.vue'
import PropTableColumns from '../../optionComponent/PropTableColumns/index.vue'
import PropPaginationLayout from '../../optionComponent/PropPaginationLayout/index.vue'
import PropColumnBarColumns from '../../optionComponent/PropColumnBarColumns/index.vue'
import PropSearchFields from '../../optionComponent/PropSearchFields/index.vue'
import PropCarouselItems from '../../optionComponent/PropCarouselItems/index.vue'
import PropStepsItems from '../../optionComponent/PropStepsItems/index.vue'
import PropDropdownItems from '../../optionComponent/PropDropdownItems/index.vue'
import PropVariableBind from '../../optionComponent/PropVariableBind/index.vue'
import PropSwitchBind from '../../optionComponent/PropSwitchBind/index.vue'
import PropFunctionBind from '../../optionComponent/PropFunctionBind/index.vue'
import {
  COMMON_VISIBILITY_PROPS,
  type PropConfigItem,
} from '../../static/elementInfo/shared'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'

const props = defineProps({
  activeUUID: {
    type: String,
    default: '',
  },
  currentBasicConfig: {
    type: Object,
    default: () => ({}),
  },
  currentPropsConfig: {
    type: Object,
    default: () => ({}),
  },
  /** uuid 下各 modelKey 的输入模式 */
  currentBindModes: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits<{
  'update:currentBindModes': [value: Record<string, PropBindMode>]
}>()

const { currentBasicConfig, currentPropsConfig, currentBindModes } = toRefs(props)

const CUSTOM_OPTION_TYPES = new Set([
  'ChildPaneNames',
  'ChildColSpans',
  'PropDimensionInput',
  'PropTableHeight',
  'PropTableColumns',
  'PropPaginationLayout',
  'PropColumnBarColumns',
  'PropSearchFields',
  'PropCarouselItems',
  'PropStepsItems',
  'PropDropdownItems',
  'PropVariableBind',
  'PropSwitchBind',
  'PropFunctionBind',
])

const isCustomOption = (item: PropConfigItem) => CUSTOM_OPTION_TYPES.has(item.eleType)

const renderList = computed(() => {
  const tag = currentBasicConfig.value?.elTagName
  const list = elementPropsMap[tag] || []
  // 组件配置已内联「显示/渲染」时不再追加，便于自定义排序
  const hasVisibility = list.some(
    (item) => item.modelKey === 'visible' || item.modelKey === 'render',
  )
  return hasVisibility ? list : [...list, ...COMMON_VISIBILITY_PROPS]
})

const getBindMode = (modelKey: string): PropBindMode =>
  normalizePropBindMode(currentBindModes.value?.[modelKey])

const setBindMode = (modelKey: string, mode: PropBindMode) => {
  emit('update:currentBindModes', {
    ...(currentBindModes.value || {}),
    [modelKey]: normalizePropBindMode(mode) || PROP_BIND_MODE_TEXT,
  })
}

/** 函数 prop 清空时删除键，避免 "" 覆盖组件默认回调（如 beforeFilter） */
const setPropValue = (modelKey: string, value: unknown) => {
  const target = currentPropsConfig.value
  if (!target || typeof target !== 'object') return
  if (value == null || value === '') {
    Reflect.deleteProperty(target, modelKey)
    return
  }
  target[modelKey] = value
}
</script>

<style scoped>
.component-config {
  height: 100%;
  padding: 10px;
}

.component-config__help {
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.component-config__section {
  margin: 12px 0 8px;
  padding: 8px 0 4px;
  border-top: 1px dashed var(--layout-border-color, #dcdfe6);
}

.component-config__section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  color: var(--text-color, #303133);
}

.component-config__section-desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-color-secondary, #909399);
}

.component-config__control {
  width: 100%;
}

.component-config__item--custom :deep(.el-form-item__content),
.component-config__item--custom :deep(.n-form-item-blank) {
  display: block;
  width: 100%;
}

.component-config__empty {
  margin: 24px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}
</style>
