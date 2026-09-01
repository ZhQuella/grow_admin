<template>
  <div class="org-chart">
    <div class="org-chart__toolbar">
      <GrowSpace>
        <GrowButton size="small" @click="resetView">重置视图</GrowButton>
        <span class="org-chart__tip">大圆为部门，小圆为人员；点击节点查看详情</span>
      </GrowSpace>
      <GrowSearchBar :search="searchList" :default-data="query" @search="onSearch" />
    </div>
    <div v-loading="loading" class="org-chart__stage">
      <GrowWatchBox class="org-chart__watch">
        <template #default="{ height }">
          <div
            ref="chartRef"
            class="org-chart__canvas"
            :style="{ height: height > 0 ? `${height}px` : '100%' }"
          />
        </template>
      </GrowWatchBox>
      <OrgChartDetail
        :visible="detailVisible"
        :loading="detailLoading"
        :dept="selectedDept"
        :dept-detail="deptDetail"
        :dept-related="deptRelated"
        :person="selectedPerson"
        :person-detail="personDetail"
        :post="selectedPost"
        :post-detail="postDetail"
        @close="clearSelection"
        @node="selectNode"
        @post="selectPost"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { useEcharts } from '@grow-admin-rock/hooks'
import OrgChartDetail from './components/OrgChartDetail.vue'
import { useOrgChart } from './use/useOrgChart'

defineOptions({ name: 'OrgChartPage' })

const chartRef = ref<HTMLDivElement | null>(null)
const { setOptions, getInstance } = useEcharts(chartRef, { renderer: 'canvas' })
const {
  loading,
  searchList,
  query,
  chartOption,
  selectedDept,
  selectedPerson,
  selectedPost,
  selectedId,
  detailVisible,
  detailLoading,
  deptDetail,
  deptRelated,
  personDetail,
  postDetail,
  bootstrap,
  onSearch,
  selectNode,
  toggleCollapse,
  selectPost,
  clearSelection,
} = useOrgChart()

function onBlankClick(event: { target?: unknown }) {
  if (!event.target) clearSelection()
}

function bindChartEvents() {
  const chart = getInstance()
  if (!chart) return
  chart.off('click')
  chart.off('dblclick')
  chart.on('click', (params: any) => {
    if (params?.dataType === 'node' && params.data?.id) selectNode(String(params.data.id))
  })
  chart.on('dblclick', (params: any) => {
    if (params?.dataType === 'node' && params.data?.id) toggleCollapse(String(params.data.id))
  })
  const zr = chart.getZr()
  zr.off('click', onBlankClick)
  zr.on('click', onBlankClick)
}

async function renderChart() {
  if (!chartRef.value) return
  await setOptions(chartOption.value)
  bindChartEvents()
  if (!selectedId.value) return
  const chart = getInstance()
  const data = (chartOption.value.series as any)?.[0]?.data || []
  const index = data.findIndex((item: { id: string }) => item.id === selectedId.value)
  if (chart && index >= 0) {
    chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: index })
  }
}

function resetView() {
  void renderChart()
}

watch(
  [chartOption, chartRef],
  () => {
    if (chartRef.value) void renderChart()
  },
  { flush: 'post' },
)

onMounted(() => {
  void bootstrap()
})
</script>

<style scoped>
.org-chart {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--component-background-color);
}

.org-chart__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
}

.org-chart__stage {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.org-chart__watch,
.org-chart__canvas {
  height: 100%;
  min-height: 0;
}

.org-chart__tip {
  color: var(--text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}
</style>
