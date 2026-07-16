<template>
  <div class="designer-playground">
    <GrowDesigner />
  </div>
</template>

<script setup lang="ts">
import { GrowDesigner } from '@grow-admin-rock/designer'

defineOptions({
  name: 'DesignerPlaygroundPage',
})
</script>

<style scoped>
.designer-playground {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
