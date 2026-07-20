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
import type { PropConfigItem } from '../../static/elementInfo/shared'

const props = defineProps({
  currentBasicConfig: {
    type: Object,
    default: () => ({}),
  },
  currentPropsConfig: {
    type: Object,
    default: () => ({}),
  },
})

const { currentBasicConfig, currentPropsConfig } = toRefs(props)

const CUSTOM_OPTION_TYPES = new Set([
  'ChildPaneNames',
  'ChildColSpans',
  'PropDimensionInput',
  'PropTableHeight',
])

const isCustomOption = (item: PropConfigItem) => CUSTOM_OPTION_TYPES.has(item.eleType)

const renderList = computed(() => {
  const tag = currentBasicConfig.value?.elTagName
  return elementPropsMap[tag] || []
})
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
