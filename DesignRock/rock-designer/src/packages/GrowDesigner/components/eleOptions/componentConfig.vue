<template>
  <div class="component-config">
    <GrowForm
      v-if="renderList.length"
      label-width="130px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <GrowFormItem v-for="(item, index) in renderList" :key="index">
        <template #label>
          {{ item.name }}
          <GrowTooltip v-if="item.describe" :content="item.describe" placement="left">
            <div class="component-config__help">
              <GrowIconify icon="carbon:help" :size="14" />
            </div>
          </GrowTooltip>
        </template>
        <template #default>
          <component
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

.component-config__empty {
  margin: 24px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-color-secondary);
}
</style>
