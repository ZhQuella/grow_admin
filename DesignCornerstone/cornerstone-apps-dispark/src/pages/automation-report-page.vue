<template>
  <div class="dispark-page">
    <div>报表页面承载组件待实现</div>
    <div>页面 ID：{{ pageId }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'AutomationReportPage' })

const route = useRoute()
const pageId = computed(() => route.path.split('/').filter(Boolean).pop() || '')
</script>

<style scoped>
.dispark-page {
  padding: 24px;
}
</style>
