<template>
  <GrowRow :gutter="10" class="w-full p-[10px]">
    <GrowCol :span="24" class="enter-y">
      <GrowCard>
        <template #header>
          <span>流量趋势</span>
        </template>
        <VisitAnalysis />
      </GrowCard>
    </GrowCol>
    <GrowCol :span="24" class="enter-y mt-[10px]">
      <GrowCard>
        <template #header>
          <span>访问量</span>
        </template>
        <VisitAnalysisBar />
      </GrowCard>
    </GrowCol>
    <GrowCol :span="8" class="enter-y mt-[10px]">
      <GrowCard>
        <template #header>
          <span>转化率</span>
        </template>
        <VisitRadar />
      </GrowCard>
    </GrowCol>
    <GrowCol :span="8" class="enter-y mt-[10px]">
      <GrowCard>
        <template #header>
          <span>访问来源</span>
        </template>
        <VisitSource />
      </GrowCard>
    </GrowCol>
    <GrowCol :span="8" class="enter-y mt-[10px]">
      <GrowCard>
        <template #header>
          <span>成交占比</span>
        </template>
        <SalesProductPie />
      </GrowCard>
    </GrowCol>
  </GrowRow>
</template>

<script lang="ts" setup>
import SalesProductPie from '../../components/dashboard/analysis/SalesProductPie.vue'
import VisitAnalysis from '../../components/dashboard/analysis/VisitAnalysis.vue'
import VisitAnalysisBar from '../../components/dashboard/analysis/VisitAnalysisBar.vue'
import VisitRadar from '../../components/dashboard/analysis/VisitRadar.vue'
import VisitSource from '../../components/dashboard/analysis/VisitSource.vue'

defineOptions({
  name: 'AnalysisPage',
})
</script>
