<script lang="ts" setup>
import { RockComponent } from '#/RockComponent'

defineOptions({
  name: RockComponent.Condition,
  customOptions: {
    isPresetComponent: true,
  },
})
</script>

<template>
  <div class="grow-condition" v-bind="$attrs">
    <slot />
  </div>
</template>
