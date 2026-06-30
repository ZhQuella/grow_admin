<script lang="ts" setup>
defineProps<{
  icon: string
}>()
</script>

<template>
  <span class="inline-flex h-[18px] w-5 items-center justify-center rounded-sm bg-[linear-gradient(-225deg,#d5dbe4,#f8f8f8)] px-0.5 shadow-[inset_0_-2px_0_0_#cdcde6,inset_0_0_1px_1px_#fff,0_1px_2px_1px_rgba(30,35,90,0.4)]">
    <GrowIconify :icon="icon" :size="12" />
  </span>
</template>
