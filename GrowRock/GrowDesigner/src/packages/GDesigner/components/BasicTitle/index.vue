<template>
  <component :is="level">{{ context }}</component>
</template>

<script setup lang="ts">
import { toRefs } from "vue"

interface PropsType {
  level: string
  context: string
}

const props = withDefaults(defineProps<PropsType>(), {
  level: 'h1',
  context: ''
});

const { level, context } = toRefs(props)
</script>

<style scoped>

</style>