<template>
  <div class="report-designer-playground">
    <GrowReportDesigner />
  </div>
</template>

<script setup lang="ts">
import { GrowReportDesigner } from '@grow-admin-rock/report-designer'

defineOptions({
  name: 'ReportDesignerPlaygroundPage',
})
</script>

<style scoped>
.report-designer-playground {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
