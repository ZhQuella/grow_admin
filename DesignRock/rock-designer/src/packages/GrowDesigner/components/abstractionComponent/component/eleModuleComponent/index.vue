<template>
  <template v-if="!isSocket">
    <div
      v-if="isUnsupported"
      class="designer-unsupported"
    >
      {{ config.elName || config.elTagName }}（暂未接入）
    </div>
    <component v-else :is="config.elTagName" v-bind="propsInfo">
      <span v-if="config.elTagName === 'GrowButton'">{{ propsInfo.content }}</span>
    </component>
  </template>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

interface PropsType {
  config: any
  propsInfo: any
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({}),
})

const { config, propsInfo } = toRefs(props)

const isUnsupported = computed(() => Boolean(config.value.unsupported))

const isSocket = computed(() => {
  const slotMap = ['GrowCard', 'GrowTabs', 'GrowRow']
  return slotMap.includes(config.value.elTagName)
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
