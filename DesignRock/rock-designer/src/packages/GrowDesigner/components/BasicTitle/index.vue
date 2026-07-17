<template>
  <component :is="tag">{{ context }}</component>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

interface PropsType {
  level: string
  context: string
}

const props = withDefaults(defineProps<PropsType>(), {
  level: 'h1',
  context: '',
})

const { level, context } = toRefs(props)

const tag = computed(() => {
  const raw = String(level.value || 'h1').toLowerCase()
  return /^h[1-6]$/.test(raw) ? raw : 'h1'
})
</script>
