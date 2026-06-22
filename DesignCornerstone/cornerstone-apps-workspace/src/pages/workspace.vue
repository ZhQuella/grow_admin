<template>
  <div class="workspace-page">
    <h1 class="workspace-page__title">工作区</h1>
    <p class="workspace-page__desc">这是一个空白示例页面，可作为 Home 的子路由承载业务内容。</p>
    <p>{{ num }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
defineOptions({
  name: 'WorkspacePage',
})

const num = ref(Math.random())

</script>

<style scoped>
.workspace-page {
  padding: 24px;
}

.workspace-page__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.workspace-page__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
}
</style>
