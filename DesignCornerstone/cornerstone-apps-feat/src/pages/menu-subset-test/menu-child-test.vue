<template>
  <div class="menu-child-test-page">
    <h1 class="menu-child-test-page__title">菜单子集测试页</h1>
    <p class="menu-child-test-page__desc">
      通过 <code>useRouteNavigate</code> 跳转到子页面。
    </p>
    <GrowButton type="primary" @click="openSubPage">
      打开菜单子集测试子页
    </GrowButton>
  </div>
</template>

<script lang="ts" setup>
import { useRouteNavigate } from '@grow-admin-rock/hooks'

defineOptions({
  name: 'MenuChildTestPage',
})

const { go } = useRouteNavigate()

function openSubPage() {
  go({ name: 'MenuChildTestSub' })
}
</script>

<style scoped>
.menu-child-test-page {
  padding: 24px;
}

.menu-child-test-page__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.menu-child-test-page__desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
}

.menu-child-test-page__desc code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--layout-container-background-color);
}
</style>
