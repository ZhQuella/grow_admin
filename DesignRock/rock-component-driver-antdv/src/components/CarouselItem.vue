<template>
  <div class="grow-carousel-item" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CarouselItem' })
</script>
