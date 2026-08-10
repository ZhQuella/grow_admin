<template>
  <div class="data-clean-playground">
    <GrowDataCleanDesigner v-model="flow" @save="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GrowDataCleanDesigner,
  createCleanFlow,
  type CleanFlow,
} from '@grow-admin-rock/data-clean'

defineOptions({
  name: 'DataCleanPlaygroundPage',
})

const flow = ref<CleanFlow>(
  createCleanFlow({
    name: '未命名清洗流',
  }),
)

const onSaved = (value: CleanFlow) => {
  flow.value = value
}
</script>

<style scoped>
.data-clean-playground {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
