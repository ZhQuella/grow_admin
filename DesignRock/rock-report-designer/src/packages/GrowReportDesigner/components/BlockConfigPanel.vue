<template>
  <div class="box-border flex h-full min-h-0 flex-col" @click.stop>
    <div class="shrink-0 px-1">
      <GrowTabs v-model="activeTab" size="small" stretch>
        <GrowTabPane label="报表配置" name="report" />
        <GrowTabPane label="数据绑定" name="data" />
        <GrowTabPane label="基础信息" name="basic" />
      </GrowTabs>
    </div>

    <GrowScrollbar class="min-h-0 flex-1">
      <BlockDataBindingPanel
        v-if="activeTab === 'data'"
        :item="item"
        :variable-options="variableOptions"
        @change="onPanelChange"
      />
      <component
        v-else
        :is="activePanel"
        :item="item"
        @change="onPanelChange"
      />
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReportLayoutItem } from '../static/layout'
import BasicConfigPanel from './BasicConfigPanel.vue'
import ReportConfigPanel from './ReportConfigPanel.vue'
import BlockDataBindingPanel from './BlockDataBindingPanel.vue'

defineOptions({
  name: 'BlockConfigPanel',
})

withDefaults(
  defineProps<{
    item: ReportLayoutItem
    variableOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    variableOptions: () => [],
  },
)

const emit = defineEmits<{
  change: [
    patch: Partial<
      Pick<ReportLayoutItem, 'title' | 'showTitle' | 'chartType' | 'chartConfig' | 'dataBinding'>
    >,
  ]
}>()

const activeTab = ref('report')

const panelMap = {
  report: ReportConfigPanel,
  basic: BasicConfigPanel,
} as const

const activePanel = computed(() => panelMap[activeTab.value as keyof typeof panelMap])

const onPanelChange = (
  patch: Partial<
    Pick<ReportLayoutItem, 'title' | 'showTitle' | 'chartType' | 'chartConfig' | 'dataBinding'>
  >,
) => {
  emit('change', patch)
}
</script>
