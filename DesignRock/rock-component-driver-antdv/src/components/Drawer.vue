<template>
  <ADrawer v-model:open="model" v-bind="$attrs">
    <slot />
  </ADrawer>
</template>
<script lang="ts" setup>
import { Drawer as ADrawer } from 'ant-design-vue'

defineOptions({ name: 'Drawer' })

const model = defineModel<boolean>({ default: false })
</script>
