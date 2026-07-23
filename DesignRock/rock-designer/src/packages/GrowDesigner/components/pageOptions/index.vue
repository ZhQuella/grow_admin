<template>
  <div class="page-options">
    <div class="page-options__header">
      <span class="page-options__title">页面配置</span>
      <span class="page-options__meta">未选中组件</span>
    </div>
    <div class="page-options__tabs">
      <GrowTabs v-model="tabModel" stretch>
        <GrowTabPane label="属性" name="props" />
        <GrowTabPane label="事件" name="events" />
        <GrowTabPane label="高级" name="renderArgument" />
      </GrowTabs>
    </div>
    <GrowScrollbar class="page-options__scroll">
      <configurationComponent v-if="tabModel === 'props'" :config="config" />
      <eventConfig
        v-else-if="tabModel === 'events'"
        :current-events-config="pageEvents"
        :event-options-override="PAGE_LIFECYCLE_EVENTS"
        @update:current-events-config="onUpdatePageEvents"
      />
      <p v-else class="page-options__placeholder">该面板建设中</p>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import configurationComponent from '../configurationComponent/index.vue'
import eventConfig from '../eleOptions/eventConfig.vue'
import { PAGE_LIFECYCLE_EVENTS } from '../../static/elementEvents'
import type { DesignerEventItem } from '../../static/elementEvents/types'

defineOptions({ name: 'pageOptions' })

const tabModel = ref('props')
const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
})

const ensurePageConfig = () => {
  if (!props.config.pageConfig) {
    props.config.pageConfig = {}
  }
  return props.config.pageConfig
}

/** 页面事件存在 pageConfig.events */
const pageEvents = computed(
  () => (props.config?.pageConfig?.events || {}) as Record<string, DesignerEventItem>,
)

const onUpdatePageEvents = (value: Record<string, DesignerEventItem>) => {
  ensurePageConfig().events = value
}
</script>

<style lang="scss" scoped>
.page-options {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.page-options__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color);
}

.page-options__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.page-options__meta {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.page-options__tabs {
  flex-shrink: 0;
  padding: 0 8px;
}

.page-options__scroll {
  flex: 1;
  min-height: 0;
}

.page-options__placeholder {
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}
</style>
