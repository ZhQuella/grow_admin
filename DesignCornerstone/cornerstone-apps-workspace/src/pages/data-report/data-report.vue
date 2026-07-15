<template>
  <GridLayout
    v-model:layout="layout"
    :col-num="24"
    :row-height="30"
    :is-draggable="draggable"
    :is-resizable="resizable"
    :vertical-compact="true"
    :use-css-transforms="true"
  >
    <GridItem
      v-for="item in layout"
      :key="item.i"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
    >
      <el-card class="data-report-card">
        <template #header>
          <span>{{ item.title }}</span>
        </template>
        <component :is="item.componentName" height="100%" />
      </el-card>
    </GridItem>
  </GridLayout>
</template>

<script lang="ts" setup>
import { GridItem, GridLayout } from 'vue3-grid-layout'
import { ref } from 'vue'
import EffectScatter from '../../components/dashboard/data-report/EffectScatter.vue'
import GradientStackedArea from '../../components/dashboard/data-report/GradientStackedArea.vue'
import HalfDoughnut from '../../components/dashboard/data-report/HalfDoughnut.vue'
import MixedLineAndBar from '../../components/dashboard/data-report/MixedLineAndBar.vue'
import ThemeRiver from '../../components/dashboard/data-report/ThemeRiver.vue'

defineOptions({
  name: 'DataReportPage',
})

const draggable = ref(true)
const resizable = ref(true)

const layout = [
  {
    x: 0,
    y: 0,
    w: 24,
    h: 11,
    i: 0,
    componentName: GradientStackedArea,
    title: '渐变堆叠面积图',
  },
  {
    x: 0,
    y: 11,
    w: 8,
    h: 10,
    i: 1,
    componentName: MixedLineAndBar,
    title: '折柱混合',
  },
  {
    x: 8,
    y: 11,
    w: 8,
    h: 10,
    i: 2,
    componentName: EffectScatter,
    title: '涟漪特效散点图',
  },
  {
    x: 16,
    y: 11,
    w: 8,
    h: 10,
    i: 3,
    componentName: HalfDoughnut,
    title: '半环形图',
  },
  {
    x: 0,
    y: 20,
    w: 24,
    h: 12,
    i: 4,
    componentName: ThemeRiver,
    title: '主题河流图',
  },
]
</script>

<style scoped>
.data-report-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
}

.data-report-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 10px;
}

:deep(.vue-grid-item) {
  overflow: hidden;
}
</style>
