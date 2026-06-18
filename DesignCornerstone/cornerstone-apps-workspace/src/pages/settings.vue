<template>
  <div class="settings-page">
    <h1 class="settings-page__title">设置中心</h1>
    <p class="settings-page__desc">这是工作区模块的第二个示例页面，可通过侧边菜单切换访问。</p>
    <p>{{ num }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
defineOptions({
  name: 'WorkspaceSettingsPage',
})

const num = ref(Math.random())

</script>

<style scoped>
.settings-page {
  padding: 24px;
}

.settings-page__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.settings-page__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
}
</style>
