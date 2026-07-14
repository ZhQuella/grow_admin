<template>
  <div class="p-6">
    <h1 class="mb-3 m-0 text-xl font-semibold text-text">混合模式 · 仅后端注册</h1>
    <p class="m-0 text-sm leading-[1.6] text-text-secondary">
      本页位于「权限演示」目录，只来自接口
      <code class="rounded bg-layout px-1.5 py-0.5">/menu/list</code>，不在前端
      <code class="rounded bg-layout px-1.5 py-0.5">toFeatRouteConfigs</code> 中。MIXTURE 下与前端独有页合到同一目录。
    </p>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'MixtureBackDemoPage',
})
</script>
