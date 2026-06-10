<template>
  <ElDrawer v-model="model" v-bind="$attrs">
    <slot />
  </ElDrawer>
</template>
<script lang="ts" setup>
import { ElDrawer } from 'element-plus'

defineOptions({ name: 'Drawer' })

const model = defineModel<boolean>({ default: false })
</script>
