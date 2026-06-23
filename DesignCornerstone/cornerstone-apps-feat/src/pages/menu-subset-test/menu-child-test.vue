<template>
  <div class="p-6">
    <h1 class="mb-3 m-0 text-xl font-semibold text-text">菜单子集测试页</h1>
    <p class="mb-4 m-0 text-sm leading-[1.6] text-text-secondary">
      通过 <code class="rounded bg-layout px-1.5 py-0.5">useRouteNavigate</code> 跳转到子页面。
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
