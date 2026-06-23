<template>
  <div class="menu-child-test-sub-page">
    <h1 class="menu-child-test-sub-page__title">菜单子集测试子页</h1>
    <p class="menu-child-test-sub-page__desc">
      当前路由：<code>{{ route.name }}</code>，路径：<code>{{ route.path }}</code>
    </p>
    <GrowButton @click="backToTestPage">
      返回测试页
    </GrowButton>
  </div>
</template>

<script lang="ts" setup>
import { useRouteNavigate } from '@grow-admin-rock/hooks'
import { useRoute } from '@grow-admin-rock/middleware-router'

defineOptions({
  name: 'MenuChildTestSubPage',
})

const route = useRoute()
const { go } = useRouteNavigate()

function backToTestPage() {
  go({ name: 'MenuChildTest' })
}
</script>

<style scoped>
.menu-child-test-sub-page {
  padding: 24px;
}

.menu-child-test-sub-page__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.menu-child-test-sub-page__desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
}

.menu-child-test-sub-page__desc code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--layout-container-background-color);
}
</style>
