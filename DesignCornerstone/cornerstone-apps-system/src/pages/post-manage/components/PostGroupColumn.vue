<script lang="ts" setup>
import { useDriverComponent, RockComponent } from '@grow-admin-rock/components'

defineOptions({
  name: 'PostGroupColumn',
  inheritAttrs: false,
})

const TableColumn = useDriverComponent(RockComponent.TableColumn)
</script>

<template>
  <component :is="TableColumn" v-bind="$attrs">
    <slot />
  </component>
</template>
