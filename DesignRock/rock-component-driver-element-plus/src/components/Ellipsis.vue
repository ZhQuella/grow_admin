<template><span class="grow-ellipsis" v-bind="$attrs"><slot /></span></template>
<script lang="ts" setup>
defineOptions({ name: 'Ellipsis' })
</script>
<style scoped>.grow-ellipsis{display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}</style>