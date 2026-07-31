<template>
  <div class="ele-options">
    <div class="ele-options__header">
      <span class="ele-options__title">组件配置</span>
      <span class="ele-options__meta">已选中</span>
    </div>
    <div class="ele-options__tabs">
      <GrowTabs v-model="tabModel" stretch>
        <GrowTabPane label="属性" name="props" />
        <GrowTabPane label="样式" name="styles" />
        <GrowTabPane label="事件" name="events" />
        <GrowTabPane label="高级" name="renderArgument" />
      </GrowTabs>
    </div>
    <GrowScrollbar class="ele-options__scroll">
      <component
        :is="renderConfigComponent"
        :key="`${tabModel}-${activeUUID}`"
        :activeUUID="activeUUID"
        :currentBasicConfig="currentBasicConfig"
        :currentPropsConfig="currentPropsConfig"
        :currentStylesConfig="currentStylesConfig"
        :currentBindModes="currentBindModes"
        :currentEventsConfig="currentEventsConfig"
        @update:currentStylesConfig="onUpdateStyles"
        @update:currentBindModes="onUpdateBindModes"
        @update:currentEventsConfig="onUpdateEvents"
      />
      <p v-if="!renderConfigComponent" class="ele-options__placeholder">该面板建设中</p>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed } from 'vue'
import type { DesignerEventItem } from '../../static/elementEvents/types'

defineOptions({ name: 'eleOptions' })

const props = defineProps({
  activeUUID: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
})

const { activeUUID, config } = toRefs(props)
const tabModel = ref('props')

const currentBasicConfig = computed(() => config.value['renderArgument'][activeUUID.value])
const currentPropsConfig = computed(() => config.value['props'][activeUUID.value])
const currentStylesConfig = computed(() => config.value.styles[activeUUID.value] || {})
const currentBindModes = computed(
  () => config.value.propBindModes?.[activeUUID.value] || {},
)
const currentEventsConfig = computed(
  () => config.value.events?.[activeUUID.value] || {},
)

const onUpdateStyles = (value: Record<string, any>) => {
  config.value.styles[activeUUID.value] = value
}

const onUpdateBindModes = (value: Record<string, string>) => {
  if (!config.value.propBindModes) {
    config.value.propBindModes = {}
  }
  config.value.propBindModes[activeUUID.value] = value
}

const onUpdateEvents = (value: Record<string, DesignerEventItem>) => {
  if (!config.value.events) {
    config.value.events = {}
  }
  config.value.events[activeUUID.value] = value
}

const renderConfigComponent = computed(() => {
  const renderMap: Record<string, string> = {
    props: 'componentConfig',
    styles: 'styleConfig',
    events: 'eventConfig',
    renderArgument: 'advancedConfig',
  }
  return renderMap[tabModel.value] || null
})
</script>

<script lang="ts">
import componentConfig from './componentConfig.vue'
import styleConfig from './styleConfig.vue'
import eventConfig from './eventConfig.vue'
import advancedConfig from './advancedConfig.vue'

export default {
  components: {
    componentConfig,
    styleConfig,
    eventConfig,
    advancedConfig,
  },
}
</script>

<style lang="scss" scoped>
.ele-options {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.ele-options__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color);
}

.ele-options__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.ele-options__meta {
  font-size: 12px;
  color: var(--primary-color);
}

.ele-options__tabs {
  flex-shrink: 0;
  padding: 0 8px;
}

.ele-options__scroll {
  flex: 1;
  min-height: 0;
}

.ele-options__placeholder {
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}
</style>
