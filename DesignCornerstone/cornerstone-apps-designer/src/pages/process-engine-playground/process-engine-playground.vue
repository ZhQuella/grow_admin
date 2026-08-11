<template>
  <div class="process-engine-playground">
    <GrowProcessDesigner v-model="flow" @save="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GrowProcessDesigner,
  createProcessFlow,
  type ProcessFlow,
} from '@grow-admin-rock/process-engine'

defineOptions({
  name: 'ProcessEnginePlaygroundPage',
})

const flow = ref<ProcessFlow>(
  createProcessFlow({
    name: '未命名流程',
  }),
)

const onSaved = (value: ProcessFlow) => {
  flow.value = value
}
</script>

<style scoped>
.process-engine-playground {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
