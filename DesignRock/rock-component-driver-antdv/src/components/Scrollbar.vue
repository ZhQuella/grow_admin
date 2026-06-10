<template><div class="grow-scrollbar" v-bind="$attrs" style="overflow:auto"><slot /></div></template>
<script lang="ts" setup>
defineOptions({ name: 'Scrollbar' })
</script>