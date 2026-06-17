<template>
  <div class="shared-demo-page">
    <h1 class="shared-demo-page__title">共享组件测试页</h1>
    <p class="shared-demo-page__desc">
      路由 <code>{{ route.name }}</code> 与组件 <code>{{ route.meta.componentName }}</code> 共用同一 .vue 文件。
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

defineOptions({
  name: 'SharedDemoPage',
})

const route = useRoute()
</script>

<style scoped>
.shared-demo-page {
  padding: 24px;
}

.shared-demo-page__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.shared-demo-page__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
}

.shared-demo-page__desc code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--layout-container-background-color);
}
</style>
