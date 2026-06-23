<template>
  <div class="p-6">
    <h1 class="mb-3 m-0 text-xl font-semibold text-text">菜单子集测试子页</h1>
    <p class="mb-4 m-0 text-sm leading-[1.6] text-text-secondary">
      当前路由：<code class="rounded bg-layout px-1.5 py-0.5">{{ route.name }}</code>，路径：<code class="rounded bg-layout px-1.5 py-0.5">{{ route.path }}</code>
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
