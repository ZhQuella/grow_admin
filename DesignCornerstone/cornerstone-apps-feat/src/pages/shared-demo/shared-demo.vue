<template>
  <div class="p-6">
    <h1 class="mb-3 m-0 text-xl font-semibold text-text">共享组件测试页</h1>
    <p class="m-0 text-sm leading-[1.6] text-text-secondary">
      路由 <code class="rounded bg-layout px-1.5 py-0.5">{{ route.name }}</code> 与组件 <code class="rounded bg-layout px-1.5 py-0.5">{{ route.meta.componentName }}</code> 共用同一 .vue 文件。
    </p>
    <p>{{ num }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'

defineOptions({
  name: 'SharedDemoPage',
})

const route = useRoute()

const num = ref(Math.random())

</script>
