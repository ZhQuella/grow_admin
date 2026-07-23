<script lang="ts" setup>
import { RockComponent } from '#/RockComponent'

defineOptions({
  name: RockComponent.Loop,
  customOptions: {
    isPresetComponent: true,
  },
})
</script>

<template>
  <div class="grow-loop" v-bind="$attrs">
    <slot />
  </div>
</template>
