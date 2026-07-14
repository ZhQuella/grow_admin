<template>
  <div class="p-6">
    <h1 class="mb-3 m-0 text-xl font-semibold text-text">混合模式 · 仅前端注册</h1>
    <p class="m-0 text-sm leading-[1.6] text-text-secondary">
      本页位于「权限演示」目录，只存在于前端
      <code class="rounded bg-layout px-1.5 py-0.5">toFeatRouteConfigs</code>，不在
      <code class="rounded bg-layout px-1.5 py-0.5">/menu/list</code> 中。MIXTURE 下与后端独有页合到同一目录。
    </p>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'MixtureFrontDemoPage',
})
</script>
