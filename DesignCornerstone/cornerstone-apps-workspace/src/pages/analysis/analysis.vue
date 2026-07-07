<template>
  <el-scrollbar class="h-full">
    <el-row :gutter="10" class="w-full p-[10px]">
      <el-col :span="24" class="enter-y">
        <el-card>
          <template #header>
            <span>流量趋势</span>
          </template>
          <VisitAnalysis />
        </el-card>
      </el-col>
      <el-col :span="24" class="enter-y mt-[10px]">
        <el-card>
          <template #header>
            <span>访问量</span>
          </template>
          <VisitAnalysisBar />
        </el-card>
      </el-col>
      <el-col :span="8" class="enter-y mt-[10px]">
        <el-card>
          <template #header>
            <span>转化率</span>
          </template>
          <VisitRadar />
        </el-card>
      </el-col>
      <el-col :span="8" class="enter-y mt-[10px]">
        <el-card>
          <template #header>
            <span>访问来源</span>
          </template>
          <VisitSource />
        </el-card>
      </el-col>
      <el-col :span="8" class="enter-y mt-[10px]">
        <el-card>
          <template #header>
            <span>成交占比</span>
          </template>
          <SalesProductPie />
        </el-card>
      </el-col>
    </el-row>
  </el-scrollbar>
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
