<template>
  <div class="data-prep-playground">
    <GrowDataPrepDesigner v-model="dataset" @save="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GrowDataPrepDesigner,
  createDataPrepDataset,
  ensureDemoDataset,
  type DataPrepDataset,
} from '@grow-admin-rock/data-prep'

defineOptions({
  name: 'DataPrepPlaygroundPage',
})

const seeded = ensureDemoDataset()

const dataset = ref<DataPrepDataset>(
  seeded[0] ||
    createDataPrepDataset({
      name: '未命名数据集',
      schemaRefs: [{ schemaId: 'schema_demo_sales', schemaName: 'demo_sales' }],
    }),
)

const onSaved = (value: DataPrepDataset) => {
  dataset.value = value
}
</script>

<style scoped>
.data-prep-playground {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
