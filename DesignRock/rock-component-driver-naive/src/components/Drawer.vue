<template>
  <NDrawer v-model:show="model" v-bind="$attrs">
    <slot />
  </NDrawer>
</template>
<script lang="ts" setup>
import { NDrawer } from 'naive-ui'

defineOptions({ name: 'Drawer' })

const model = defineModel<boolean>({ default: false })
</script>
