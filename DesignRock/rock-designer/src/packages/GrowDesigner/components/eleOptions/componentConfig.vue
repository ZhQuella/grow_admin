<template>
  <div class="component-config">
    <GrowForm
      v-if="renderList.length"
      label-width="130px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <GrowFormItem
        v-for="(item, index) in renderList"
        :key="index"
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
            v-model="currentPropsConfig[item.modelKey]"
            :bind-mode="getBindMode(item.modelKey)"
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
  'PropVariableBind',
  'PropSwitchBind',
  'PropFunctionBind',
])

const isCustomOption = (item: PropConfigItem) => CUSTOM_OPTION_TYPES.has(item.eleType)

const renderList = computed(() => {
  const tag = currentBasicConfig.value?.elTagName
  const list = elementPropsMap[tag] || []
  return [...list, ...COMMON_VISIBILITY_PROPS]
})

const getBindMode = (modelKey: string): PropBindMode =>
  normalizePropBindMode(currentBindModes.value?.[modelKey])

const setBindMode = (modelKey: string, mode: PropBindMode) => {
  emit('update:currentBindModes', {
    ...(currentBindModes.value || {}),
    [modelKey]: normalizePropBindMode(mode) || PROP_BIND_MODE_TEXT,
  })
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
