<template>
  <GrowPopover placement="bottom" trigger="hover" :width="280">
    <template #reference>
      <GrowButton link type="primary">查看示例</GrowButton>
    </template>
    <pre class="m-0 text-xs leading-relaxed text-text">{{ DATA_EXAMPLE_CODE }}</pre>
  </GrowPopover>
</template>

<script setup lang="ts">
import { DATA_EXAMPLE_CODE } from './dataExample'

defineOptions({ name: 'DataExamplePopover' })
</script>
