<template>
  <div class="schema-designer-playground">
    <GrowSchemaDesigner />
  </div>
</template>

<script setup lang="ts">
import { GrowSchemaDesigner } from '@grow-admin-rock/schema-designer'

defineOptions({
  name: 'SchemaDesignerPlaygroundPage',
})
</script>

<style scoped>
.schema-designer-playground {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
